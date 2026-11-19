import { StorefrontIllustration } from "@/components/illustrations/StorefrontIllustration";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function Hero() {
  return (
    <section className="page-container flex flex-wrap items-center gap-12 pb-18 pt-8">
      <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-5.5">
        <span className="self-start rounded-full bg-sage-100 px-3.5 py-1.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-sage-700">
          A cozy personal library
        </span>

        <h1 className="font-display text-[2.75rem] font-semibold leading-[1.08] text-ink-strong lg:text-[3.5rem]">
          All your books, neatly shelved in a little bookcase of your own.
        </h1>

        <p className="max-w-[32.5rem] text-lg leading-relaxed text-ink-soft">
          Little Leaf Library is a place to keep and read your PDF collection. Sort books into
          bookcases by category, then read with pages you can flip like a real book.
        </p>

        <div className="mt-1.5 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Build my library
          </ButtonLink>
          <ButtonLink href="/login" variant="soft" size="lg">
            I already have an account
          </ButtonLink>
        </div>
      </div>

      <div className="flex min-w-0 flex-[1_1_28rem] justify-center">
        <StorefrontIllustration className="h-auto w-full max-w-[35rem]" />
      </div>
    </section>
  );
}