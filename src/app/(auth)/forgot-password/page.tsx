import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[34px] font-semibold text-ink-strong">Forgot your password?</h1>
        <p className="leading-relaxed text-ink-soft">
          Enter the email you use for your library and we will send you a link to choose a new password.
        </p>
      </header>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-ink-soft">
        Remembered it?{" "}
        <Link href="/login" className="font-extrabold text-sage-600 underline hover:text-sage-700">
          Back to log in
        </Link>
      </p>
    </>
  );
}