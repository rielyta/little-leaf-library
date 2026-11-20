import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { formatBytes, MAX_BOOK_FILE_BYTES, STORAGE_QUOTA_BYTES } from "@/lib/storage-quota";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The rules for using ${SITE_NAME}.`,
};

const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "About these terms",
    content: (
      <>
        <p>
          {SITE_NAME} ({SITE_URL}) is a personal, non-commercial project run by {OPERATOR_NAME}, an individual developer based in
          Indonesia. These terms explain the rules for using the service. By creating an account or using {SITE_NAME}, you agree to
          these terms and to our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>
          If you do not agree, please do not use the service. Nothing in these terms takes away rights you have under laws that
          cannot be changed by agreement, including consumer and data protection laws where you live.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use the service",
    content: (
      <ul>
        <li>You must be able to make a binding agreement under the law that applies to you.</li>
        <li>If you are under 18, you may only use the service with permission from a parent or legal guardian, who agrees to these terms on your behalf.</li>
        <li>You may not use the service if the law where you live does not allow it, or if your account was removed before for breaking these terms.</li>
      </ul>
    ),
  },
  {
    id: "account",
    title: "Your account",
    content: (
      <ul>
        <li>Give accurate information when you sign up, and keep your email address working so we can reach you.</li>
        <li>Keep your password private and use one you do not use anywhere else. You are responsible for activity on your account.</li>
        <li>Tell us right away at {email} if you think someone else has accessed your account.</li>
        <li>One person, one account. Accounts may not be sold, shared or transferred.</li>
      </ul>
    ),
  },
  {
    id: "your-content",
    title: "Your books and notes",
    content: (
      <>
        <p>
          You keep all rights to the files, highlights, notes and saved words you add (your content). We do not claim ownership of
          them. You give us only the limited permission we need to store, process and show your content back to you so the service
          works, for example turning PDF pages into images in your reader.
        </p>
        <p>
          Your library is private. We do not publish, sell or share your content, and we do not look at it except when you ask us to,
          when needed to keep the service safe, or when the law requires it.
        </p>
        <p>
          {SITE_NAME} is not a backup service. Always keep your own copies of the files you upload.
        </p>
      </>
    ),
  },
  {
    id: "copyright",
    title: "Copyright",
    content: (
      <>
        <p>
          Only upload files you have the right to keep and read, such as books in the public domain, your own writing, or files you
          lawfully own that allow personal copies. Uploading pirated books or other material that infringes someone else&apos;s
          rights is not allowed, in line with Indonesian Law No. 28 of 2014 on Copyright and the copyright laws of other countries.
        </p>
        <p>
          If you believe content on {SITE_NAME} infringes your copyright, email {email} with your contact details, a description of
          the work, enough information for us to find the content, and a statement that your complaint is accurate and made in good
          faith. We will review it promptly, may remove the content, and will close the accounts of people who infringe repeatedly.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>You agree not to use {SITE_NAME} to:</p>
        <ul>
          <li>
            Store or share anything that is illegal under Indonesian law, including Law No. 11 of 2008 on Electronic Information and
            Transactions and its amendments, or under the law where you live.
          </li>
          <li>Store material that sexually exploits or endangers children, promotes terrorism, or encourages violence against anyone.</li>
          <li>Upload malware, viruses, or files designed to harm devices, people or systems.</li>
          <li>Access, or try to access, another person&apos;s account, books or data.</li>
          <li>Get around storage limits, rate limits, email verification or any other protection, or create accounts automatically.</li>
          <li>Overload, scan, scrape or attack the service, or use it in a way that harms its availability for others.</li>
          <li>Copy, resell or offer the service to others as your own.</li>
          <li>Pretend to be someone else, or use the service to harass, threaten or deceive anyone.</li>
        </ul>
      </>
    ),
  },
  {
    id: "limits",
    title: "Storage and fair use limits",
    content: (
      <>
        <p>
          To keep the service free and fair for everyone, each account has {formatBytes(STORAGE_QUOTA_BYTES)} of space for PDFs, and
          each book can be up to {formatBytes(MAX_BOOK_FILE_BYTES)}. Uploads, sign ins, translations and similar actions are also
          limited to a reasonable number within a short time.
        </p>
        <p>We may change these limits in the future. If a change affects how much you can store, we will let you know first.</p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "Translations and other services",
    content: (
      <p>
        Some features rely on other services, such as Google for signing in and public translation and dictionary services for the
        translate feature. Translations and definitions come from those services and may not always be accurate. The{" "}
        <Link href="/privacy#sharing">Privacy Policy</Link> lists every service we use and what each one receives.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security and reporting problems",
    content: (
      <>
        <p>
          We protect the service with encrypted connections (HTTPS), securely hashed passwords, email verification, private file
          storage that only the owner can open through short-lived links, ownership checks on every request, and rate limits against
          abuse. No system is perfectly secure, so we cannot promise that a breach will never happen. If one does, we will act as
          described in the <Link href="/privacy#security">Privacy Policy</Link>.
        </p>
        <p>
          If you find a security problem, please email {email} with the details. When looking into it, please do not access, change
          or delete data that is not yours, do not disrupt the service, and give us reasonable time to fix the issue before sharing
          it publicly. We will not take action against anyone who reports a problem in good faith and follows these rules.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes to the service",
    content: (
      <>
        <p>
          {SITE_NAME} is a personal project, offered free of charge and on an &quot;as is&quot; and &quot;as available&quot; basis.
          We work to keep it running well, but it may sometimes be unavailable, change, or have bugs.
        </p>
        <p>
          We may add, change or remove features. If we ever decide to shut the service down, we will give you at least 30 days of
          notice by email, so you have time to make sure you have your own copies of your books.
        </p>
      </>
    ),
  },
  {
    id: "ending",
    title: "Ending your use",
    content: (
      <>
        <p>
          You can stop using {SITE_NAME} at any time and delete your account from your Profile page. Deleting your account removes
          your books, files, highlights, notes and saved words for good.
        </p>
        <p>
          We may suspend or close an account that seriously or repeatedly breaks these terms, puts other people or the service at
          risk, or when the law requires it. Where it is safe and lawful, we will tell you why and give you a chance to respond.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Responsibility",
    content: (
      <>
        <p>
          To the extent the law allows, we are not responsible for indirect losses, lost data or files you did not keep a copy of,
          or problems caused by services we do not control. Because the service is free, our total responsibility to you for any
          claim is limited to the amount you paid us to use it, which is zero.
        </p>
        <p>
          These limits do not apply where the law does not allow them, for example for harm caused on purpose or through gross
          negligence.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws of the Republic of Indonesia. If a disagreement comes up, please contact us first so we
        can try to solve it together in good faith. If that does not work, it will be settled by the competent courts in Indonesia,
        without taking away any right you have to bring a claim in the courts where you live.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms from time to time. The date at the top shows the latest version. If a change is important, we will
        tell you by email or in the app before it takes effect. If you keep using {SITE_NAME} after that, you accept the new terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: <p>Questions about these terms? Email {email}. We read every message.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={<p>The simple rules that keep {SITE_NAME} a safe, cozy place for every reader.</p>}
      sections={sections}
      related={{ href: "/privacy", label: "Privacy Policy" }}
    />
  );
}