import type { Metadata } from "next";
import { AppHeader } from "@/components/app/AppHeader";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "My library",
};

export default async function LibraryPage() {
  const { user } = await requireSession();

  return (
    <>
      <AppHeader />
      <main className="page-container flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink-strong">Hi, {user.name}</h1>
        <p className="text-ink-soft">Your bookcases will live here soon.</p>
      </main>
    </>
  );
}