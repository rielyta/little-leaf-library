import type { Metadata } from "next";
import { AppHeader } from "@/components/app/AppHeader";
import { EmptyLibrary } from "@/components/library/EmptyLibrary";
import { LibraryRoom } from "@/components/library/LibraryRoom";
import { NewBookcaseDialog } from "@/components/library/NewBookcaseDialog";
import { listBookcases } from "@/server/bookcases";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My library",
};

type LibraryPageProps = {
  searchParams: Promise<{ new?: string }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { user } = await requireSession();
  const [bookcases, params] = await Promise.all([listBookcases(user.id), searchParams]);
  const isCreatingBookcase = params.new === "bookcase";

  return (
    <>
      <AppHeader />

      {bookcases.length === 0 ? <EmptyLibrary name={user.name} /> : <LibraryRoom bookcases={bookcases} />}

      <NewBookcaseDialog key={String(isCreatingBookcase)} open={isCreatingBookcase} />
    </>
  );
}