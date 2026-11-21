import { DialogLink } from "@/components/library/DialogLink";
import { cn } from "@/lib/cn";

export function NewBookcaseSlot({ className, description }: { className?: string; description?: string }) {
  return (
    <DialogLink
      href="/library?new=bookcase"
      className={cn(
        "flex w-65 flex-none snap-start flex-col items-center justify-center gap-3 rounded-t-[1.375rem] rounded-b-lg border-[2.5px] border-dashed border-wood-500 bg-[#FBF1EC] text-ink transition-colors hover:bg-blush-50",
        className,
      )}
    >
      <span className="flex size-15 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper">
        <svg viewBox="0 0 28 28" className="size-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M14 6v16M6 14h16" />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold">New bookcase</span>
      {description && <span className="px-7 text-center text-sm leading-normal text-ink-soft">{description}</span>}
    </DialogLink>
  );
}