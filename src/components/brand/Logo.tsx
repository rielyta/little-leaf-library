import Link from "next/link";

export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#DCEBDD" stroke="#5A4636" strokeWidth="1.5" />
      <path
        d="M11 25c0-8 5-14 15-15 0 9-6 15-15 15z"
        fill="#9CC5A1"
        stroke="#5A4636"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 24.5l8.5-8.5" stroke="#5A4636" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink">
      <LeafMark className="size-10" />
      <span className="font-display text-[22px] font-semibold">Little Leaf Library</span>
    </Link>
  );
}