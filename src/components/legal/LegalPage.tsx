import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_UPDATED_AT } from "@/lib/site";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  related: { href: string; label: string };
};

export function LegalPage({ title, intro, sections, related }: LegalPageProps) {
  return (
    <main className="page-container flex max-w-[52rem] flex-col gap-8 py-12">
      <header className="flex flex-col gap-3">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-ink-soft">Last updated {LEGAL_UPDATED_AT}</span>
        <h1 className="font-display text-[38px] font-semibold leading-tight text-ink-strong">{title}</h1>
        <div className="text-[16px] leading-relaxed text-ink-soft">{intro}</div>
      </header>

      <nav aria-label="On this page" className="rounded-[1.5rem] border-[1.5px] border-[#EADFD2] bg-white p-5">
        <h2 className="mb-3 text-sm font-extrabold text-ink-strong">On this page</h2>
        <ol className="grid gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="font-bold text-sage-700 hover:text-sage-600">
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-8">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24">
            <h2 id={`${section.id}-title`} className="mb-3 font-display text-[22px] font-semibold text-ink-strong">
              {index + 1}. {section.title}
            </h2>
            <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-ink [&_a]:font-bold [&_a]:text-sage-700 [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:text-ink-strong [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t-[1.5px] border-[#F0E6DA] pt-6 text-[14px] text-ink-soft">
        Please also read our{" "}
        <Link href={related.href} className="font-bold text-sage-700 underline underline-offset-2">
          {related.label}
        </Link>
        .
      </footer>
    </main>
  );
}