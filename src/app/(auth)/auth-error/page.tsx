import type { Metadata } from "next";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { redirectIfSignedIn } from "@/server/session";

export const metadata: Metadata = {
  title: "Sign in problem",
};

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

type ErrorCopy = {
  title: string;
  body: string;
};

const RESTART_ERRORS = new Set(["state_mismatch", "state_not_found", "please_restart_the_process"]);

const ERROR_COPY: Record<string, ErrorCopy> = {
  account_not_linked: {
    title: "This email already has an account",
    body: "You signed up with this email using a password. Log in with your email or username first, then connect Google from your profile. If you forgot your password, you can reset it.",
  },
  "email_doesn't_match": {
    title: "That Google account uses a different email",
    body: "Connect a Google account that uses the same email as your library account.",
  },
  account_already_linked_to_different_user: {
    title: "That Google account is already in use",
    body: "This Google account is connected to another Little Leaf Library account. Log in to that account instead, or choose a different Google account.",
  },
};

const RESTART_COPY: ErrorCopy = {
  title: "Let's try that again",
  body: "Your Google sign in was interrupted, took a little too long, or the page was opened twice. Nothing is wrong with your account. Please start again below.",
};

const FALLBACK_COPY: ErrorCopy = {
  title: "We could not sign you in",
  body: "Something went wrong while talking to Google. Please try again in a moment.",
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error } = await searchParams;
  const needsRestart = Boolean(error && RESTART_ERRORS.has(error));

  if (needsRestart) {
    await redirectIfSignedIn();
  }

  const copy = needsRestart ? RESTART_COPY : (error && ERROR_COPY[error]) || FALLBACK_COPY;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[30px] font-semibold text-ink-strong">{copy.title}</h1>
        <p className="leading-relaxed text-ink-soft">{copy.body}</p>
      </div>

      {needsRestart ? (
        <div className="flex max-w-sm flex-col gap-3">
          <GoogleButton />
          <ButtonLink href="/login" variant="plain">
            Back to log in
          </ButtonLink>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          <ButtonLink href="/login">Back to log in</ButtonLink>
          {error === "account_not_linked" && (
            <ButtonLink href="/forgot-password" variant="plain">
              Forgot password
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}