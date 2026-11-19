"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent, type MouseEvent } from "react";
import { moveBook } from "@/app/(app)/read/[id]/actions";
import { cn } from "@/lib/cn";

export type BookcaseOption = {
  id: string;
  name: string;
  bookCount: number;
};

type MoveBookButtonProps = {
  bookId: string;
  currentBookcaseId: string;
  bookcases: BookcaseOption[];
};

function MoveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11M11 4l3 3-3 3" />
      <path d="M17 13H6M9 10l-3 3 3 3" />
    </svg>
  );
}

export function MoveBookButton({ bookId, currentBookcaseId, bookcases }: MoveBookButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(currentBookcaseId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasOtherBookcases = bookcases.some((bookcase) => bookcase.id !== currentBookcaseId);

  function open() {
    setSelected(currentBookcaseId);
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && !isPending) {
      close();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selected === currentBookcaseId) {
      close();
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await moveBook(bookId, selected);

      if (result.ok) {
        close();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Move book to another bookcase"
        className="flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] border-line px-3 text-sm font-extrabold hover:bg-white sm:pl-3 sm:pr-4"
      >
        <MoveIcon className="size-5" />
        <span className="hidden sm:inline">Move book</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="move-book-title"
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[1.75rem] border-[1.5px] border-ink bg-paper p-0 text-ink shadow-[0_8px_0_#CFE3EA] backdrop:bg-ink/30"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1">
            <h2 id="move-book-title" className="font-display text-[22px] font-semibold text-ink-strong">
              Move this book
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft">Choose the bookcase it belongs on. It will sit at the end of the shelves there.</p>
          </div>

          {hasOtherBookcases ? (
            <fieldset className="scrollbar-none flex max-h-72 flex-col gap-2 overflow-y-auto">
              <legend className="sr-only">Bookcase</legend>
              {bookcases.map((bookcase) => {
                const isCurrent = bookcase.id === currentBookcaseId;
                const isSelected = bookcase.id === selected;

                return (
                  <label
                    key={bookcase.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] bg-white px-4 py-3 transition-colors",
                      isSelected ? "border-ink shadow-[0_3px_0_#CFE3EA]" : "border-[#EADFD2] hover:bg-paper",
                    )}
                  >
                    <input
                      type="radio"
                      name="bookcase"
                      value={bookcase.id}
                      checked={isSelected}
                      onChange={() => setSelected(bookcase.id)}
                      className="size-4 flex-none accent-sage-600"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-bold text-ink-strong">{bookcase.name}</span>
                      <span className="text-xs text-ink-soft">
                        {bookcase.bookCount} {bookcase.bookCount === 1 ? "book" : "books"}
                      </span>
                    </span>
                    {isCurrent && (
                      <span className="flex-none rounded-full bg-sage-100 px-2.5 py-1 text-[11px] font-extrabold text-sage-700">Here now</span>
                    )}
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <p className="rounded-2xl border-[1.5px] border-dashed border-wood-300 p-4 text-sm leading-relaxed text-ink-soft">
              You only have one bookcase so far.{" "}
              <Link href="/library?new=bookcase" className="font-extrabold text-sage-700 underline underline-offset-2">
                Add another bookcase
              </Link>{" "}
              first, then come back to move this book.
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm font-bold text-danger">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} disabled={isPending} className="min-h-11 rounded-full px-4 text-sm font-extrabold hover:bg-white">
              Cancel
            </button>
            {hasOtherBookcases && (
              <button
                type="submit"
                disabled={isPending || selected === currentBookcaseId}
                className="min-h-11 rounded-full bg-sage-600 px-5 text-sm font-extrabold text-white hover:bg-sage-700 disabled:opacity-50"
              >
                {isPending ? "Moving..." : "Move book"}
              </button>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}