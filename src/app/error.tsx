"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";

const RELOAD_KEY = "little-leaf-library:auto-reload";
const RELOAD_WINDOW_MS = 15_000;

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function shouldAutoReload() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const lastReload = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
    return Date.now() - lastReload > RELOAD_WINDOW_MS;
  } catch {
    return false;
  }
}

function markReload() {
  try {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
}

function FallenLeaf() {
  return (
    <svg viewBox="0 0 120 90" className="h-auto w-28" aria-hidden="true">
      <path d="M38 64c6-24 26-40 52-42-2 26-20 44-46 46z" fill="#BFD8C2" stroke="#5A4636" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M44 66c12-12 26-26 44-42" stroke="#5A4636" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M44 66l-8 10" stroke="#5E8C6A" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="60" cy="82" rx="28" ry="4" fill="#EADFD2" />
    </svg>
  );
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [isReloading] = useState(shouldAutoReload);

  useEffect(() => {
    console.error(error);

    if (isReloading) {
      markReload();
      window.location.reload();
    }
  }, [error, isReloading]);

  if (isReloading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-cream px-6">
        <p role="status" className="font-display text-lg text-ink-soft">
          Tidying up the shelves...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream px-6 py-12">
      <section className="flex w-full max-w-md flex-col items-center gap-5 rounded-[1.875rem] border-[1.5px] border-ink bg-paper p-8 text-center shadow-[0_8px_0_#EBB4C0]">
        <FallenLeaf />

        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] font-semibold text-ink-strong">A page slipped off the shelf</h1>
          <p className="leading-relaxed text-ink-soft">
            Something went wrong while loading this page. Your books and notes are safe. Please try again in a moment.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/library" variant="outline">
            Back to my library
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}