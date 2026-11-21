"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import { deleteBook } from "@/app/(app)/library/actions";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Modal } from "@/components/ui/Modal";
import { readingProgress, type BookOnShelf } from "@/lib/books";
import { closeLibraryDialog } from "@/lib/library-dialog";

type ManageBooksDialogProps = {
  bookcaseName: string;
  books: BookOnShelf[];
};

function closeDialog(event: MouseEvent<HTMLElement>) {
  event.currentTarget.closest("dialog")?.close();
}

export function ManageBooksDialog({ bookcaseName, books }: ManageBooksDialogProps) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visibleBooks = books.filter((book) => !removedIds.includes(book.id));

  function remove(bookId: string) {
    setError(null);
    setPendingId(bookId);

    startTransition(async () => {
      const result = await deleteBook(bookId);

      setPendingId(null);
      setConfirmingId(null);

      if (result.ok) {
        setRemovedIds((current) => [...current, bookId]);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Modal
      open
      title={`Books in ${bookcaseName}`}
      titleId="manage-books-title"
      onClose={closeLibraryDialog}
    >
      <div className="flex flex-col gap-4">
        <FormAlert message={error} />

        {visibleBooks.length === 0 ? (
          <p className="rounded-2xl border-[1.5px] border-dashed border-wood-300 p-4 text-sm leading-relaxed text-ink-soft">
            This bookcase is empty now.
          </p>
        ) : (
          <ul className="scrollbar-none flex max-h-[min(26rem,60vh)] flex-col gap-2.5 overflow-y-auto">
            {visibleBooks.map((book) => {
              const isConfirming = confirmingId === book.id;
              const isPending = pendingId === book.id;
              const details = [book.author, readingProgress(book).label].filter(Boolean).join(", ");

              return (
                <li
                  key={book.id}
                  className={`flex items-center gap-3 rounded-2xl border-[1.5px] bg-white px-3.5 py-3 ${isConfirming ? "border-danger" : "border-[#EADFD2]"}`}
                >
                  <span aria-hidden="true" className="h-10 w-3 flex-none rounded-[3px] border-[1.5px] border-ink" style={{ backgroundColor: book.spineColor }} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <strong className="truncate text-ink-strong">{book.title}</strong>
                    <span className="truncate text-xs text-ink-soft">{details}</span>
                  </span>

                  {isConfirming ? (
                    <span className="flex flex-none items-center gap-1.5">
                      <span className="hidden text-xs font-bold text-danger sm:inline">Delete for good?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isPending}
                        className="min-h-9 rounded-full px-3 text-[13px] font-extrabold hover:bg-paper"
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(book.id)}
                        disabled={isPending}
                        className="min-h-9 rounded-full bg-danger px-3.5 text-[13px] font-extrabold text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {isPending ? "Deleting..." : "Delete"}
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(book.id)}
                      aria-label={`Delete ${book.title}`}
                      className="min-h-9 flex-none rounded-full px-3 text-[13px] font-extrabold text-ink-soft hover:bg-blush-50 hover:text-danger"
                    >
                      Delete
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-[#F0E6DA] pt-4">
          <span className="text-[13px] text-ink-soft">Deleting a book also removes its notes and saved words.</span>
          <Button variant="outline" onClick={closeDialog}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}