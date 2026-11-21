"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { BookReaderProps } from "@/components/reader/BookReader";
import { ReaderStatus } from "@/components/reader/ReaderStatus";
import { useCachedBookFile } from "@/components/reader/useCachedBookFile";

const loadBookReader = () => import("@/components/reader/BookReader").then((module) => module.BookReader);

const BookReader = dynamic(loadBookReader, {
  ssr: false,
  loading: () => <ReaderStatus message="Opening your book..." />,
});

export function Reader({ fileUrl, ...props }: BookReaderProps) {
  const file = useCachedBookFile(props.bookId, fileUrl);

  useEffect(() => {
    void loadBookReader();
  }, []);

  if (file.status === "error") {
    return <ReaderStatus message="We could not open this book. Please check your connection and try again." />;
  }

  if (file.status === "loading") {
    const message =
      file.progress === null ? "Opening your book..." : `Bringing your book to the shelf... ${Math.round(file.progress * 100)}%`;
    return <ReaderStatus message={message} />;
  }

  return <BookReader {...props} fileUrl={file.url} />;
}