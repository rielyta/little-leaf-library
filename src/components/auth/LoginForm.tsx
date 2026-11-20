"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";

const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
const TOO_MANY_REQUESTS = 429;

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFormError(null);
    setNeedsVerification(false);
    setPending(true);

    const { identifier, password } = parsed.data;
    const { error } = identifier.includes("@")
      ? await authClient.signIn.email({ email: identifier, password })
      : await authClient.signIn.username({ username: identifier, password });

    if (error) {
      if (error.status === TOO_MANY_REQUESTS) {
        setFormError("Too many attempts. Please wait a minute, then try again.");
      } else if (error.code === EMAIL_NOT_VERIFIED || error.status === 403) {
        setNeedsVerification(true);
      } else {
        setFormError("That email or username and password do not match.");
      }

      setPending(false);
      return;
    }

    router.push("/library");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
      <FormAlert message={formError} />

      {needsVerification && (
        <div role="alert" className="flex flex-col gap-1.5 rounded-2xl border-[1.5px] border-mist-200 bg-mist-50 px-4 py-3 text-sm leading-relaxed text-mist-800">
          <strong>Please verify your email first.</strong>
          <span>We just sent a fresh verification link to your inbox. Open it, then come back to log in.</span>
          <Link href="/verify-email" className="self-start font-extrabold text-sage-700 underline underline-offset-2">
            Did not get it?
          </Link>
        </div>
      )}

      <TextField
        label="Email or username"
        name="identifier"
        autoComplete="username"
        placeholder="you@email.com or yourusername"
        error={errors.identifier}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        error={errors.password}
        labelAside={
          <Link href="/forgot-password" className="text-sm font-bold text-sage-600 hover:text-sage-700">
            Forgot password?
          </Link>
        }
      />

      <Button type="submit" size="lg" className="mt-1.5 w-full" disabled={pending}>
        {pending ? "Opening your library..." : "Log in to my library"}
      </Button>
    </form>
  );
}