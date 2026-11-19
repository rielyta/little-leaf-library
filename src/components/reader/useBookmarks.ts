import { useState, useTransition } from "react";
import { toggleBookmark } from "@/app/(app)/read/[id]/actions";

export function useBookmarks(bookId: string, initialBookmarks: number[]) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(page: number) {
    const previous = bookmarks;
    const next = previous.includes(page)
      ? previous.filter((bookmarked) => bookmarked !== page)
      : [...previous, page].sort((a, b) => a - b);

    setBookmarks(next);
    setError(null);

    startTransition(async () => {
      const result = await toggleBookmark(bookId, page);

      if (result.ok) {
        setBookmarks(result.bookmarks);
      } else {
        setBookmarks(previous);
        setError(result.error);
      }
    });
  }

  return {
    bookmarks,
    error,
    toggle,
    isBookmarked: (page: number) => bookmarks.includes(page),
  };
}