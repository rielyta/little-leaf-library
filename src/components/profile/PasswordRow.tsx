"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { authClient } from "@/lib/auth-client";
import { maskEmail } from "@/lib/mask";

type PasswordRowProps = {
  email: string;
  hasPassword: boolean;
};

export function PasswordRow({ email, hasPassword }: PasswordRowProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendLink() {
    setStatus("sending");

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex flex-col gap-3 border-t-[1.5px] border-[#F0E6DA] pb-1 pt-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex min-w-0 flex-[1_1_14rem] flex-col gap-0.5">
          <span className="text-[13px] font-extrabold text-ink-soft">Password</span>
          {hasPassword ? (
            <span aria-label="Password hidden" className="font-mono text-lg tracking-[0.12em] text-ink-strong">
              **********
            </span>
          ) : (
            <span className="text-[15px] font-bold text-ink-strong">Not set yet, you sign in with Google</span>
          )}
        </div>
        <Button variant="outline" onClick={sendLink} disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : hasPassword ? "Change password" : "Set a password"}
        </Button>
      </div>

      {status === "sent" && (
        <FormAlert
          tone="success"
          message={`We sent a link to ${maskEmail(email)}. Open it to choose a new password.`}
        />
      )}
      {status === "error" && <FormAlert message="We could not send the link right now. Please try again." />}
    </div>
  );
}