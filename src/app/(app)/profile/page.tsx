import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StorageMeter } from "@/components/ui/StorageMeter";
import { formatBytes, MAX_BOOK_FILE_BYTES } from "@/lib/storage-quota";
import { db } from "@/server/db";
import { requireSession } from "@/server/session";
import { getStorageUsage } from "@/server/storage-quota";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function ProfilePage() {
  const session = await requireSession();

  const [user, usage] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        username: true,
        displayUsername: true,
        avatar: true,
        accounts: { select: { providerId: true } },
      },
    }),
    getStorageUsage(session.user.id),
  ]);

  if (!user) {
    notFound();
  }

  const providers = user.accounts.map((account) => account.providerId);
  const username = user.displayUsername ?? user.username ?? "";
  const perBook = formatBytes(MAX_BOOK_FILE_BYTES);

  return (
    <>
      <AppHeader>
        <ButtonLink href="/library" variant="plain">
          Back to my library
        </ButtonLink>
      </AppHeader>

      <main className="page-container flex max-w-[70rem] flex-col gap-6 py-9">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-[34px] font-semibold text-ink-strong">My profile</h1>
          <p className="text-ink-soft">
            Pick a little friend to represent you, and keep your account details up to date.
          </p>
        </header>

        <div className="flex flex-wrap items-start gap-6">
          <AvatarPicker current={user.avatar} name={user.name} username={username} />
          <ProfileInfo
            username={username}
            name={user.name}
            email={user.email}
            hasPassword={providers.includes("credential")}
            hasGoogle={providers.includes("google")}
          />
        </div>

        <section
          aria-labelledby="storage-title"
          className="flex flex-col gap-3 rounded-[1.75rem] border-[1.5px] border-[#EADFD2] bg-white p-6.5"
        >
          <h2 id="storage-title" className="font-display text-xl font-semibold text-ink-strong">
            Shelf space
          </h2>
          <StorageMeter usage={usage} />
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {usage.limit === null
              ? `Your library has no storage limit. Each book can be up to ${perBook}.`
              : `Every library has ${formatBytes(usage.limit)} for PDFs, up to ${perBook} per book. Removing a book frees its space right away.`}
          </p>
        </section>

        <div className="flex justify-end">
          <SignOutButton />
        </div>
      </main>
    </>
  );
}