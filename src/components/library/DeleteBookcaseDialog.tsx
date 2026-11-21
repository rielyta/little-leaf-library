"use client";

import { useActionState, useState, type ReactNode } from "react";
import { deleteBookcase, type DeleteBookcaseState } from "@/app/(app)/library/actions";
import { FormAlert } from "@/components/ui/FormAlert";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { closeLibraryDialog } from "@/lib/library-dialog";

const initialState: DeleteBookcaseState = {};

type BookcaseChoice = "move" | "delete";

type DeleteBookcaseDialogProps = {
  bookcase: { id: string; name: string; bookCount: number };
  otherBookcases: { id: string; name: string }[];
};

function ChoiceCard({
  value,
  checked,
  title,
  description,
  tone = "default",
  onSelect,
  children,
}: {
  value: BookcaseChoice;
  checked: boolean;
  title: string;
  description: string;
  tone?: "default" | "danger";
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-2.5 rounded-2xl border-[1.5px] bg-white p-4 transition-colors",
        checked ? (tone === "danger" ? "border-danger bg-blush-50" : "border-ink shadow-[0_3px_0_#CFE3EA]") : "border-[#EADFD2] hover:bg-paper",
      )}
    >
      <span className="flex items-start gap-3">
        <input type="radio" name="books" value={value} checked={checked} onChange={onSelect} className="mt-1 size-4 flex-none accent-sage-600" />
        <span className="flex flex-col gap-0.5">
          <span className={cn("font-bold", tone === "danger" ? "text-danger" : "text-ink-strong")}>{title}</span>
          <span className="text-[13px] leading-relaxed text-ink-soft">{description}</span>
        </span>
      </span>
      {children}
    </label>
  );
}

export function DeleteBookcaseDialog({ bookcase, otherBookcases }: DeleteBookcaseDialogProps) {
  const [state, formAction, pending] = useActionState(deleteBookcase.bind(null, bookcase.id), initialState);

  const canMove = otherBookcases.length > 0;
  const hasBooks = bookcase.bookCount > 0;
  const bookLabel = `${bookcase.bookCount} ${bookcase.bookCount === 1 ? "book" : "books"}`;

  const [choice, setChoice] = useState<BookcaseChoice>(canMove ? "move" : "delete");
  const [targetId, setTargetId] = useState(otherBookcases[0]?.id ?? "");

  return (
    <Modal open title="Delete bookcase" titleId="delete-bookcase-title" onClose={closeLibraryDialog}>
      <form action={formAction} className="flex flex-col gap-5">
        <FormAlert message={state.formError ?? null} />

        <p className="leading-relaxed text-ink-soft">
          You are about to delete <strong className="text-ink-strong">{bookcase.name}</strong>.{" "}
          {hasBooks ? `It still holds ${bookLabel}.` : "It is empty, so nothing else will be removed."}
        </p>

        {hasBooks ? (
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2 text-sm font-bold">What should happen to the books?</legend>

            {canMove && (
              <ChoiceCard
                value="move"
                checked={choice === "move"}
                onSelect={() => setChoice("move")}
                title={`Move the ${bookLabel}`}
                description="They keep their bookmarks, highlights, comments and saved words."
              >
                {choice === "move" && (
                  <select
                    name="targetId"
                    value={targetId}
                    onChange={(event) => setTargetId(event.target.value)}
                    aria-label="Move the books to"
                    className="ml-7 min-h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-sage-600"
                  >
                    {otherBookcases.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                )}
              </ChoiceCard>
            )}

            <ChoiceCard
              value="delete"
              checked={choice === "delete"}
              onSelect={() => setChoice("delete")}
              tone="danger"
              title={`Delete the ${bookLabel} too`}
              description="Their PDF files, bookmarks, highlights, comments and saved words will be removed for good."
            />

            {(state.errors?.books || state.errors?.targetId) && (
              <p className="text-[13px] font-semibold text-danger">{state.errors.books ?? state.errors.targetId}</p>
            )}
          </fieldset>
        ) : (
          <input type="hidden" name="books" value="delete" />
        )}

        <div className="flex justify-end gap-3">
          <ModalCancelButton disabled={pending} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-danger bg-danger px-5 text-[15px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Deleting..." : "Delete bookcase"}
          </button>
        </div>
      </form>
    </Modal>
  );
}