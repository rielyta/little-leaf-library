import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { WindowIllustration } from "@/components/illustrations/WindowIllustration";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-wrap bg-cream">
      <aside className="flex min-w-0 flex-[1_1_32rem] flex-col justify-between gap-6 overflow-hidden bg-blush-100 px-8 py-9 md:px-11">
        <Logo />
        <WindowIllustration className="h-auto w-full max-w-[32rem] self-center" />
        <div className="flex max-w-md flex-col gap-2">
          <p className="font-display text-[26px] font-medium leading-snug text-ink-strong">
            Sit down for a moment, your books are waiting on the shelf.
          </p>
          <p className="leading-relaxed text-blush-800">Log in to pick up right where you left off.</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-[1_1_28rem] items-center justify-center px-6 py-10 md:px-8">
        <div className="flex w-full max-w-[26.25rem] flex-col gap-5">{children}</div>
      </main>
    </div>
  );
}