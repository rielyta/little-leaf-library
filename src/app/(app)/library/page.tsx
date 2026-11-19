import type { Metadata } from "next";
import { AppHeader } from "@/components/app/AppHeader";
import { AddBookDialog } from "@/components/library/AddBookDialog";
import { BookcaseDialog } from "@/components/library/BookcaseDialog";
import { EmptyLibrary } from "@/components/library/EmptyLibrary";
import { LibraryRoom } from "@/components/library/LibraryRoom";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { listBookcases } from "@/server/bookcases";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My library",
};

type LibraryPageProps = {
  searchParams: Promise<{ new?: string; edit?: string; bookcase?: string }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { user } = await requireSession();
  const [bookcases, params] = await Promise.all([listBookcases(user.id), searchParams]);

  const editingBookcase = params.edit ? bookcases.find((bookcase) => bookcase.id === params.edit) : undefined;
  const isBookcaseDialogOpen = params.new === "bookcase" || Boolean(editingBookcase);
  const isAddingBook = params.new === "book";
  const bookcaseOptions = bookcases.map(({ id, name }) => ({ id, name }));

  return (
    <>
      <AppHeader>
        {bookcases.length > 0 && <ButtonLink href="/library?new=book">Add book</ButtonLink>}
      </AppHeader>

      {bookcases.length === 0 ? <EmptyLibrary name={user.name} /> : <LibraryRoom bookcases={bookcases} />}

      <BookcaseDialog
        key={`bookcase-${isBookcaseDialogOpen}-${editingBookcase?.id ?? "new"}`}
        open={isBookcaseDialogOpen}
        bookcase={editingBookcase && { id: editingBookcase.id, name: editingBookcase.name, wood: editingBookcase.wood }}
      />
      <AddBookDialog
        key={`book-${isAddingBook}-${params.bookcase ?? ""}`}
        open={isAddingBook}
        bookcases={bookcaseOptions}
        defaultBookcaseId={params.bookcase}
      />
    </>
  );
}