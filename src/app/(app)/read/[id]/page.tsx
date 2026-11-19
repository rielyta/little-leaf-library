import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reader/Reader";
import { listBookmarkPages } from "@/server/bookmarks";
import { getReadableBook } from "@/server/books";
import { listHighlights } from "@/server/highlights";
import { requireSession } from "@/server/session";

type ReadPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ReadPageProps): Promise<Metadata> {
  const { user } = await requireSession();
  const { id } = await params;
  const book = await getReadableBook(user.id, id);

  return { title: book?.title ?? "Book not found" };
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { user } = await requireSession();
  const { id } = await params;
  const book = await getReadableBook(user.id, id);

  if (!book) {
    notFound();
  }

  const [bookmarks, highlights] = await Promise.all([
    listBookmarkPages(user.id, book.id),
    listHighlights(user.id, book.id),
  ]);

  const byline = [book.author, `${book.bookcase.name} bookcase`].filter(Boolean).join(", ");

  return (
    <div className="flex h-dvh flex-col bg-sage-50">
      <header className="flex flex-wrap items-center gap-4 border-b-[1.5px] border-wood-200 bg-cream px-4 py-3 md:px-7">
        <Link
          href="/library"
          className="flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] border-line pl-2.5 pr-4 text-sm font-extrabold hover:bg-white"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5l-5 5 5 5" />
          </svg>
          Back to shelf
        </Link>
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <h1 className="max-w-full truncate font-display text-lg font-semibold text-ink-strong">{book.title}</h1>
          <span className="max-w-full truncate text-[13px] text-ink-soft">{byline}</span>
        </div>
        <span className="hidden w-[8.5rem] md:block" aria-hidden="true" />
      </header>

      <Reader
        bookId={book.id}
        fileUrl={`/api/books/${book.id}/file`}
        pageCount={book.pageCount}
        initialPage={book.lastReadPage || 1}
        initialBookmarks={bookmarks}
        initialHighlights={highlights}
      />
    </div>
  );
}