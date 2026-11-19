"use client";

import dynamic from "next/dynamic";
import type { BookReaderProps } from "@/components/reader/BookReader";
import { ReaderStatus } from "@/components/reader/ReaderStatus";

const BookReader = dynamic(() => import("@/components/reader/BookReader").then((module) => module.BookReader), {
  ssr: false,
  loading: () => <ReaderStatus message="Opening your book..." />,
});

export function Reader(props: BookReaderProps) {
  return <BookReader {...props} />;
}