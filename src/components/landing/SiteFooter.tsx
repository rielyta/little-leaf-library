import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

const footerLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[1.5px] border-wood-100">
      <div className="page-container flex flex-col gap-5 py-8 text-sm text-ink-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-[17px] font-semibold text-ink">{SITE_NAME}</span>
          <span>A little library for your personal PDF collection.</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-[1.5px] border-[#F0E6DA] pt-5">
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-bold text-ink transition-colors hover:text-sage-700">
                {link.label}
              </Link>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-ink transition-colors hover:text-sage-700">
              {CONTACT_EMAIL}
            </a>
          </nav>
          <span>
            &copy; {year} {SITE_NAME}
          </span>
        </div>
      </div>
    </footer>
  );
}