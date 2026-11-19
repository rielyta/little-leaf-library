import type { Metadata } from "next";
import Link from "next/link";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { redirectIfSignedIn } from "@/server/session";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  await redirectIfSignedIn();

  return (
    <>
      <AuthTabs active="login" />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[34px] font-semibold text-ink-strong">Welcome back</h1>
        <p className="text-ink-soft">Log in to your little library.</p>
      </header>

      <LoginForm />
      <AuthDivider />
      <GoogleButton />

      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/register" className="font-extrabold text-sage-600 underline hover:text-sage-700">
          Create an account
        </Link>
      </p>
    </>
  );
}