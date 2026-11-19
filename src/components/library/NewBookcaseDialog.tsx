"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { createBookcase, type CreateBookcaseState } from "@/app/(app)/library/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { BOOKCASE_NAME_MAX_LENGTH, WOOD_KEYS, WOODS, type WoodKey } from "@/lib/bookcases";
import { cn } from "@/lib/cn";

const initialState: CreateBookcaseState = {};

function BookcasePreview({ name, wood }: { name: string; wood: WoodKey }) {
  const colors = WOODS[wood];

  return (
    <div aria-hidden="true" className="relative flex w-47.5 flex-none flex-col justify-end overflow-hidden rounded-[1.25rem] bg-blush-100 px-4 pt-4.5">
      <div className="absolute inset-x-0 bottom-0 h-30 border-t-[6px] border-cream bg-mist-100" />
      <div className="relative flex flex-col">
        <div className="flex h-7.5 items-center justify-center rounded-t-xl rounded-b-[3px] border-[1.5px] border-ink px-1.5" style={{ backgroundColor: colors.light }}>
          <span className="max-w-32 truncate rounded-lg border-[1.5px] border-ink bg-paper px-2.5 py-px font-display text-[13px] font-semibold">
            {name.trim() || "Bookcase name"}
          </span>
        </div>
        <div className="flex flex-col gap-2 border-[1.5px] border-t-0 border-ink p-2" style={{ backgroundColor: colors.dark }}>
          {[0, 1, 2].map((shelf) => (
            <div key={shelf} className="h-16.5 rounded-[3px] border-[1.5px] border-b-[6px] border-ink bg-wood-200" style={{ borderBottomColor: colors.light }} />
          ))}
        </div>
        <div className="flex justify-between px-2.5 pb-3.5">
          <span className="h-2.5 w-4 rounded-b border-[1.5px] border-t-0 border-ink" style={{ backgroundColor: colors.dark }} />
          <span className="h-2.5 w-4 rounded-b border-[1.5px] border-t-0 border-ink" style={{ backgroundColor: colors.dark }} />
        </div>
      </div>
    </div>
  );
}

export function NewBookcaseDialog({ open }: { open: boolean }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(createBookcase, initialState);
  const [name, setName] = useState("");
  const [wood, setWood] = useState<WoodKey>("honey");

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [open]);

  function close() {
    router.replace("/library", { scroll: false });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      aria-labelledby="new-bookcase-title"
      className="m-auto w-[min(40rem,calc(100%-2rem))] rounded-[1.875rem] border-[1.5px] border-ink bg-paper p-7 text-ink shadow-[0_8px_0_#EBB4C0] backdrop:bg-ink-strong/40"
    >
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 id="new-bookcase-title" className="font-display text-[26px] font-semibold text-ink-strong">
            New bookcase
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-line hover:bg-white"
          >
            <svg viewBox="0 0 18 18" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-4.5">
            <TextField
              label="Category name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={BOOKCASE_NAME_MAX_LENGTH}
              placeholder="e.g. Novels, Classes, Recipes"
              autoComplete="off"
              error={state.errors?.name}
            />

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-bold">Wood color</legend>
              {WOOD_KEYS.map((key) => (
                <label
                  key={key}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-3.5 text-sm font-bold transition-colors",
                    wood === key ? "border-ink bg-blush-50" : "border-line bg-white hover:bg-paper",
                  )}
                >
                  <input
                    type="radio"
                    name="wood"
                    value={key}
                    checked={wood === key}
                    onChange={() => setWood(key)}
                    className="sr-only"
                  />
                  <span className="size-6.5 rounded-lg border-[1.5px] border-ink" style={{ backgroundColor: WOODS[key].light }} />
                  {WOODS[key].label}
                </label>
              ))}
              {state.errors?.wood && <p className="text-[13px] font-semibold text-danger">{state.errors.wood}</p>}
            </fieldset>
          </div>

          <BookcasePreview name={name} wood={wood} />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => dialogRef.current?.close()} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Building..." : "Create bookcase"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}