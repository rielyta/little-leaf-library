"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

function closeNearestDialog(event: MouseEvent<HTMLElement>) {
  event.currentTarget.closest("dialog")?.close();
}

export function Modal({ open, title, titleId, onClose, className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className={cn(
        "m-auto max-h-[calc(100vh-2rem)] w-[min(40rem,calc(100%-2rem))] overflow-y-auto rounded-[1.875rem] border-[1.5px] border-ink bg-paper p-7 text-ink shadow-[0_8px_0_#EBB4C0] backdrop:bg-ink-strong/40",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id={titleId} className="font-display text-[26px] font-semibold text-ink-strong">
          {title}
        </h2>
        <button
          type="button"
          onClick={closeNearestDialog}
          aria-label="Close"
          className="flex size-11 flex-none items-center justify-center rounded-full border-[1.5px] border-line hover:bg-white"
        >
          <svg viewBox="0 0 18 18" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ModalCancelButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button variant="outline" onClick={closeNearestDialog} disabled={disabled}>
      Cancel
    </Button>
  );
}