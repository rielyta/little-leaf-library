"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";

const VERIFIED_CALLBACK_URL = "/verified";
const TOO_MANY_REQUESTS = 429;

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors<RegisterValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = registerSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFormError(null);
    setPending(true);

    const { username, name, email, password } = parsed.data;
    const { error } = await authClient.signUp.email({
      username,
      name,
      email,
      password,
      callbackURL: VERIFIED_CALLBACK_URL,
    });

    if (error) {
      setFormError(
        error.status === TOO_MANY_REQUESTS
          ? "Too many accounts were created from this network. Please try again later."
          : (error.message ?? "We could not create your account. Please try again."),
      );
      setPending(false);
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <FormAlert message={formError} />

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Username" name="username" autoComplete="username" placeholder="leafreader" error={errors.username} />
        <TextField label="Name" name="name" autoComplete="name" placeholder="Your name" error={errors.name} />
      </div>

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        error={errors.email}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password}
      />

      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Type it once more"
        error={errors.confirmPassword}
      />

      <Button type="submit" size="lg" className="mt-1.5 w-full" disabled={pending}>
        {pending ? "Building your library..." : "Create account"}
      </Button>
    </form>
  );
}