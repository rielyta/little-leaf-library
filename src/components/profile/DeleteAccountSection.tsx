"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormAlert } from "@/components/ui/FormAlert";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

const CONFIRM_WORD = "delete";
const GOODBYE_URL = "/goodbye";
const TOO_MANY_REQUESTS = 429;

type DeleteAccountSectionProps = {
  email: string;
};

type Status = "idle" | "confirming" | "sending" | "sent";

const dangerButton =
  "flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-danger px-5 text-sm font-extrabold text-danger transition-colors hover:bg-[#FCEBEE] disabled:cursor-not-allowed disabled:opacity-50";

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = confirmText.trim().toLowerCase() === CONFIRM_WORD && status === "confirming";

  function cancel() {
    setStatus("idle");
    setConfirmText("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);
    setStatus("sending");

    const { data, error: deleteError } = await authClient.deleteUser({ callbackURL: GOODBYE_URL });

    if (deleteError) {
      setError(
        deleteError.status === TOO_MANY_REQUESTS
          ? "You asked for a few links already. Please wait about 15 minutes, then try again."
          : "We could not send the link right now. Please try again in a moment.",
      );
      setStatus("confirming");
      return;
    }

    if (data?.message?.toLowerCase().includes("deleted")) {
      router.replace(GOODBYE_URL);
      return;
    }

    setStatus("sent");
  }

  return (
    <section
      aria-labelledby="delete-account-title"
      className="flex flex-col gap-3 rounded-[1.75rem] border-[1.5px] border-[#EADFD2] bg-white p-6.5"
    >
      <h2 id="delete-account-title" className="font-display text-xl font-semibold text-ink-strong">
        Delete account
      </h2>

      {status === "sent" ? (
        <div role="status" className="flex flex-col gap-1.5 rounded-2xl border-[1.5px] border-mist-200 bg-mist-50 px-4 py-3 text-sm leading-relaxed text-mist-800">
          <strong>Check your inbox to finish.</strong>
          <span>
            We sent a confirmation link to <strong>{email}</strong>. Open it in this browser to delete your account. If you
            change your mind, simply ignore the email.
          </span>
        </div>
      ) : (
        <>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            This removes your bookcases, books, highlights, notes and saved words for good. It cannot be undone.
          </p>

          {status === "idle" ? (
            <button type="button" onClick={() => setStatus("confirming")} className={cn(dangerButton, "self-start")}>
              Delete my account
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <FormAlert message={error} />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-delete" className="text-sm font-bold">
                  Type <span className="rounded-md bg-[#FCEBEE] px-1.5 py-0.5 font-extrabold text-danger">{CONFIRM_WORD}</span> to
                  confirm
                </label>
                <input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={status === "sending"}
                  className="min-h-12 max-w-xs rounded-2xl border-[1.5px] border-line bg-white px-3.5 text-[15px] text-ink outline-none focus:border-danger"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={!canSubmit} className={dangerButton}>
                  {status === "sending" ? "Sending..." : "Email me the delete link"}
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  disabled={status === "sending"}
                  className="flex min-h-11 items-center rounded-full px-4 text-sm font-extrabold text-ink-soft hover:text-ink-strong"
                >
                  Keep my account
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}