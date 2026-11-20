import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import { emailField } from "@/lib/validation/auth";
import { redirectIfSignedIn } from "@/server/session";

export const metadata: Metadata = {
  title: "Check your inbox",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

function EnvelopeIllustration() {
  return (
    <svg viewBox="0 0 120 90" className="h-auto w-28" aria-hidden="true">
      <rect x="10" y="20" width="100" height="62" rx="10" fill="#FFFDF8" stroke="#5A4636" strokeWidth="2" />
      <path d="M12 26l48 34 48-34" fill="none" stroke="#5A4636" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 52s-9-5.4-9-11.5a4.6 4.6 0 0 1 9-1.8 4.6 4.6 0 0 1 9 1.8C69 46.6 60 52 60 52z" fill="#F2B8C6" stroke="#5A4636" strokeWidth="1.6" />
      <path d="M94 10c-1 6-6 10-12 10M100 14c4 3 6 7 5 12" stroke="#5E8C6A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="86" cy="12" rx="5" ry="3" transform="rotate(-20 86 12)" fill="#BFD8C2" stroke="#5A4636" strokeWidth="1.2" />
    </svg>
  );
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  await redirectIfSignedIn();

  const { email } = await searchParams;
  const parsedEmail = emailField.safeParse(email ?? "");
  const knownEmail = parsedEmail.success ? parsedEmail.data : null;

  return (
    <section className="flex flex-col gap-5">
      <EnvelopeIllustration />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[34px] font-semibold text-ink-strong">Check your inbox</h1>
        <p className="leading-relaxed text-ink-soft">
          {knownEmail ? (
            <>
              We sent a link to <strong className="text-ink-strong">{knownEmail}</strong>. Open it to verify your email and step into your library.
            </>
          ) : (
            "Enter the email you signed up with and we will send you a new verification link."
          )}
        </p>
      </header>

      <ResendVerificationForm email={knownEmail} />

      <p className="text-sm leading-relaxed text-ink-soft">The link works for 24 hours. If it does not show up, check your spam folder too.</p>

      <Link href="/login" className="text-sm font-extrabold text-sage-600 hover:text-sage-700">
        Back to log in
      </Link>
    </section>
  );
}