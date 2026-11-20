"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { BookmarkRibbon } from "@/components/reader/BookmarkRibbon";
import { HighlightMenu, NoteEditor, SelectionToolbar } from "@/components/reader/HighlightToolbars";
import { NotesPanel } from "@/components/reader/NotesPanel";
import { findReaderPage, PaperPage, type PageSide } from "@/components/reader/PaperPage";
import { ArrowButton, FullscreenIcon, NotesIcon, ToolbarButton, ZoomControls } from "@/components/reader/ReaderControls";
import { ReaderStatus } from "@/components/reader/ReaderStatus";
import { TranslateCard } from "@/components/reader/TranslateCard";
import { TurningLeaf } from "@/components/reader/TurningLeaf";
import { useBookmarks } from "@/components/reader/useBookmarks";
import { useFullscreen } from "@/components/reader/useFullscreen";
import { useHighlights } from "@/components/reader/useHighlights";
import { usePageImages } from "@/components/reader/usePageImages";
import { usePageTurn } from "@/components/reader/usePageTurn";
import { useReadingProgress } from "@/components/reader/useReadingProgress";
import { useSavedWords } from "@/components/reader/useSavedWords";
import { useTextSelection, type FloatingAnchor, type PendingSelection } from "@/components/reader/useTextSelection";
import { useTranslateLanguage } from "@/components/reader/useTranslateLanguage";
import { useZoom } from "@/components/reader/useZoom";
import { useElementSize } from "@/hooks/useElementSize";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { DEFAULT_COMMENT_COLOR, rectsContainPoint, type Highlight } from "@/lib/highlights";
import {
  clampPage,
  computeLayers,
  firstPageOfView,
  furthestPage,
  lastView,
  pageLabel,
  spreadPages,
  viewForPage,
  type TurnDirection,
} from "@/lib/reader";
import { normalizeSelection, TRANSLATE_TEXT_MAX_LENGTH, type SavedWord } from "@/lib/translate";

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
const DRAG_COMPLETE_THRESHOLD = 0.25;
const CLICK_TOLERANCE_PX = 4;

export type BookReaderProps = {
  bookId: string;
  fileUrl: string;
  pageCount: number;
  initialPage: number;
  initialBookmarks: number[];
  initialHighlights: Highlight[];
  initialSavedWords: SavedWord[];
};

type DragState = {
  direction: TurnDirection;
  startX: number;
  moved: boolean;
};

type ActiveHighlight = {
  id: string;
  anchor: FloatingAnchor;
};

type NoteEditorState =
  | { kind: "new"; selection: PendingSelection }
  | { kind: "edit"; highlightId: string; anchor: FloatingAnchor };

type TranslationState = {
  text: string;
  page: number;
  anchor: FloatingAnchor;
};

export function BookReader({
  bookId,
  fileUrl,
  pageCount,
  initialPage,
  initialBookmarks,
  initialHighlights,
  initialSavedWords,
}: BookReaderProps) {
  const isWide = useMediaQuery("(min-width: 1024px)");
  const mode = isWide ? "double" : "single";
  const columns = mode === "double" ? 2 : 1;

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [anchorPage, setAnchorPage] = useState(() => clampPage(initialPage, pageCount));
  const [pageRatio, setPageRatio] = useState(DEFAULT_PAGE_RATIO);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<ActiveHighlight | null>(null);
  const [noteEditor, setNoteEditor] = useState<NoteEditorState | null>(null);
  const [translation, setTranslation] = useState<TranslationState | null>(null);
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const bookRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const { zoom, canZoomIn, canZoomOut, zoomIn, zoomOut, resetZoom } = useZoom();
  const fullscreen = useFullscreen<HTMLDivElement>();
  const bookmarks = useBookmarks(bookId, initialBookmarks);
  const highlights = useHighlights(bookId, initialHighlights);
  const savedWords = useSavedWords(bookId, initialSavedWords);
  const translateLanguage = useTranslateLanguage();

  const view = viewForPage(anchorPage, mode);
  const maxView = lastView(mode, pageCount);
  const currentSpread = spreadPages(view, mode, pageCount);
  const visiblePages = [currentSpread.left, currentSpread.right].filter((page): page is number => page !== null);

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

  const isSettled = turn === null;
  const { selection, clear: clearSelection } = useTextSelection(bookRef, isSettled);

  const layers = computeLayers(view, mode, pageCount, turn);
  const currentFurthest = furthestPage(view, mode, pageCount);
  const progressPercent = Math.round((currentFurthest / pageCount) * 100);
  const findHighlight = (id: string) => highlights.highlights.find((highlight) => highlight.id === id);
  const activeHighlightData = activeHighlight ? findHighlight(activeHighlight.id) : undefined;
  const editingHighlight = noteEditor?.kind === "edit" ? findHighlight(noteEditor.highlightId) : undefined;
  const readerError = bookmarks.error ?? highlights.error ?? savedWords.error;

  useReadingProgress(bookId, currentFurthest);

  function closeFloatingUi() {
    setActiveHighlight(null);
    setNoteEditor(null);
    setTranslation(null);
  }

  function goToPage(page: number) {
    setAnchorPage(clampPage(page, pageCount));

    if (!isWide) {
      setIsNotesOpen(false);
    }
  }

  function openNote(highlightId: string, anchor: FloatingAnchor) {
    setActiveHighlight(null);
    setTranslation(null);
    setNoteEditor({ kind: "edit", highlightId, anchor });
  }

  function openTranslation(current: PendingSelection) {
    const text = normalizeSelection(current.text).slice(0, TRANSLATE_TEXT_MAX_LENGTH);

    if (!text) {
      return;
    }

    setActiveHighlight(null);
    setNoteEditor(null);
    setTranslation({ text, page: current.page, anchor: current.anchor });
    clearSelection();
  }

  useEffect(() => {
    setActiveHighlight(null);
    setNoteEditor(null);
    setTranslation(null);
  }, [view, mode, zoom]);

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
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      if (event.ctrlKey || event.metaKey || event.altKey || target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "escape") {
        closeFloatingUi();
        clearSelection();
      } else if (key === "arrowright") {
        animate("next");
      } else if (key === "arrowleft") {
        animate("prev");
      } else if (key === "+" || key === "=") {
        zoomIn();
      } else if (key === "-") {
        zoomOut();
      } else if (key === "f" && fullscreen.canFullscreen) {
        fullscreen.toggleFullscreen();
      } else if (key === "b" && isSettled && visiblePages[0]) {
        bookmarks.toggle(visiblePages[0]);
      } else if (key === "n") {
        setIsNotesOpen((open) => !open);
      } else if (key === "t" && selection) {
        openTranslation(selection);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function handleBookPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (window.getSelection()?.isCollapsed === false) {
      setActiveHighlight(null);
      return;
    }

    const readerPage = findReaderPage(event.target as Node);

    if (!readerPage) {
      setActiveHighlight(null);
      return;
    }

    const bounds = readerPage.element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const hit = [...(highlights.byPage.get(readerPage.pageNumber) ?? [])]
      .reverse()
      .find((highlight) => rectsContainPoint(highlight.rects, x, y));

    setNoteEditor(null);
    setActiveHighlight(
      hit ? { id: hit.id, anchor: { x: event.clientX, top: event.clientY - 8, bottom: event.clientY + 8 } } : null,
    );
  }

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

  function renderPage(pageNumber: number | null, side: PageSide) {
    return (
      <PaperPage
        pageNumber={pageNumber}
        side={side}
        image={pageNumber ? images.get(pageNumber) : undefined}
        highlights={pageNumber ? highlights.byPage.get(pageNumber) : undefined}
        width={pageWidth}
        height={pageHeight}
        withTextLayer={isSettled}
        onOpenNote={isSettled ? openNote : undefined}
      >
        {pageNumber && isSettled && (
          <BookmarkRibbon page={pageNumber} side={side} active={bookmarks.isBookmarked(pageNumber)} onToggle={bookmarks.toggle} />
        )}
      </PaperPage>
    );
  }

  return (
    <div ref={fullscreen.ref} className="relative flex min-h-0 flex-1 bg-sage-50">
      <div className="flex min-w-0 flex-1 flex-col">
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
            onScroll={closeFloatingUi}
            className={cn("flex h-full min-w-0 flex-1", zoom > 1 ? "scrollbar-none overflow-auto" : "overflow-hidden")}
          >
            {pageWidth > 0 && (
              <div
                className="m-auto flex-none rounded-[14px] border-2 border-ink bg-wood-500 shadow-[0_18px_30px_-18px_#5A4636]"
                style={{ padding: BOOK_PADDING }}
              >
                <div
                  ref={bookRef}
                  onPointerUp={handleBookPointerUp}
                  className="relative flex [perspective:2400px]"
                  style={{ width: pageWidth * columns, height: pageHeight }}
                >
                  {mode === "double" ? (
                    <>
                      {renderPage(layers.left, "left")}
                      {renderPage(layers.right, "right")}
                    </>
                  ) : (
                    renderPage(layers.right, "single")
                  )}

                  {layers.leaf && turn && (
                    <TurningLeaf
                      leaf={layers.leaf}
                      images={images}
                      highlightsByPage={highlights.byPage}
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
              {readerError ? (
                <span role="alert" className="text-xs font-bold text-danger">
                  {readerError}
                </span>
              ) : (
                <span className="hidden text-xs text-ink-soft xl:inline">Select text to highlight, comment or translate. T translate, N notes</span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sage-200">
              <div className="h-full rounded-full bg-sage-400 transition-[width] duration-400" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <ZoomControls zoom={zoom} canZoomIn={canZoomIn} canZoomOut={canZoomOut} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />

          <ToolbarButton label="Notes" active={isNotesOpen} onClick={() => setIsNotesOpen((open) => !open)}>
            <NotesIcon />
          </ToolbarButton>

          {fullscreen.canFullscreen && (
            <ToolbarButton
              label={fullscreen.isFullscreen ? "Exit full screen" : "Full screen"}
              active={fullscreen.isFullscreen}
              onClick={fullscreen.toggleFullscreen}
            >
              <FullscreenIcon active={fullscreen.isFullscreen} />
            </ToolbarButton>
          )}

          <ArrowButton direction="next" disabled={view >= maxView} onClick={() => animate("next")} className="size-11 lg:hidden" />
        </div>
      </div>

      {isNotesOpen && (
        <NotesPanel
          pdf={pdf}
          bookmarks={bookmarks.bookmarks}
          highlights={highlights.highlights}
          savedWords={savedWords.words}
          visiblePages={visiblePages}
          onSelectPage={goToPage}
          onRemoveBookmark={bookmarks.toggle}
          onRemoveHighlight={highlights.remove}
          onRemoveNote={(id) => highlights.saveNote(id, "")}
          onRemoveSavedWord={savedWords.remove}
          onClose={() => setIsNotesOpen(false)}
        />
      )}

      {selection && !activeHighlight && !noteEditor && !translation && (
        <SelectionToolbar
          anchor={selection.anchor}
          onHighlight={(color) => {
            highlights.add({ page: selection.page, color, text: selection.text, rects: selection.rects });
            clearSelection();
          }}
          onComment={() => {
            setNoteEditor({ kind: "new", selection });
            clearSelection();
          }}
          onTranslate={() => openTranslation(selection)}
          onCopy={() => {
            void navigator.clipboard.writeText(selection.text);
            clearSelection();
          }}
        />
      )}

      {activeHighlight && activeHighlightData && !noteEditor && (
        <HighlightMenu
          anchor={activeHighlight.anchor}
          current={activeHighlightData.color}
          hasNote={Boolean(activeHighlightData.note)}
          onRecolor={(color) => {
            highlights.recolor(activeHighlightData.id, color);
            setActiveHighlight(null);
          }}
          onComment={() => openNote(activeHighlightData.id, activeHighlight.anchor)}
          onDelete={() => {
            highlights.remove(activeHighlightData.id);
            setActiveHighlight(null);
          }}
        />
      )}

      {noteEditor?.kind === "new" && (
        <NoteEditor
          key="new-note"
          anchor={noteEditor.selection.anchor}
          quote={noteEditor.selection.text}
          initialNote=""
          isEditing={false}
          onSave={(note) => {
            const { page, text, rects } = noteEditor.selection;
            highlights.add({ page, color: DEFAULT_COMMENT_COLOR, text, rects, note });
            setNoteEditor(null);
          }}
          onCancel={() => setNoteEditor(null)}
        />
      )}

      {noteEditor?.kind === "edit" && editingHighlight && (
        <NoteEditor
          key={editingHighlight.id}
          anchor={noteEditor.anchor}
          quote={editingHighlight.text}
          initialNote={editingHighlight.note ?? ""}
          isEditing={Boolean(editingHighlight.note)}
          onSave={(note) => {
            highlights.saveNote(editingHighlight.id, note);
            setNoteEditor(null);
          }}
          onDelete={() => {
            highlights.saveNote(editingHighlight.id, "");
            setNoteEditor(null);
          }}
          onCancel={() => setNoteEditor(null)}
        />
      )}

      {translation && (
        <TranslateCard
          key={`${translation.page}-${translation.text}`}
          anchor={translation.anchor}
          text={translation.text}
          page={translation.page}
          language={translateLanguage.language}
          savedWord={savedWords.find(translation.text)}
          onLanguageChange={translateLanguage.setLanguage}
          onSave={savedWords.save}
          onUnsave={savedWords.remove}
          onClose={() => setTranslation(null)}
        />
      )}
    </div>
  );
}