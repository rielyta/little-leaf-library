"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AddBookDialog } from "@/components/library/AddBookDialog";
import { BookcaseDialog } from "@/components/library/BookcaseDialog";
import { DeleteBookcaseDialog } from "@/components/library/DeleteBookcaseDialog";
import { LibraryNameDialog } from "@/components/library/LibraryNameDialog";
import { ManageBooksDialog } from "@/components/library/ManageBooksDialog";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { keepOnlyCachedBooks } from "@/lib/book-cache";
import type { BookcaseSummary } from "@/lib/bookcases";

const DIALOG_PARAMS = ["new", "edit", "bookcase", "remove", "manage", "rename"];

type LibraryDialogsProps = {
  bookcases: BookcaseSummary[];
  userName: string;
  libraryName: string;
  savedName: string | null;
  defaultName: string;
  avatar: string;
  onboarded: boolean;
};

export function LibraryDialogs({ bookcases, userName, libraryName, savedName, defaultName, avatar, onboarded }: LibraryDialogsProps) {
  const params = useSearchParams();
  const [showTour] = useState(() => !onboarded && DIALOG_PARAMS.every((name) => !params.has(name)));

  const findBookcase = (id: string | null) => (id ? bookcases.find((bookcase) => bookcase.id === id) : undefined);
  const editingBookcase = findBookcase(params.get("edit"));
  const removingBookcase = findBookcase(params.get("remove"));
  const managingBookcase = findBookcase(params.get("manage"));
  const isBookcaseDialogOpen = params.get("new") === "bookcase" || Boolean(editingBookcase);
  const isAddingBook = params.get("new") === "book";
  const defaultBookcaseId = params.get("bookcase") ?? undefined;
  const bookcaseOptions = bookcases.map(({ id, name }) => ({ id, name }));
  const shelvedBookIds = bookcases.flatMap((bookcase) => bookcase.books.map((book) => book.id)).join(",");

  useEffect(() => {
    void keepOnlyCachedBooks(shelvedBookIds ? shelvedBookIds.split(",") : []);
  }, [shelvedBookIds]);

  return (
    <>
      <BookcaseDialog
        key={`bookcase-${isBookcaseDialogOpen}-${editingBookcase?.id ?? "new"}`}
        open={isBookcaseDialogOpen}
        bookcase={
          editingBookcase && {
            id: editingBookcase.id,
            name: editingBookcase.name,
            wood: editingBookcase.wood,
            shelves: editingBookcase.shelves,
          }
        }
      />

      <AddBookDialog
        key={`book-${isAddingBook}-${defaultBookcaseId ?? ""}`}
        open={isAddingBook}
        bookcases={bookcaseOptions}
        defaultBookcaseId={defaultBookcaseId}
      />

      {removingBookcase && (
        <DeleteBookcaseDialog
          key={`remove-${removingBookcase.id}`}
          bookcase={{ id: removingBookcase.id, name: removingBookcase.name, bookCount: removingBookcase.books.length }}
          otherBookcases={bookcaseOptions.filter((option) => option.id !== removingBookcase.id)}
        />
      )}

      {managingBookcase && (
        <ManageBooksDialog key={`manage-${managingBookcase.id}`} bookcaseName={managingBookcase.name} books={managingBookcase.books} />
      )}

      {params.get("rename") === "library" && <LibraryNameDialog savedName={savedName} defaultName={defaultName} />}

      {showTour && <WelcomeTour name={userName} libraryName={libraryName} avatar={avatar} hasBookcases={bookcases.length > 0} />}
    </>
  );
}