import type { Metadata } from "next";
import Link from "next/link";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirectIfSignedIn } from "@/server/session";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function RegisterPage() {
  await redirectIfSignedIn();

  return (
    <>
      <AuthTabs active="register" />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[34px] font-semibold text-ink-strong">Create your library</h1>
        <p className="text-ink-soft">One account for all your bookcases and books.</p>
      </header>

      <RegisterForm />
      <AuthDivider />
      <GoogleButton />

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-sage-600 underline hover:text-sage-700">
          Log in
        </Link>
      </p>
    </>
  );
}