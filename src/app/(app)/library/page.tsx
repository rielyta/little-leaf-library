import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Avatar } from "@/components/avatar/Avatar";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My library",
};

export default async function LibraryPage() {
  const { user } = await requireSession();

  return (
    <main className="page-container flex min-h-screen flex-col items-center justify-center gap-5 text-center">
      <Avatar value={user.avatar} size={96} />
      <h1 className="font-display text-3xl font-semibold text-ink-strong">Hi, {user.name}</h1>
      <p className="text-ink-soft">
        You are logged in as <strong>@{user.displayUsername ?? user.username}</strong>. Your bookcases will live here soon.
      </p>
      <SignOutButton />
    </main>
  );
}