import type { ComponentType, SVGProps } from "react";
import { BookcaseIcon, OpenBookIcon, UploadIcon } from "@/components/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

type Tone = "blush" | "mist" | "sage";

type Highlight = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: Tone;
};

const toneClasses: Record<Tone, { card: string; badge: string }> = {
  blush: { card: "bg-blush-50 border-blush-200", badge: "border-blush-200" },
  mist: { card: "bg-mist-50 border-mist-100", badge: "border-mist-100" },
  sage: { card: "bg-sage-50 border-sage-200", badge: "border-sage-200" },
};

const highlights: Highlight[] = [
  {
    title: "One bookcase, one category",
    description:
      "Create a bookcase for novels, classes or anything else. Slide the room sideways to move from one bookcase to the next.",
    icon: BookcaseIcon,
    tone: "blush",
  },
  {
    title: "Upload a PDF, get a book",
    description:
      "Choose the spine color yourself. Thickness follows the page count, so thick books really look thick.",
    icon: UploadIcon,
    tone: "mist",
  },
  {
    title: "Read like a real book",
    description:
      "Hover over a spine to see its title and author, click to open it, then turn the pages with a paper animation.",
    icon: OpenBookIcon,
    tone: "sage",
  },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-y-[1.5px] border-wood-100 bg-white">
      <div className="page-container flex flex-col gap-11 py-22">
        <SectionHeading
          id="about-title"
          eyebrow="About"
          title="What is Little Leaf Library?"
          description="Picture a quiet little room with bookcases of your own. Each bookcase holds one category, and every PDF you upload becomes a book standing on its shelf."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon, tone }) => (
            <article
              key={title}
              className={cn("flex flex-col gap-3.5 rounded-[1.75rem] border-[1.5px] p-7.5", toneClasses[tone].card)}
            >
              <div
                className={cn(
                  "flex size-15 items-center justify-center rounded-[1.25rem] border-[1.5px] bg-white",
                  toneClasses[tone].badge,
                )}
              >
                <Icon className="size-8 text-ink" />
              </div>
              <h3 className="font-display text-[22px] font-semibold text-ink-strong">{title}</h3>
              <p className="leading-relaxed text-ink-soft">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}