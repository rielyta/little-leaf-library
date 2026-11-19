import type { ComponentType, SVGProps } from "react";
import { BookmarkIcon, CommentIcon, HighlightIcon, ResumeIcon } from "@/components/icons";
import { OpenBookIllustration } from "@/components/illustrations/OpenBookIllustration";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconBg: string;
};

const features: Feature[] = [
  {
    title: "Bookmarks",
    description: "Tie a ribbon to important pages and come back anytime.",
    icon: BookmarkIcon,
    iconBg: "bg-blush-100",
  },
  {
    title: "Colored highlights",
    description: "Select a sentence and mark it pink, blue, green or yellow.",
    icon: HighlightIcon,
    iconBg: "bg-mist-100",
  },
  {
    title: "Comments on words",
    description: "Pick a word or sentence and leave a little note there.",
    icon: CommentIcon,
    iconBg: "bg-sage-100",
  },
  {
    title: "Pick up where you left off",
    description: "Open the book again and land right on your last page.",
    icon: ResumeIcon,
    iconBg: "bg-butter",
  },
];

export function ReadingFeatures() {
  return (
    <section
      id="reading"
      aria-labelledby="reading-title"
      className="page-container flex flex-wrap items-center gap-14 py-24"
    >
      <div className="flex min-w-0 flex-[1_1_27rem] justify-center">
        <OpenBookIllustration className="h-auto w-full max-w-[31rem]" />
      </div>

      <div className="flex min-w-0 flex-[1_1_27rem] flex-col gap-6.5">
        <SectionHeading
          id="reading-title"
          eyebrow="Reading"
          eyebrowClassName="text-sage-600"
          title="Reading feels like opening a real book"
        />

        <ul className="grid gap-5.5 sm:grid-cols-2">
          {features.map(({ title, description, icon: Icon, iconBg }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className={`flex size-11.5 flex-none items-center justify-center rounded-2xl ${iconBg}`}>
                <Icon className="size-6 text-ink" />
              </span>
              <div className="flex flex-col gap-1">
                <strong className="text-[17px]">{title}</strong>
                <span className="text-[15px] leading-relaxed text-ink-soft">{description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}