import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar/Avatar";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { requireSession } from "@/server/session";
import { regenerateUsername } from "./actions";

export const metadata: Metadata = {
  title: "Welcome",
};

export default async function WelcomePage() {
  const { user } = await requireSession();

  return (
    <section className="flex flex-col items-center gap-5 rounded-[1.875rem] border-[1.5px] border-ink bg-paper p-8 text-center shadow-[0_8px_0_#EBB4C0]">
      <Avatar value={user.avatar} size={104} />

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[28px] font-semibold text-ink-strong">Welcome to Little Leaf Library</h1>
        <p className="leading-relaxed text-ink-soft">
          You signed up with Google, so we made a username for you. You can change it anytime in your profile.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 text-left">
        <span className="text-sm font-extrabold">Your username</span>
        <form action={regenerateUsername} className="flex gap-2">
          <output className="flex min-h-13 flex-1 items-center rounded-2xl border-[1.5px] border-ink bg-mist-50 px-4.5 font-mono text-lg tracking-wider text-mist-800">
            {user.displayUsername ?? user.username}
          </output>
          <button
            type="submit"
            aria-label="Generate another username"
            className="flex size-13 flex-none items-center justify-center rounded-2xl border-[1.5px] border-ink bg-white transition-colors hover:bg-paper"
          >
            <svg viewBox="0 0 22 22" className="size-5.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 11a7 7 0 1 1-2.1-5" />
              <path d="M18 3.5V8h-4.5" />
            </svg>
          </button>
        </form>
        <span className="text-[13px] text-ink-soft">10 random letters and numbers. Tap the arrow for a new one.</span>
      </div>

      <ButtonLink href="/library" size="lg" className="w-full">
        Enter my library
      </ButtonLink>
      <Link href="/profile" className="text-sm font-extrabold text-sage-600 hover:text-sage-700">
        Change it in my profile
      </Link>
    </section>
  );
}