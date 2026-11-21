"use client";

import type { MouseEvent, ReactNode } from "react";
import { openLibraryDialog } from "@/lib/library-dialog";

type DialogLinkProps = {
  href: string;
  className?: string;
  role?: string;
  "aria-label"?: string;
  onClick?: () => void;
  children: ReactNode;
};

function opensElsewhere(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function DialogLink({ href, onClick, children, ...props }: DialogLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.();

    if (opensElsewhere(event)) {
      return;
    }

    event.preventDefault();
    openLibraryDialog(href);
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}