"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { saveReadingPosition } from "@/app/(app)/read/[id]/actions";
import { ReaderStatus } from "@/components/reader/ReaderStatus";
import { usePageImages } from "@/components/reader/usePageImages";
import { usePageTurn } from "@/components/reader/usePageTurn";
import { useElementSize } from "@/hooks/useElementSize";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import {
  clampPage,
  computeLayers,
  firstPageOfView,
  furthestPage,
  lastView,
  pageLabel,
  spreadPages,
  viewForPage,
  type Leaf,
  type TurnDirection,
} from "@/lib/reader";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const PDFJS_ASSETS = `https://unpkg.com/pdfjs-dist@${pdfjs.version}`;

const DOCUMENT_OPTIONS = {
  cMapUrl: `${PDFJS_ASSETS}/cmaps/`,
  standardFontDataUrl: `${PDFJS_ASSETS}/standard_fonts/`,
  wasmUrl: `${PDFJS_ASSETS}/wasm/`,
};

const DEFAULT_PAGE_RATIO = 0.707;
const BOOK_PADDING = 10;
const BOOK_BORDER = 2;
const BOOK_FRAME_INSET = BOOK_PADDING + BOOK_BORDER;
const SAVE_DELAY_MS = 800;
const DRAG_COMPLETE_THRESHOLD = 0.25;
const CLICK_TOLERANCE_PX = 4;
const TURN_TRANSITION = "transform 650ms cubic-bezier(0.45, 0.05, 0.35, 1)";
const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2];
const ZOOM_STORAGE_KEY = "little-leaf-reader-zoom";

export type BookReaderProps = {
  bookId: string;
  fileUrl: string;
  pageCount: number;
  initialPage: number;
};

type PageSide = "left" | "right" | "single";

type DragState = {
  direction: TurnDirection;
  startX: number;
  moved: boolean;
};

const spineShadow: Record<PageSide, string> = {
  left: "shadow-[inset_-26px_0_28px_-24px_rgba(90,70,54,0.45)]",
  right: "shadow-[inset_26px_0_28px_-24px_rgba(90,70,54,0.45)]",
  single: "shadow-[inset_14px_0_18px_-16px_rgba(90,70,54,0.4)]",
};

const pageCorners: Record<PageSide, string> = {
  left: "rounded-l-lg",
  right: "rounded-r-lg",
  single: "rounded-r-xl rounded-l-sm",
};

function readStoredZoom() {
  try {
    const stored = Number(window.localStorage.getItem(ZOOM_STORAGE_KEY));
    return ZOOM_LEVELS.includes(stored) ? stored : 1;
  } catch {
    return 1;
  }
}

function storeZoom(zoom: number) {
  try {
    window.localStorage.setItem(ZOOM_STORAGE_KEY, String(zoom));
  } catch {
    return;
  }
}

type PaperPageProps = {
  pageNumber: number | null;
  image: string | undefined;
  width: number;
  height: number;
  side: PageSide;
  withTextLayer?: boolean;
};

function PaperPage({ pageNumber, image, width, height, side, withTextLayer = false }: PaperPageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-paper", pageCorners[side])} style={{ width, height }}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" draggable={false} className="absolute inset-0 size-full select-none" />
      )}

      {pageNumber && !image && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="size-8 animate-pulse rounded-full bg-wood-100" />
        </div>
      )}

      {pageNumber && withTextLayer && (
        <div className="absolute inset-0 [&_.react-pdf\_\_Page]:!bg-transparent">
          <Page
            pageNumber={pageNumber}
            width={width}
            renderMode="none"
            renderTextLayer
            renderAnnotationLayer={false}
            loading={null}
          />
        </div>
      )}

      <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", spineShadow[side])} />
    </div>
  );
}

type TurningLeafProps = {
  leaf: Leaf;
  images: ReadonlyMap<number, string>;
  width: number;
  height: number;
  progress: number;
  settling: boolean;
  onTransitionEnd: () => void;
};

function TurningLeaf({ leaf, images, width, height, progress, settling, onTransitionEnd }: TurningLeafProps) {
  const frontSide: PageSide = leaf.side === "left" ? "left" : leaf.side === "right" ? "right" : "single";
  const backSide: PageSide = leaf.side === "left" ? "right" : "left";
  const shade = Math.sin(progress * Math.PI) * 0.22;

  const style: CSSProperties = {
    width,
    height,
    left: leaf.side === "right" ? width : 0,
    transformOrigin: `${leaf.origin} center`,
    transform: `rotateY(${leaf.angle}deg)`,
    transition: settling ? TURN_TRANSITION : "none",
  };

  return (
    <div
      aria-hidden="true"
      onTransitionEnd={onTransitionEnd}
      className="pointer-events-none absolute top-0 z-10 [transform-style:preserve-3d] [will-change:transform]"
      style={style}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        <PaperPage
          pageNumber={leaf.front}
          image={leaf.front ? images.get(leaf.front) : undefined}
          width={width}
          height={height}
          side={frontSide}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-strong to-transparent" style={{ opacity: shade }} />
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <PaperPage
          pageNumber={leaf.back}
          image={leaf.back ? images.get(leaf.back) : undefined}
          width={width}
          height={height}
          side={backSide}
        />
      </div>
    </div>
  );
}

function ArrowButton({ direction, disabled, onClick, className }: { direction: TurnDirection; disabled: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "next" ? "Next page" : "Previous page"}
      className={cn(
        "flex size-13 flex-none items-center justify-center rounded-full border-[1.5px] border-ink bg-paper shadow-[0_4px_0_#CFE3EA] transition-opacity disabled:opacity-40",
        className,
      )}
    >
      <svg viewBox="0 0 22 22" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={direction === "next" ? "M8.5 5l6 6-6 6" : "M13.5 5l-6 6 6 6"} />
      </svg>
    </button>
  );
}

function ZoomControls({ zoom, onChange }: { zoom: number; onChange: (zoom: number) => void }) {
  const index = ZOOM_LEVELS.indexOf(zoom);

  return (
    <div role="group" aria-label="Zoom" className="flex flex-none items-center rounded-full border-[1.5px] border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(ZOOM_LEVELS[index - 1])}
        disabled={index <= 0}
        aria-label="Zoom out"
        className="flex size-10 items-center justify-center rounded-full text-lg font-extrabold disabled:opacity-35"
      >
        −
      </button>
      <button type="button" onClick={() => onChange(1)} aria-label="Fit page to screen" className="min-w-13 text-center text-sm font-extrabold">
        {zoom === 1 ? "Fit" : `${Math.round(zoom * 100)}%`}
      </button>
      <button
        type="button"
        onClick={() => onChange(ZOOM_LEVELS[index + 1])}
        disabled={index >= ZOOM_LEVELS.length - 1}
        aria-label="Zoom in"
        className="flex size-10 items-center justify-center rounded-full text-lg font-extrabold disabled:opacity-35"
      >
        +
      </button>
    </div>
  );
}

function FullscreenButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Exit full screen" : "Full screen"}
      className="flex size-10 flex-none items-center justify-center rounded-full border-[1.5px] border-line bg-white hover:bg-paper"
    >
      <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={active ? "M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4" : "M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4"} />
      </svg>
    </button>
  );
}

export function BookReader({ bookId, fileUrl, pageCount, initialPage }: BookReaderProps) {
  const isWide = useMediaQuery("(min-width: 1024px)");
  const mode = isWide ? "double" : "single";
  const columns = mode === "double" ? 2 : 1;

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [anchorPage, setAnchorPage] = useState(() => clampPage(initialPage, pageCount));
  const [pageRatio, setPageRatio] = useState(DEFAULT_PAGE_RATIO);
  const [zoom, setZoom] = useState(readStoredZoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const hasMountedRef = useRef(false);

  const canFullscreen = document.fullscreenEnabled;
  const isZoomed = zoom > 1;
  const view = viewForPage(anchorPage, mode);
  const maxView = lastView(mode, pageCount);

  const availableWidth = Math.max(0, stageSize.width - BOOK_FRAME_INSET * 2);
  const availableHeight = Math.max(0, stageSize.height - BOOK_FRAME_INSET * 2);
  const fitWidth = Math.min(availableWidth / columns, availableHeight * pageRatio);
  const pageWidth = Math.floor(fitWidth * zoom);
  const pageHeight = Math.floor(pageWidth / pageRatio);

  const { images, request } = usePageImages(pdf, pageWidth);

  const canTurn = (direction: TurnDirection) => (direction === "next" ? view < maxView : view > 0);

  const { turn, animate, drag, release, handleTransitionEnd } = usePageTurn({
    canTurn,
    onTurned: (direction: TurnDirection) => setAnchorPage(firstPageOfView(view + (direction === "next" ? 1 : -1), mode)),
  });

  const layers = computeLayers(view, mode, pageCount, turn);
  const currentFurthest = furthestPage(view, mode, pageCount);
  const progressPercent = Math.round((currentFurthest / pageCount) * 100);
  const isSettled = turn === null;

  function changeZoom(next: number) {
    setZoom(next);
    storeZoom(next);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen();
    }
  }

  useEffect(() => {
    const nearbyViews = [view, view + 1, view - 1, view + 2].filter((candidate) => candidate >= 0 && candidate <= maxView);
    const pages = nearbyViews
      .flatMap((candidate) => {
        const spread = spreadPages(candidate, mode, pageCount);
        return [spread.left, spread.right];
      })
      .filter((page): page is number => page !== null);

    void request(pages);
  }, [view, mode, pageCount, maxView, request]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      void saveReadingPosition(bookId, currentFurthest);
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [bookId, currentFurthest]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      if (event.ctrlKey || event.metaKey || event.altKey || target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      const zoomIndex = ZOOM_LEVELS.indexOf(zoom);

      if (event.key === "ArrowRight") {
        animate("next");
      } else if (event.key === "ArrowLeft") {
        animate("prev");
      } else if ((event.key === "+" || event.key === "=") && zoomIndex < ZOOM_LEVELS.length - 1) {
        changeZoom(ZOOM_LEVELS[zoomIndex + 1]);
      } else if (event.key === "-" && zoomIndex > 0) {
        changeZoom(ZOOM_LEVELS[zoomIndex - 1]);
      } else if (event.key.toLowerCase() === "f" && canFullscreen) {
        toggleFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function handleEdgePointerDown(direction: TurnDirection, event: PointerEvent<HTMLDivElement>) {
    if (turn || !canTurn(direction)) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { direction, startX: event.clientX, moved: false };
    drag(direction, 0);
  }

  function handleEdgePointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = dragRef.current;

    if (!current || pageWidth === 0) {
      return;
    }

    const deltaX = event.clientX - current.startX;

    if (Math.abs(deltaX) > CLICK_TOLERANCE_PX) {
      current.moved = true;
    }

    const distance = current.direction === "next" ? -deltaX : deltaX;
    drag(current.direction, Math.min(1, Math.max(0, distance / (pageWidth * columns))));
  }

  function handleEdgePointerUp() {
    const current = dragRef.current;
    dragRef.current = null;

    if (!current) {
      return;
    }

    release(!current.moved || (turn?.progress ?? 0) > DRAG_COMPLETE_THRESHOLD);
  }

  function edgeZoneProps(direction: TurnDirection) {
    return {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => handleEdgePointerDown(direction, event),
      onPointerMove: handleEdgePointerMove,
      onPointerUp: handleEdgePointerUp,
      onPointerCancel: handleEdgePointerUp,
    };
  }

  function pageProps(pageNumber: number | null, side: PageSide) {
    return {
      pageNumber,
      side,
      image: pageNumber ? images.get(pageNumber) : undefined,
      width: pageWidth,
      height: pageHeight,
      withTextLayer: isSettled,
    };
  }

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col bg-sage-50">
      <Document
        file={fileUrl}
        options={DOCUMENT_OPTIONS}
        onLoadSuccess={async (loadedPdf) => {
          const firstPage = await loadedPdf.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1 });
          setPageRatio(viewport.width / viewport.height);
          setPdf(loadedPdf);
        }}
        loading={<ReaderStatus message="Opening your book..." />}
        error={<ReaderStatus message="We could not open this book. Please try again later." />}
        className="flex min-h-0 flex-1 items-center gap-4 px-3 pt-3 lg:px-5"
      >
        <ArrowButton direction="prev" disabled={view === 0} onClick={() => animate("prev")} className="hidden lg:flex" />

        <div
          ref={stageRef}
          className={cn("flex h-full min-w-0 flex-1", isZoomed ? "scrollbar-none overflow-auto" : "overflow-hidden")}
        >
          {pageWidth > 0 && (
            <div
              className="m-auto flex-none rounded-[14px] border-2 border-ink bg-wood-500 shadow-[0_18px_30px_-18px_#5A4636]"
              style={{ padding: BOOK_PADDING }}
            >
              <div className="relative flex [perspective:2400px]" style={{ width: pageWidth * columns, height: pageHeight }}>
                {mode === "double" ? (
                  <>
                    <PaperPage {...pageProps(layers.left, "left")} />
                    <PaperPage {...pageProps(layers.right, "right")} />
                  </>
                ) : (
                  <PaperPage {...pageProps(layers.right, "single")} />
                )}

                {layers.leaf && turn && (
                  <TurningLeaf
                    leaf={layers.leaf}
                    images={images}
                    width={pageWidth}
                    height={pageHeight}
                    progress={turn.progress}
                    settling={turn.settling}
                    onTransitionEnd={handleTransitionEnd}
                  />
                )}

                <div
                  {...edgeZoneProps("prev")}
                  aria-hidden="true"
                  className={cn("group absolute inset-y-0 left-0 z-20 w-11 touch-none", view > 0 ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
                >
                  <span className="absolute left-1 top-1/2 h-16 w-1.5 -translate-y-1/2 rounded-full bg-wood-200 opacity-60 transition-opacity group-hover:opacity-100" />
                </div>

                <div
                  {...edgeZoneProps("next")}
                  aria-hidden="true"
                  className={cn("group absolute inset-y-0 right-0 z-20 w-11 touch-none", view < maxView ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
                >
                  <span className="absolute right-1 top-1/2 h-16 w-1.5 -translate-y-1/2 rounded-full bg-wood-200 opacity-60 transition-opacity group-hover:opacity-100" />
                  <span className="absolute bottom-0 right-0 size-11 rounded-tl-[18px] bg-[linear-gradient(135deg,transparent_50%,#EAD7C3_50%)] shadow-[-2px_-2px_4px_-2px_#C9B49C]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <ArrowButton direction="next" disabled={view >= maxView} onClick={() => animate("next")} className="hidden lg:flex" />
      </Document>

      <div className="mx-auto flex w-full max-w-240 items-center gap-3 px-4 pb-3 pt-2.5">
        <ArrowButton direction="prev" disabled={view === 0} onClick={() => animate("prev")} className="size-11 lg:hidden" />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <strong aria-live="polite">{pageLabel(view, mode, pageCount)}</strong>
            <span className="hidden text-xs text-ink-soft xl:inline">← → to turn, + − to zoom, F for full screen</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sage-200">
            <div className="h-full rounded-full bg-sage-400 transition-[width] duration-400" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <ZoomControls zoom={zoom} onChange={changeZoom} />
        {canFullscreen && <FullscreenButton active={isFullscreen} onClick={toggleFullscreen} />}

        <ArrowButton direction="next" disabled={view >= maxView} onClick={() => animate("next")} className="size-11 lg:hidden" />
      </div>
    </div>
  );
}