"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { authClient } from "@/lib/auth-client";

export function GoogleButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/library",
      newUserCallbackURL: "/welcome",
    });

    if (signInError) {
      setError("Google sign in is not available right now. Please use your email instead.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="plain" className="w-full" onClick={handleClick} disabled={pending}>
        {pending ? "Connecting to Google..." : "Continue with Google"}
      </Button>
      <FormAlert message={error} />
    </div>
  );
}