import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  eyebrowClassName?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  eyebrowClassName = "text-blush-700",
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3.5",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      {eyebrow && (
        <span className={cn("text-[13px] font-extrabold uppercase tracking-[0.08em]", eyebrowClassName)}>
          {eyebrow}
        </span>
      )}
      <h2
        id={id}
        className="font-display text-3xl font-semibold leading-tight text-ink-strong md:text-[2.5rem]"
      >
        {title}
      </h2>
      {description && <p className="text-[17px] leading-relaxed text-ink-soft">{description}</p>}
    </div>
  );
}