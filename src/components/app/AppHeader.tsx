import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Logo } from "@/components/brand/Logo";
import { requireSession } from "@/server/session";

export async function AppHeader({ children }: { children?: ReactNode }) {
  const { user } = await requireSession();

  return (
    <header className="flex flex-wrap items-center gap-4 border-b-[1.5px] border-wood-200 bg-cream px-6 py-3.5 md:px-8">
      <div className="mr-auto">
        <Logo />
      </div>
      {children}
      <Link
        href="/profile"
        aria-label="My profile"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
      >
        <Avatar value={user.avatar} size={44} />
      </Link>
    </header>
  );
}