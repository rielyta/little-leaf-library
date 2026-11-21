import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app/AppHeader";
import { DialogLink } from "@/components/library/DialogLink";
import { EmptyLibrary } from "@/components/library/EmptyLibrary";
import { LibraryDialogs } from "@/components/library/LibraryDialogs";
import { LibraryRoom } from "@/components/library/LibraryRoom";
import { LibrarySign } from "@/components/library/LibrarySign";
import { buttonClasses } from "@/components/ui/button-styles";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { defaultLibraryName, displayLibraryName } from "@/lib/library";
import { listBookcases } from "@/server/bookcases";
import { getLibraryName } from "@/server/library";
import { hasFinishedOnboarding } from "@/server/onboarding";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My library",
};

export default async function LibraryPage() {
  const { user } = await requireSession();
  const [bookcases, savedName, onboarded] = await Promise.all([
    listBookcases(user.id),
    getLibraryName(user.id),
    hasFinishedOnboarding(user.id),
  ]);

  const avatar = user.avatar ?? DEFAULT_AVATAR;
  const libraryName = displayLibraryName(savedName, user.name);

  return (
    <>
      <AppHeader>
        {bookcases.length > 0 && (
          <DialogLink href="/library?new=book" className={buttonClasses()}>
            Add book
          </DialogLink>
        )}
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

      <Suspense fallback={null}>
        <LibraryDialogs
          bookcases={bookcases}
          userName={user.name}
          libraryName={libraryName}
          savedName={savedName}
          defaultName={defaultLibraryName(user.name)}
          avatar={avatar}
          onboarded={onboarded}
        />
      </Suspense>
    </>
  );
}