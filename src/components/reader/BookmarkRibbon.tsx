import type { PageSide } from "@/components/reader/PaperPage";
import { cn } from "@/lib/cn";

type BookmarkRibbonProps = {
  page: number;
  side: PageSide;
  active: boolean;
  onToggle: (page: number) => void;
};

export function BookmarkRibbon({ page, side, active, onToggle }: BookmarkRibbonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(page)}
      aria-pressed={active}
      aria-label={active ? `Remove bookmark from page ${page}` : `Bookmark page ${page}`}
      title={active ? "Remove bookmark" : "Bookmark this page"}
      className={cn(
        "group/ribbon absolute top-0 z-20 flex h-20 w-10 justify-center focus-visible:outline-none",
        side === "left" ? "left-14" : "right-14",
      )}
    >
      <span
        className={cn(
          "block w-7 border-x-[1.5px] border-ink/30 transition-all duration-200 [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]",
          active
            ? "h-18 bg-blush-400"
            : "h-9 bg-wood-300 opacity-40 group-hover/ribbon:h-12 group-focus-visible/ribbon:opacity-100 lg:opacity-0 lg:group-hover/page:opacity-80",
        )}
      />
    </button>
  );
}