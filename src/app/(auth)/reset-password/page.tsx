import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FormAlert } from "@/components/ui/FormAlert";

export const metadata: Metadata = {
  title: "Choose a new password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams;
  const isValidLink = Boolean(token) && !error;

  return (
    <>
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[34px] font-semibold text-ink-strong">Choose a new password</h1>
        <p className="leading-relaxed text-ink-soft">Pick something you have not used here before.</p>
      </header>

      {isValidLink && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col gap-4">
          <FormAlert message="This reset link is invalid or has expired. Links only work once and for 1 hour." />
          <ButtonLink href="/forgot-password" size="lg" className="w-full">
            Request a new link
          </ButtonLink>
        </div>
      )}

      <p className="text-center text-sm text-ink-soft">
        <Link href="/login" className="font-extrabold text-sage-600 underline hover:text-sage-700">
          Back to log in
        </Link>
      </p>
    </>
  );
}