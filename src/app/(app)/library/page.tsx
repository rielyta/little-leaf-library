import type { Metadata } from "next";
import { AppHeader } from "@/components/app/AppHeader";
import { AddBookDialog } from "@/components/library/AddBookDialog";
import { BookcaseDialog } from "@/components/library/BookcaseDialog";
import { DeleteBookcaseDialog } from "@/components/library/DeleteBookcaseDialog";
import { EmptyLibrary } from "@/components/library/EmptyLibrary";
import { LibraryNameDialog } from "@/components/library/LibraryNameDialog";
import { LibraryRoom } from "@/components/library/LibraryRoom";
import { LibrarySign } from "@/components/library/LibrarySign";
import { ManageBooksDialog } from "@/components/library/ManageBooksDialog";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { defaultLibraryName, displayLibraryName } from "@/lib/library";
import { listBookcases } from "@/server/bookcases";
import { getLibraryName } from "@/server/library";
import { hasFinishedOnboarding } from "@/server/onboarding";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My library",
};

type LibraryPageProps = {
  searchParams: Promise<{
    new?: string;
    edit?: string;
    bookcase?: string;
    remove?: string;
    manage?: string;
    rename?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { user } = await requireSession();
  const [bookcases, savedName, onboarded, params] = await Promise.all([
    listBookcases(user.id),
    getLibraryName(user.id),
    hasFinishedOnboarding(user.id),
    searchParams,
  ]);

  const avatar = user.avatar ?? DEFAULT_AVATAR;
  const libraryName = displayLibraryName(savedName, user.name);
  const findBookcase = (id?: string) => (id ? bookcases.find((bookcase) => bookcase.id === id) : undefined);

  const editingBookcase = findBookcase(params.edit);
  const removingBookcase = findBookcase(params.remove);
  const managingBookcase = findBookcase(params.manage);
  const isBookcaseDialogOpen = params.new === "bookcase" || Boolean(editingBookcase);
  const isAddingBook = params.new === "book";
  const bookcaseOptions = bookcases.map(({ id, name }) => ({ id, name }));
  const showTour = !onboarded && Object.values(params).every((value) => value === undefined);

  return (
    <>
      <AppHeader>
        {bookcases.length > 0 && <ButtonLink href="/library?new=book">Add book</ButtonLink>}
      </AppHeader>

      {bookcases.length === 0 ? (
        <>
          <div className="flex justify-center bg-blush-100 px-4 pb-4">
            <LibrarySign name={libraryName} />
          </div>
          <EmptyLibrary name={user.name} />
        </>
      ) : (
        <LibraryRoom bookcases={bookcases} libraryName={libraryName} avatar={avatar} />
      )}

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
        key={`book-${isAddingBook}-${params.bookcase ?? ""}`}
        open={isAddingBook}
        bookcases={bookcaseOptions}
        defaultBookcaseId={params.bookcase}
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

      {params.rename === "library" && <LibraryNameDialog savedName={savedName} defaultName={defaultLibraryName(user.name)} />}

      {showTour && (
        <WelcomeTour name={user.name} libraryName={libraryName} avatar={avatar} hasBookcases={bookcases.length > 0} />
      )}
    </>
  );
}