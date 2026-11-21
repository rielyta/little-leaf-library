import type { Metadata } from "next";
import Link from "next/link";
import { ClearBookCache } from "@/components/auth/ClearBookCache";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Your account is deleted",
};

function WavingLeaf() {
  return (
    <svg viewBox="0 0 120 90" className="h-auto w-28" aria-hidden="true">
      <path d="M60 80c0-22 4-40 16-56" stroke="#5E8C6A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path
        d="M76 24c-14 2-26 12-26 28 14-2 26-12 26-28z"
        fill="#BFD8C2"
        stroke="#5A4636"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M76 24c-8 8-16 16-26 28" stroke="#5A4636" strokeWidth="1.2" fill="none" />
      <path d="M86 20c4 2 6 5 6 9M92 14c6 3 9 8 9 14" stroke="#E7B9C4" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="82" rx="22" ry="4" fill="#EADFD2" />
    </svg>
  );
}

export default function GoodbyePage() {
  return (
    <section className="flex flex-col gap-5">
      <ClearBookCache />
      <WavingLeaf />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[34px] font-semibold text-ink-strong">Your library is closed</h1>
        <p className="leading-relaxed text-ink-soft">
          Your account and everything in it have been deleted. Thank you for reading with us. If you ever want a cozy shelf
          again, you are always welcome back.
        </p>
      </header>

      <ButtonLink href="/register" size="lg" className="w-full">
        Start a new library
      </ButtonLink>

      <Link href="/" className="text-sm font-extrabold text-sage-600 hover:text-sage-700">
        Back to the home page
      </Link>
    </section>
  );
}