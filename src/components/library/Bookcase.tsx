import Link from "next/link";
import { BookSpine } from "@/components/library/BookSpine";
import { POT_COLORS, SHELVES_PER_BOOKCASE, WOODS, type BookcaseSummary } from "@/lib/bookcases";
import { arrangeOnShelves } from "@/lib/books";

type BookcaseProps = {
  bookcase: BookcaseSummary;
  index: number;
};

function ShelfPlant({ pot }: { pot: string }) {
  return (
    <svg viewBox="0 0 300 64" className="block h-16 w-full" aria-hidden="true">
      <path d="M228 62h40l-4-22h-32z" fill={pot} stroke="#5A4636" strokeWidth="1.5" />
      <path
        d="M248 40c-2-14-10-24-22-28M248 40c2-16 10-28 22-32M248 40c0-14 0-24 2-34"
        stroke="#5E8C6A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke="#5A4636" strokeWidth="1.2">
        <ellipse cx="228" cy="14" rx="9" ry="5" fill="#9CC5A1" transform="rotate(30 228 14)" />
        <ellipse cx="268" cy="10" rx="9" ry="5" fill="#BFD8C2" transform="rotate(-30 268 10)" />
        <ellipse cx="250" cy="6" rx="5" ry="8" fill="#9CC5A1" />
      </g>
      <rect x="30" y="44" width="34" height="18" rx="3" fill="#FFFDF8" stroke="#5A4636" strokeWidth="1.4" />
      <rect x="34" y="30" width="26" height="14" rx="3" fill={pot} stroke="#5A4636" strokeWidth="1.4" />
    </svg>
  );
}

function EditBookcaseLink({ bookcaseId, name }: { bookcaseId: string; name: string }) {
  return (
    <Link
      href={`/library?edit=${bookcaseId}`}
      scroll={false}
      aria-label={`Edit ${name} bookcase`}
      className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 4.5l5 5L9 20H4v-5z" />
        <path d="M12.5 6.5l5 5" />
      </svg>
    </Link>
  );
}

export function Bookcase({ bookcase, index }: BookcaseProps) {
  const wood = WOODS[bookcase.wood];
  const pot = POT_COLORS[index % POT_COLORS.length];
  const shelves = arrangeOnShelves(bookcase.books, SHELVES_PER_BOOKCASE);
  const isEmpty = bookcase.books.length === 0;

  return (
    <section aria-label={`${bookcase.name} bookcase`} className="relative flex w-75 flex-none snap-start flex-col">
      <ShelfPlant pot={pot} />

      <div
        className="relative flex h-10 items-center justify-center rounded-t-2xl rounded-b-sm border-[1.5px] border-ink px-11"
        style={{ backgroundColor: wood.light }}
      >
        <span className="max-w-full truncate rounded-[10px] border-[1.5px] border-ink bg-paper px-4 py-0.5 font-display text-base font-semibold text-ink-strong">
          {bookcase.name}
        </span>
        <EditBookcaseLink bookcaseId={bookcase.id} name={bookcase.name} />
      </div>

      <div className="relative flex flex-col gap-3 border-[1.5px] border-t-0 border-ink p-3" style={{ backgroundColor: wood.dark }}>
        {shelves.map((shelf, shelfIndex) => (
          <div
            key={shelfIndex}
            className="flex h-29.5 items-end gap-[3px] rounded-sm border-[1.5px] border-b-8 border-ink bg-wood-200 px-2.5"
            style={{ borderBottomColor: wood.light }}
          >
            {shelf.map((book) => (
              <BookSpine key={book.id} book={book} />
            ))}
          </div>
        ))}

        {isEmpty && (
          <div className="absolute inset-x-6 top-35 flex flex-col items-center gap-2 rounded-[1.125rem] border-[1.5px] border-ink bg-paper p-4.5 text-center">
            <strong className="font-display text-[17px] font-semibold text-ink-strong">This bookcase is still quiet</strong>
            <span className="text-[13px] leading-relaxed text-ink-soft">Shelve your first PDF book here.</span>
            <Link
              href={`/library?new=book&bookcase=${bookcase.id}`}
              scroll={false}
              className="flex min-h-10 items-center rounded-full bg-sage-100 px-4 text-[13px] font-extrabold text-sage-700 hover:bg-sage-200"
            >
              Add a book
            </Link>
          </div>
        )}
      </div>

      <div className="flex justify-between px-3.5">
        <span className="h-3.5 w-5.5 rounded-b-md border-[1.5px] border-t-0 border-ink" style={{ backgroundColor: wood.dark }} />
        <span className="h-3.5 w-5.5 rounded-b-md border-[1.5px] border-t-0 border-ink" style={{ backgroundColor: wood.dark }} />
      </div>
    </section>
  );
}