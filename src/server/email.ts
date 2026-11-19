import "server-only";
import { Resend } from "resend";

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Little Leaf Library <onboarding@resend.dev>";
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(message: EmailMessage) {
  if (!resend) {
    console.info(`\n[email] To: ${message.to}\n[email] Subject: ${message.subject}\n\n${message.text}\n`);
    return;
  }

  const { error } = await resend.emails.send({ from, ...message });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}