import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

const MAX_CACHED_PAGES = 16;
const MAX_PIXEL_RATIO = 2;
const RESIZE_SETTLE_MS = 150;
const IMAGE_QUALITY = 0.92;

type CachedPage = {
  url: string;
  width: number;
};

async function renderPageToDataUrl(pdf: PDFDocumentProxy, pageNumber: number, cssWidth: number) {
  const page = await pdf.getPage(pageNumber);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const scale = (cssWidth / page.getViewport({ scale: 1 }).width) * pixelRatio;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const canvasContext = canvas.getContext("2d");

  if (!canvasContext) {
    throw new Error("Canvas is not supported in this browser");
  }

  const renderParameters = { canvas, canvasContext, viewport } as unknown as Parameters<PDFPageProxy["render"]>[0];
  await page.render(renderParameters).promise;

  const url = canvas.toDataURL("image/webp", IMAGE_QUALITY);
  canvas.width = 0;
  canvas.height = 0;

  return url;
}

export function usePageImages(pdf: PDFDocumentProxy | null, width: number) {
  const [settledWidth, setSettledWidth] = useState(width);
  const [images, setImages] = useState<ReadonlyMap<number, string>>(() => new Map());
  const cacheRef = useRef(new Map<number, CachedPage>());
  const pendingRef = useRef(new Set<string>());

  useEffect(() => {
    const timer = setTimeout(() => setSettledWidth(width), RESIZE_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [width]);

  const publish = useCallback(() => {
    setImages(new Map([...cacheRef.current].map(([pageNumber, entry]) => [pageNumber, entry.url])));
  }, []);

  const prune = useCallback((keep: number[]) => {
    const cache = cacheRef.current;

    for (const pageNumber of cache.keys()) {
      if (cache.size <= MAX_CACHED_PAGES) {
        break;
      }

      if (!keep.includes(pageNumber)) {
        cache.delete(pageNumber);
      }
    }
  }, []);

  const request = useCallback(
    async (pageNumbers: number[]) => {
      if (!pdf || settledWidth <= 0) {
        return;
      }

      for (const pageNumber of pageNumbers) {
        const key = `${pageNumber}@${settledWidth}`;

        if (cacheRef.current.get(pageNumber)?.width === settledWidth || pendingRef.current.has(key)) {
          continue;
        }

        pendingRef.current.add(key);

        try {
          const url = await renderPageToDataUrl(pdf, pageNumber, settledWidth);
          cacheRef.current.delete(pageNumber);
          cacheRef.current.set(pageNumber, { url, width: settledWidth });
          prune(pageNumbers);
          publish();
        } catch {
          continue;
        } finally {
          pendingRef.current.delete(key);
        }
      }
    },
    [pdf, settledWidth, prune, publish],
  );

  return { images, request };
}