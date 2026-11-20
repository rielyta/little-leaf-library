"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth-client";
import { emailField } from "@/lib/validation/auth";

const COOLDOWN_SECONDS = 60;
const VERIFIED_CALLBACK_URL = "/verified";
const TOO_MANY_REQUESTS = 429;

type ResendVerificationFormProps = {
  email: string | null;
};

type Status = "idle" | "sending" | "sent" | "limited" | "error";

export function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const [value, setValue] = useState(email ?? "");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = emailField.safeParse(value.trim());

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }

    setFieldError(undefined);
    setStatus("sending");

    const { error } = await authClient.sendVerificationEmail({
      email: parsed.data,
      callbackURL: VERIFIED_CALLBACK_URL,
    });

    if (error) {
      setStatus(error.status === TOO_MANY_REQUESTS ? "limited" : "error");
      return;
    }

    setStatus("sent");
    setCooldown(COOLDOWN_SECONDS);
  }

  const isBusy = status === "sending" || cooldown > 0;

  let label = email ? "Send the link again" : "Send me a new link";

  if (status === "sending") {
    label = "Sending...";
  } else if (cooldown > 0) {
    label = `Send again in ${cooldown}s`;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {!email && (
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          error={fieldError}
        />
      )}

      <Button type="submit" variant={email ? "outline" : "primary"} className="w-full" disabled={isBusy}>
        {label}
      </Button>

      {status === "sent" && <FormAlert tone="success" message="A new link is on its way. It can take a minute to arrive." />}
      {status === "limited" && <FormAlert message="You asked for a few links already. Please wait about 15 minutes, then try again." />}
      {status === "error" && <FormAlert message="We could not send the link right now. Please try again in a moment." />}
    </form>
  );
}