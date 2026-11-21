"use client";

import { useEffect, useState } from "react";
import { loadBookFile } from "@/lib/book-cache";

export type CachedBookFile =
  | { status: "loading"; progress: number | null }
  | { status: "ready"; url: string }
  | { status: "error" };

export function useCachedBookFile(bookId: string, fileUrl: string) {
  const [state, setState] = useState<CachedBookFile>({ status: "loading", progress: null });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    loadBookFile(bookId, fileUrl, {
      signal: controller.signal,
      onProgress: (progress) => setState({ status: "loading", progress }),
    })
      .then((blob) => {
        if (controller.signal.aborted) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setState({ status: "ready", url: objectUrl });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      });

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [bookId, fileUrl]);

  return state;
}