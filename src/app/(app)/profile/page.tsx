import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { db } from "@/server/db";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      username: true,
      displayUsername: true,
      avatar: true,
      accounts: { select: { providerId: true } },
    },
  });

  if (!user) {
    notFound();
  }

  const providers = user.accounts.map((account) => account.providerId);
  const username = user.displayUsername ?? user.username ?? "";

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

        <div className="flex justify-end">
          <SignOutButton />
        </div>
      </main>
    </>
  );
}