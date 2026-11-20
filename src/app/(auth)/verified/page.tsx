import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import { Avatar } from "@/components/avatar/Avatar";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Email verification",
};

type VerifiedPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function VerifiedPage({ searchParams }: VerifiedPageProps) {
  const { error } = await searchParams;

  if (error) {
    return (
      <section className="flex flex-col gap-5">
        <header className="flex flex-col gap-1.5">
          <h1 className="font-display text-[30px] font-semibold text-ink-strong">This link has expired</h1>
          <p className="leading-relaxed text-ink-soft">
            Verification links work for 24 hours and only once. Enter your email and we will send you a fresh one.
          </p>
        </header>

        <ResendVerificationForm email={null} />

        <Link href="/login" className="text-sm font-extrabold text-sage-600 hover:text-sage-700">
          Back to log in
        </Link>
      </section>
    );
  }

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <section className="flex flex-col items-center gap-5 rounded-[1.875rem] border-[1.5px] border-ink bg-paper p-8 text-center shadow-[0_8px_0_#EBB4C0]">
      <Avatar value={user.avatar} size={104} />

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[28px] font-semibold text-ink-strong">Your email is verified</h1>
        <p className="leading-relaxed text-ink-soft">Welcome to Little Leaf Library, {user.name}. Your bookcases are ready for their first books.</p>
      </div>

      <ButtonLink href="/library" size="lg" className="w-full">
        Enter my library
      </ButtonLink>
    </section>
  );
}