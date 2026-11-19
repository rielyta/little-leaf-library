import Link from "next/link";
import { readingProgress, spineHeight, spineWidth, type BookOnShelf } from "@/lib/books";

export function BookSpine({ book }: { book: BookOnShelf }) {
  const width = spineWidth(book.pageCount);
  const height = spineHeight(book.id);
  const progress = readingProgress(book);
  const byline = book.author ? `, by ${book.author}` : "";

  return (
    <div className="group relative flex-none hover:z-30 focus-within:z-30">
      <Link
        href={`/read/${book.id}`}
        aria-label={`Read ${book.title}${byline}`}
        className="flex flex-col items-center justify-between rounded-t-[4px] rounded-b-[2px] border-[1.5px] border-ink py-1.75 text-ink-strong transition-transform duration-200 group-hover:-translate-y-2 group-focus-within:-translate-y-2 focus-visible:outline-none"
        style={{ width, height, backgroundColor: book.spineColor }}
      >
        <span className="h-[3px] w-full bg-white/60" />
        <span
          className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-medium [writing-mode:vertical-rl]"
          style={{ maxHeight: height - 26 }}
        >
          {book.title}
        </span>
        <span className="h-[3px] w-full bg-white/60" />
      </Link>

      <div
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-1.5 left-[calc(100%+12px)] z-30 flex w-52.5 flex-col gap-1.5 rounded-2xl border-[1.5px] border-ink bg-paper p-3.5 opacity-0 shadow-[0_5px_0_#E7B9C4] transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <span className="h-1.5 w-7 rounded-full border border-ink" style={{ backgroundColor: book.spineColor }} />
        <strong className="font-display text-base font-semibold leading-tight text-ink-strong">{book.title}</strong>
        {book.author && <span className="text-[13px] text-ink-soft">{book.author}</span>}
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-wood-100">
          <div className="h-full bg-sage-400" style={{ width: `${progress.percent}%` }} />
        </div>
        <span className="text-xs font-bold text-ink-soft">{progress.label}</span>
        <span className="text-xs font-extrabold text-sage-700">Click to read</span>
      </div>
    </div>
  );
}