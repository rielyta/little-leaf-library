import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#reading", label: "Reading" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="page-container flex flex-wrap items-center justify-between gap-4 py-5">
      <Logo />

      <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[15px] font-bold text-ink transition-colors hover:text-sage-700"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <ButtonLink href="/login" variant="outline">
          Log in
        </ButtonLink>
        <ButtonLink href="/register">Sign up</ButtonLink>
      </div>
    </header>
  );
}