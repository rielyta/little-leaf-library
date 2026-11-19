"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookcase } from "@/components/library/Bookcase";
import { NewBookcaseSlot } from "@/components/library/NewBookcaseSlot";
import { RoomBackdrop } from "@/components/library/RoomBackdrop";
import type { BookcaseSummary } from "@/lib/bookcases";
import { cn } from "@/lib/cn";

const BOOKCASE_STEP = 344;

type LibraryRoomProps = {
  bookcases: BookcaseSummary[];
};

function ArrowButton({ direction, disabled, onClick }: { direction: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous bookcase" : "Next bookcase"}
      className={cn(
        "absolute top-[46%] z-40 flex size-13 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper transition-opacity disabled:opacity-40",
        direction === "prev" ? "left-5" : "right-5",
      )}
    >
      <svg viewBox="0 0 22 22" className="size-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={direction === "prev" ? "M13.5 5l-6 6 6 6" : "M8.5 5l6 6-6 6"} />
      </svg>
    </button>
  );
}

export function LibraryRoom({ bookcases }: LibraryRoomProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const syncPosition = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    setActive(Math.min(bookcases.length - 1, Math.round(scroller.scrollLeft / BOOKCASE_STEP)));
    setAtEnd(scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4);
  }, [bookcases.length]);

  useEffect(() => {
    syncPosition();
    window.addEventListener("resize", syncPosition);
    return () => window.removeEventListener("resize", syncPosition);
  }, [syncPosition]);

  function goTo(index: number) {
    scrollerRef.current?.scrollTo({ left: index * BOOKCASE_STEP, behavior: "smooth" });
  }

  function step(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * BOOKCASE_STEP, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-[calc(100vh-4.75rem)] flex-col">
      <nav aria-label="Jump to a bookcase" className="flex flex-wrap items-center gap-2.5 border-b-[1.5px] border-wood-200 bg-cream px-8 py-3">
        <span className="mr-1 text-[13px] font-extrabold uppercase tracking-[0.06em] text-ink-soft">Bookcases</span>
        {bookcases.map((bookcase, index) => (
          <button
            key={bookcase.id}
            type="button"
            onClick={() => goTo(index)}
            aria-current={index === active ? "true" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-xl border-[1.5px] px-4 text-sm font-bold transition-colors",
              index === active ? "border-ink bg-blush-100" : "border-line bg-white hover:bg-paper",
            )}
          >
            {bookcase.name}
            <span className="rounded-full bg-white px-2 text-xs font-extrabold text-ink-soft">{bookcase.books.length}</span>
          </button>
        ))}
      </nav>

      <main className="relative flex flex-1 flex-col justify-end overflow-hidden bg-blush-100">
        <RoomBackdrop />

        <ArrowButton direction="prev" disabled={active === 0} onClick={() => step(-1)} />
        <ArrowButton direction="next" disabled={atEnd} onClick={() => step(1)} />

        <div
          ref={scrollerRef}
          onScroll={syncPosition}
          className="scrollbar-none relative flex snap-x snap-mandatory items-end gap-11 overflow-x-auto scroll-px-24 px-24 pb-21 pt-17.5"
        >
          {bookcases.map((bookcase, index) => (
            <Bookcase key={bookcase.id} bookcase={bookcase} index={index} />
          ))}
          <NewBookcaseSlot className="mb-3.5 h-119.5" />
        </div>
      </main>
    </div>
  );
}