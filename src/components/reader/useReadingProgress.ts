import { useEffect, useRef } from "react";

const SAVE_DELAY_MS = 800;

function sendProgress(bookId: string, page: number) {
  return fetch(`/api/books/${bookId}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page }),
    keepalive: true,
  });
}

export function useReadingProgress(bookId: string, page: number) {
  const savedPageRef = useRef<number | null>(null);
  const latestPageRef = useRef(page);

  useEffect(() => {
    latestPageRef.current = page;

    if (savedPageRef.current === null) {
      savedPageRef.current = page;
      return;
    }

    if (page === savedPageRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const previous = savedPageRef.current;
      savedPageRef.current = page;

      sendProgress(bookId, page).catch(() => {
        if (savedPageRef.current === page) {
          savedPageRef.current = previous;
        }
      });
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [bookId, page]);

  useEffect(() => {
    function flush() {
      const latest = latestPageRef.current;

      if (savedPageRef.current !== null && latest !== savedPageRef.current) {
        savedPageRef.current = latest;
        void sendProgress(bookId, latest).catch(() => undefined);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flush();
      }
    }

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [bookId]);
}