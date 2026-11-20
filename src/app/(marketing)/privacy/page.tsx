import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses and protects your personal data.`,
};

const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who is responsible for your data",
    content: (
      <p>
        {SITE_NAME} ({SITE_URL}) is a personal, non-commercial project run by {OPERATOR_NAME}, an individual developer based in
        Indonesia. {OPERATOR_NAME} is the data controller for the personal data described here. You can reach us at any time at{" "}
        {email}.
      </p>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    content: (
      <>
        <p>
          <strong>Account details:</strong> your name, username, email address, the avatar you pick, and whether your email is
          verified. If you sign up with a password, we store it only as a secure hash, never as plain text.
        </p>
        <p>
          <strong>Sign in with Google:</strong> if you choose it, Google shares your name, email address, profile picture and a
          Google account ID with us. We do not access your Gmail, Drive, contacts or any other Google data.
        </p>
        <p>
          <strong>Your library:</strong> the PDF files you upload, book titles and authors, bookcases, your library name, reading
          progress, bookmarks, highlights, notes and saved words.
        </p>
        <p>
          <strong>Technical data:</strong> your IP address and browser details when you sign in (kept with your session), and short
          lived records of recent requests that we use for rate limits. Our hosting providers also keep standard server logs for a
          short time.
        </p>
        <p>
          <strong>On your device:</strong> a session cookie that keeps you signed in, and a few small settings stored in your browser,
          such as your preferred translation language. We do not use advertising or tracking cookies, and we do not use analytics.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it and why",
    content: (
      <>
        <p>We use your data only to:</p>
        <ul>
          <li>Create and run your account, and keep your library, reading progress and notes in sync.</li>
          <li>Send emails you need, such as verification, password reset and account deletion links.</li>
          <li>Translate or define words you select, only when you ask.</li>
          <li>Protect the service and its users from abuse, fraud and attacks.</li>
          <li>Meet our legal obligations.</li>
        </ul>
        <p>
          Under Indonesian Law No. 27 of 2022 on Personal Data Protection, we process your data on the basis of your consent when
          you create an account, to provide the service you asked for, and to meet legal obligations. If you are in the European
          Economic Area or the United Kingdom, the matching legal bases are performance of a contract, our legitimate interest in
          keeping the service secure, and legal obligation.
        </p>
        <p>
          We never sell your data, never use it for advertising, and never use your books or notes to train AI models. We do not make
          automated decisions that have legal or similarly significant effects on you.
        </p>
      </>
    ),
  },
  {
    id: "google",
    title: "Data from Google",
    content: (
      <p>
        {SITE_NAME}&apos;s use and transfer of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We use your Google name, email and picture only to create and sign in to your
        account, and we do not share them with anyone except the service providers listed below.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Services we work with",
    content: (
      <>
        <p>We rely on a small number of trusted providers. Each one only receives what it needs for its job:</p>
        <ul>
          <li><strong>Vercel</strong> hosts the website and runs the app.</li>
          <li><strong>Neon</strong> hosts the database with your account and library details.</li>
          <li><strong>Cloudflare R2</strong> stores your PDF files privately.</li>
          <li><strong>Resend</strong> sends account emails to your address.</li>
          <li><strong>Google</strong> handles sign in if you choose Sign in with Google.</li>
          <li>
            <strong>MyMemory</strong> and <strong>Free Dictionary API</strong> receive only the text you select when you use
            Translate. They do not receive your name, email or files.
          </li>
          <li>
            <strong>unpkg</strong> delivers font files used to display PDFs correctly. Like any website you load, it can see your IP
            address.
          </li>
        </ul>
        <p>
          We may also disclose data when required by a valid legal order from an authorized Indonesian authority, and only as much as
          that order requires.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Data stored outside Indonesia",
    content: (
      <p>
        Some of our providers store or process data outside Indonesia, for example in Singapore, Japan, the United States or the
        European Union. When this happens, we choose providers that apply strong security and data protection standards, and we
        transfer only the data needed for the service to work, in line with the transfer rules in Law No. 27 of 2022.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep data",
    content: (
      <ul>
        <li>Account and library data stay while your account exists.</li>
        <li>When you delete a book, its file is removed from storage right away.</li>
        <li>When you delete your account, your account, files, highlights, notes and saved words are deleted right away.</li>
        <li>Unfinished uploads are removed automatically within a day.</li>
        <li>Rate limit records are kept for no longer than a day. Sessions expire on their own or when you sign out.</li>
        <li>Short term backups and provider logs may keep traces of deleted data for a limited time before they are overwritten.</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    content: (
      <>
        <p>Under Law No. 27 of 2022 and similar laws elsewhere, you have the right to:</p>
        <ul>
          <li>Know what data we hold about you and why.</li>
          <li>Get access to, and a copy of, your personal data.</li>
          <li>Correct data that is wrong or incomplete.</li>
          <li>Delete your data and your account.</li>
          <li>Withdraw your consent, or ask us to pause or limit processing.</li>
          <li>Object to processing, and complain to the data protection authority in Indonesia or where you live.</li>
        </ul>
        <p>
          You can do much of this yourself: edit your profile, remove books and notes, or delete your whole account from the Profile
          page. For anything else, email {email} from the address on your account. We will confirm it is really you and respond
          within 3 x 24 hours where the law requires it, and as quickly as we can in every other case.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect your data",
    content: (
      <>
        <p>
          All traffic uses HTTPS. Passwords are hashed, files are stored privately and can only be opened by their owner through
          links that expire within minutes, every request checks who owns the data, and sign ins and other sensitive actions are
          rate limited. Only {OPERATOR_NAME} has administrative access to the systems.
        </p>
        <p>
          If a personal data breach ever happens, we will notify affected users and the authority in writing within 3 x 24 hours, as
          required by Law No. 27 of 2022, explaining what data was involved, when and how it happened, and what we are doing about it.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        If you are under 18, you need permission from a parent or legal guardian to use {SITE_NAME}. If we learn that we hold data
        about a child without that permission, we will delete it. Parents or guardians can contact us at {email}.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy as the service grows. The date at the top shows the latest version. If a change affects how we use
        your data in an important way, we will tell you by email or in the app before it takes effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions, requests or concerns about your privacy? Email {email}. You can also read our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          Your library is personal. This policy explains, in plain words, what we collect, why we need it, and how you stay in
          control.
        </p>
      }
      sections={sections}
      related={{ href: "/terms", label: "Terms of Service" }}
    />
  );
}