import "server-only";
import { renderEmail } from "@/server/emails/layout";

export function resetPasswordEmail({ name, url }: { name: string; url: string }) {
  return {
    subject: "Reset your Little Leaf Library password",
    ...renderEmail({
      name,
      url,
      intro: "We received a request to reset your password. Use the button below to choose a new one.",
      buttonLabel: "Choose a new password",
      footnote: "This link expires in 1 hour. If you did not ask for this, you can ignore this email.",
    }),
  };
}