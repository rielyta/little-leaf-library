"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";

export function ForgotPasswordForm() {
  const [errors, setErrors] = useState<FieldErrors<ForgotPasswordValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFormError(null);
    setPending(true);

    const { error } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: "/reset-password",
    });

    setPending(false);

    if (error) {
      setFormError("We could not send the link right now. Please try again in a moment.");
      return;
    }

    setSentTo(parsed.data.email);
  }

  if (sentTo) {
    return (
      <FormAlert
        tone="success"
        message={`If an account exists for ${sentTo}, we sent a link to reset your password. The link expires in 1 hour.`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
      <FormAlert message={formError} />

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        error={errors.email}
      />

      <Button type="submit" size="lg" className="mt-1.5 w-full" disabled={pending}>
        {pending ? "Sending link..." : "Send reset link"}
      </Button>
    </form>
  );
}