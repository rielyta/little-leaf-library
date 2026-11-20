import { cn } from "@/lib/cn";
import { formatBytes, type StorageUsage } from "@/lib/storage-quota";

const NEARLY_FULL_PERCENT = 85;

type StorageMeterProps = {
  usage: StorageUsage;
  className?: string;
};

export function StorageMeter({ usage, className }: StorageMeterProps) {
  if (usage.limit === null || usage.remaining === null) {
    return (
      <div className={cn("flex items-center justify-between gap-3 text-[13px]", className)}>
        <span className="font-bold text-ink">{formatBytes(usage.used)} used</span>
        <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-extrabold text-sage-700">No limit</span>
      </div>
    );
  }

  const isNearlyFull = usage.percent >= NEARLY_FULL_PERCENT;
  const summary = `${formatBytes(usage.used)} of ${formatBytes(usage.limit)} used`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="font-bold text-ink">{summary}</span>
        <span className={cn("font-extrabold", isNearlyFull ? "text-blush-700" : "text-ink-soft")}>
          {formatBytes(usage.remaining)} left
        </span>
      </div>
      <div
        role="meter"
        aria-label="Shelf space"
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-valuenow={usage.used}
        aria-valuetext={summary}
        className="h-2 overflow-hidden rounded-full bg-wood-100"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", isNearlyFull ? "bg-[#E7A3B3]" : "bg-sage-400")}
          style={{ width: `${usage.percent}%` }}
        />
      </div>
    </div>
  );
}