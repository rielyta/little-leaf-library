import { ButtonLink } from "@/components/ui/ButtonLink";

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="page-container py-22">
      <div className="flex flex-wrap items-center justify-between gap-7 rounded-[2.5rem] border-[1.5px] border-mist-200 bg-mist-100 px-8 py-14 md:px-12">
        <div className="flex min-w-0 flex-[1_1_24rem] flex-col gap-2.5">
          <h2 id="cta-title" className="font-display text-3xl font-semibold leading-tight text-mist-800 md:text-4xl">
            Your first shelf is waiting.
          </h2>
          <p className="text-[17px] leading-relaxed text-mist-700">
            Sign up, build a bookcase and shelve your first book tonight.
          </p>
        </div>
        <ButtonLink href="/register" size="lg">
          Sign up now
        </ButtonLink>
      </div>
    </section>
  );
}