import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { findReaderPage } from "@/components/reader/PaperPage";
import { HIGHLIGHT_TEXT_MAX_LENGTH, normalizeRects, type HighlightRect } from "@/lib/highlights";

const SELECTION_SETTLE_MS = 250;
const SELECTING_CLASS = "selecting";

export type FloatingAnchor = {
  x: number;
  top: number;
  bottom: number;
};

export type PendingSelection = {
  page: number;
  text: string;
  rects: HighlightRect[];
  anchor: FloatingAnchor;
};

function clipToPage(rect: DOMRect, page: DOMRect) {
  const left = Math.max(rect.left, page.left);
  const top = Math.max(rect.top, page.top);
  const right = Math.min(rect.right, page.right);
  const bottom = Math.min(rect.bottom, page.bottom);

  if (right <= left || bottom <= top) {
    return null;
  }

  return new DOMRect(left, top, right - left, bottom - top);
}

function readSelection(root: HTMLElement): PendingSelection | null {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const readerPage = findReaderPage(selection.anchorNode);

  if (!readerPage || !root.contains(readerPage.element)) {
    return null;
  }

  const text = selection.toString().replace(/\s+/g, " ").trim().slice(0, HIGHLIGHT_TEXT_MAX_LENGTH);

  if (!text) {
    return null;
  }

  const pageBounds = readerPage.element.getBoundingClientRect();
  const clientRects = Array.from(selection.getRangeAt(0).getClientRects())
    .map((rect) => clipToPage(rect, pageBounds))
    .filter((rect): rect is DOMRect => rect !== null);

  const rects = normalizeRects(clientRects, pageBounds);

  if (rects.length === 0) {
    return null;
  }

  const left = Math.min(...clientRects.map((rect) => rect.left));
  const right = Math.max(...clientRects.map((rect) => rect.right));
  const top = Math.min(...clientRects.map((rect) => rect.top));
  const bottom = Math.max(...clientRects.map((rect) => rect.bottom));

  return {
    page: readerPage.pageNumber,
    text,
    rects,
    anchor: { x: (left + right) / 2, top, bottom },
  };
}

export function useTextSelection(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const [selection, setSelection] = useState<PendingSelection | null>(null);
  const pointerDownRef = useRef(false);
  const activeTextLayerRef = useRef<Element | null>(null);

  const read = useCallback(() => {
    const root = rootRef.current;
    setSelection(enabled && root ? readSelection(root) : null);
  }, [enabled, rootRef]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    function schedule(delay: number) {
      clearTimeout(timer);
      timer = setTimeout(read, delay);
    }

    function releaseTextLayer() {
      activeTextLayerRef.current?.classList.remove(SELECTING_CLASS);
      activeTextLayerRef.current = null;
    }

    function handlePointerDown(event: PointerEvent) {
      pointerDownRef.current = true;

      const textLayer = event.target instanceof Element ? event.target.closest(".textLayer") : null;

      if (textLayer) {
        textLayer.classList.add(SELECTING_CLASS);
        activeTextLayerRef.current = textLayer;
      }
    }

    function handlePointerUp() {
      pointerDownRef.current = false;
      releaseTextLayer();
      schedule(0);
    }

    function handleSelectionChange() {
      if (!pointerDownRef.current) {
        schedule(SELECTION_SETTLE_MS);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      clearTimeout(timer);
      releaseTextLayer();
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [read]);

  const clear = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  return { selection, clear };
}