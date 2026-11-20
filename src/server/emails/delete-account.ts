import "server-only";
import { renderEmail } from "@/server/emails/layout";

export function deleteAccountEmail({ name, url }: { name: string; url: string }) {
  return {
    subject: "Confirm deleting your Little Leaf Library account",
    ...renderEmail({
      name,
      url,
      intro:
        "We got a request to delete your Little Leaf Library account. Once you confirm, your bookcases, books, highlights, notes and saved words are removed for good.",
      buttonLabel: "Delete my account",
      footnote:
        "Open this link in the same browser where you are logged in. If you did not ask for this, ignore this email and your library stays just as it is.",
    }),
  };
}