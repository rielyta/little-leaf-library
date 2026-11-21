import { DialogLink } from "@/components/library/DialogLink";

function Sprig({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg viewBox="0 0 24 20" className="h-4 w-5 flex-none" style={flipped ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
      <path d="M2 16c6-1 12-5 19-12" stroke="#5E8C6A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="9" cy="10" rx="4.5" ry="2.4" transform="rotate(-35 9 10)" fill="#BFD8C2" stroke="#5A4636" strokeWidth="1.1" />
      <ellipse cx="16" cy="5" rx="4.5" ry="2.4" transform="rotate(-35 16 5)" fill="#9CC5A1" stroke="#5A4636" strokeWidth="1.1" />
    </svg>
  );
}

export function LibrarySign({ name }: { name: string }) {
  return (
    <DialogLink
      href="/library?rename=library"
      aria-label={`${name}. Rename your library`}
      className="group pointer-events-auto flex max-w-[calc(100vw-2rem)] origin-top flex-col items-center transition-transform duration-300 hover:-rotate-1 focus-visible:outline-none"
    >
      <span aria-hidden="true" className="flex w-3/5 justify-between">
        <span className="h-5 w-[1.5px] bg-ink/50" />
        <span className="h-5 w-[1.5px] bg-ink/50" />
      </span>
      <span className="max-w-full rounded-[1.25rem] border-[1.5px] border-ink bg-wood-300 p-1.5 shadow-[0_6px_0_rgba(90,70,54,0.15)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-sage-600">
        <span className="flex min-w-0 items-center gap-2.5 rounded-[0.9rem] border-[1.5px] border-ink bg-paper px-5 pb-1.5 pt-0.5 sm:px-7">
          <Sprig />
          <span className="truncate font-[family-name:var(--font-pacifico)] text-xl leading-[1.6] text-ink-strong sm:text-[26px]">{name}</span>
          <Sprig flipped />
        </span>
      </span>
      <span className="mt-1.5 text-[11px] font-extrabold text-ink-soft opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Click to rename
      </span>
    </DialogLink>
  );
}