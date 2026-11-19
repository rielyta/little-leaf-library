"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="soft" onClick={handleClick} disabled={pending}>
      {pending ? "Logging out..." : "Log out"}
    </Button>
  );
}