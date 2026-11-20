import "server-only";
import { renderEmail } from "@/server/emails/layout";

export function verifyEmailEmail({ name, url }: { name: string; url: string }) {
  return {
    subject: "Verify your email for Little Leaf Library",
    ...renderEmail({
      name,
      url,
      intro: "Thanks for joining Little Leaf Library. Confirm that this is your email and your library will be ready to open.",
      buttonLabel: "Verify my email",
      footnote: "This link expires in 24 hours. If you did not create an account, you can ignore this email.",
    }),
  };
}