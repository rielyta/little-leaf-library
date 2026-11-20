import { Suspense, type ReactNode } from "react";
import { Page } from "react-pdf";
import { NoteIcon } from "@/components/reader/HighlightToolbars";
import type { FloatingAnchor } from "@/components/reader/useTextSelection";
import { cn } from "@/lib/cn";
import { HIGHLIGHT_COLORS, lastRect, type Highlight } from "@/lib/highlights";

export type PageSide = "left" | "right" | "single";

const READER_PAGE_SELECTOR = "[data-reader-page]";
const NOTE_MARKER_MAX_X = 0.94;

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

export function findReaderPage(node: Node | null) {
  const element = node instanceof Element ? node : node?.parentElement;
  const page = element?.closest<HTMLElement>(READER_PAGE_SELECTOR) ?? null;

  return page ? { element: page, pageNumber: Number(page.dataset.readerPage) } : null;
}

const noteMarkerClass =
  "absolute z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-lg border-[1.5px] border-ink bg-[#FBE3A0] text-ink shadow-[0_2px_0_#E7B9C4]";

type PaperPageProps = {
  pageNumber: number | null;
  image: string | undefined;
  width: number;
  height: number;
  side: PageSide;
  highlights?: Highlight[];
  withTextLayer?: boolean;
  onOpenNote?: (highlightId: string, anchor: FloatingAnchor) => void;
  children?: ReactNode;
};

export function PaperPage({
  pageNumber,
  image,
  width,
  height,
  side,
  highlights = [],
  withTextLayer = false,
  onOpenNote,
  children,
}: PaperPageProps) {
  const notedHighlights = highlights.filter((highlight) => highlight.note && highlight.rects.length > 0);

  return (
    <div
      data-reader-page={withTextLayer && pageNumber ? pageNumber : undefined}
      className={cn("group/page relative overflow-hidden bg-paper", pageCorners[side])}
      style={{ width, height }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" draggable={false} decoding="sync" className="absolute inset-0 size-full select-none" />
      )}

      {pageNumber && !image && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="size-8 animate-pulse rounded-full bg-wood-100" />
        </div>
      )}

      {highlights.map((highlight) =>
        highlight.rects.map((rect, index) => (
          <span
            key={`${highlight.id}-${index}`}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-[2px] mix-blend-multiply"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`,
              backgroundColor: HIGHLIGHT_COLORS[highlight.color].fill,
            }}
          />
        )),
      )}

      {pageNumber && withTextLayer && (
        <div className="absolute inset-0 [&_.react-pdf\_\_Page]:!bg-transparent">
          <Suspense fallback={null}>
            <Page
              pageNumber={pageNumber}
              width={width}
              renderMode="none"
              renderTextLayer
              renderAnnotationLayer={false}
              loading={null}
            />
          </Suspense>
        </div>
      )}

      <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", spineShadow[side])} />

      {notedHighlights.map((highlight) => {
        const rect = lastRect(highlight.rects);
        const position = {
          left: `${Math.min(rect.x + rect.width, NOTE_MARKER_MAX_X) * 100}%`,
          top: `${(rect.y + rect.height / 2) * 100}%`,
        };

        if (!onOpenNote) {
          return (
            <span key={highlight.id} aria-hidden="true" className={cn(noteMarkerClass, "pointer-events-none")} style={position}>
              <NoteIcon className="size-3.5" />
            </span>
          );
        }

        return (
          <button
            key={highlight.id}
            type="button"
            aria-label={`Open your comment on page ${highlight.page}`}
            title={highlight.note ?? undefined}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              onOpenNote(highlight.id, { x: bounds.left + bounds.width / 2, top: bounds.top, bottom: bounds.bottom });
            }}
            className={cn(noteMarkerClass, "transition-transform hover:scale-110")}
            style={position}
          >
            <NoteIcon className="size-3.5" />
          </button>
        );
      })}

      {children}
    </div>
  );
}