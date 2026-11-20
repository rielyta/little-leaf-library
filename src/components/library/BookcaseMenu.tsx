"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type BookcaseMenuProps = {
  bookcaseId: string;
  name: string;
  bookCount: number;
};

function MenuLink({
  href,
  icon,
  tone = "default",
  onSelect,
  children,
}: {
  href: string;
  icon: ReactNode;
  tone?: "default" | "danger";
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-bold transition-colors",
        tone === "danger" ? "text-danger hover:bg-blush-50" : "text-ink-strong hover:bg-white",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

const iconProps = {
  viewBox: "0 0 20 20",
  className: "size-4 flex-none",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function BookcaseMenu({ bookcaseId, name, bookCount }: BookcaseMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div ref={rootRef} className="relative min-w-0 max-w-full">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`${name} bookcase options`}
        className="flex min-w-0 max-w-full items-center gap-1.5 rounded-[10px] border-[1.5px] border-ink bg-paper py-0.5 pl-4 pr-2.5 font-display text-base font-semibold text-ink-strong transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
      >
        <span className="truncate">{name}</span>
        <svg
          viewBox="0 0 12 12"
          className={cn("size-3 flex-none text-ink-soft transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={`${name} bookcase`}
          className="absolute left-1/2 top-[calc(100%+10px)] z-40 flex w-52 -translate-x-1/2 flex-col gap-0.5 rounded-2xl border-[1.5px] border-ink bg-paper p-1.5 shadow-[0_5px_0_#CFE3EA]"
        >
          <MenuLink
            href={`/library?edit=${bookcaseId}`}
            onSelect={close}
            icon={
              <svg {...iconProps}>
                <path d="M12 3.5l4.5 4.5L7.5 17H3v-4.5z" />
              </svg>
            }
          >
            Rename or recolor
          </MenuLink>

          {bookCount > 0 && (
            <MenuLink
              href={`/library?manage=${bookcaseId}`}
              onSelect={close}
              icon={
                <svg {...iconProps}>
                  <path d="M4 3.5h3v13H4zM8.5 3.5h3v13h-3zM13 4.5l2.8-.7 2.4 12.5-2.8.7z" />
                </svg>
              }
            >
              Manage books
            </MenuLink>
          )}

          <MenuLink
            href={`/library?remove=${bookcaseId}`}
            onSelect={close}
            tone="danger"
            icon={
              <svg {...iconProps}>
                <path d="M3.5 5.5h13M8 5.5V3.5h4v2M5.5 5.5l.8 11h7.4l.8-11M8.5 8.5v5M11.5 8.5v5" />
              </svg>
            }
          >
            Delete bookcase
          </MenuLink>
        </div>
      )}
    </div>
  );
}