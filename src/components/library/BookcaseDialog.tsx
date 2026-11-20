"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { createBookcase, updateBookcase, type BookcaseFormState } from "@/app/(app)/library/actions";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import {
  BOOKCASE_NAME_MAX_LENGTH,
  DEFAULT_SHELVES,
  isShelfCount,
  SHELF_OPTIONS,
  WOOD_KEYS,
  WOODS,
  type ShelfCount,
  type WoodKey,
} from "@/lib/bookcases";
import { cn } from "@/lib/cn";

const initialState: BookcaseFormState = {};

type EditableBookcase = {
  id: string;
  name: string;
  wood: WoodKey;
  shelves: number;
};

type BookcaseDialogProps = {
  open: boolean;
  bookcase?: EditableBookcase;
};

function BookcasePreview({ name, wood, shelves }: { name: string; wood: WoodKey; shelves: ShelfCount }) {
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
          {Array.from({ length: shelves }, (_, shelf) => (
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

function ShelfIcon({ count }: { count: ShelfCount }) {
  return (
    <span aria-hidden="true" className="flex w-7 flex-none flex-col gap-0.5 rounded-[5px] border-[1.5px] border-ink bg-wood-300 p-0.5">
      {Array.from({ length: count }, (_, shelf) => (
        <span key={shelf} className="h-1.5 rounded-[2px] bg-wood-100" />
      ))}
    </span>
  );
}

export function BookcaseDialog({ open, bookcase }: BookcaseDialogProps) {
  const router = useRouter();
  const isEditing = Boolean(bookcase);
  const action = bookcase ? updateBookcase.bind(null, bookcase.id) : createBookcase;
  const savedShelves = bookcase && isShelfCount(bookcase.shelves) ? bookcase.shelves : DEFAULT_SHELVES;

  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(bookcase?.name ?? "");
  const [wood, setWood] = useState<WoodKey>(bookcase?.wood ?? "honey");
  const [shelves, setShelves] = useState<ShelfCount>(savedShelves);

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit bookcase" : "New bookcase"}
      titleId="bookcase-dialog-title"
      onClose={() => router.replace("/library", { scroll: false })}
    >
      <form action={formAction} className="flex flex-col gap-5">
        <FormAlert message={state.formError ?? null} />

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
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-3.5 text-sm font-bold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-600",
                    wood === key ? "border-ink bg-blush-50" : "border-line bg-white hover:bg-paper",
                  )}
                >
                  <input type="radio" name="wood" value={key} checked={wood === key} onChange={() => setWood(key)} className="sr-only" />
                  <span className="size-6.5 rounded-lg border-[1.5px] border-ink" style={{ backgroundColor: WOODS[key].light }} />
                  {WOODS[key].label}
                </label>
              ))}
              {state.errors?.wood && <p className="text-[13px] font-semibold text-danger">{state.errors.wood}</p>}
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-bold">Shelves</legend>
              <div className="grid grid-cols-2 gap-2">
                {SHELF_OPTIONS.map((count) => (
                  <label
                    key={count}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-3.5 text-sm font-bold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-600",
                      shelves === count ? "border-ink bg-blush-50" : "border-line bg-white hover:bg-paper",
                    )}
                  >
                    <input
                      type="radio"
                      name="shelves"
                      value={count}
                      checked={shelves === count}
                      onChange={() => setShelves(count)}
                      className="sr-only"
                    />
                    <ShelfIcon count={count} />
                    {count} shelves
                  </label>
                ))}
              </div>
              <span className="text-[13px] leading-relaxed text-ink-soft">
                When the shelves fill up, the bookcase grows an extra shelf on its own.
              </span>
              {state.errors?.shelves && <p className="text-[13px] font-semibold text-danger">{state.errors.shelves}</p>}
            </fieldset>
          </div>

          <BookcasePreview name={name} wood={wood} shelves={shelves} />
        </div>

        <div className="flex justify-end gap-3">
          <ModalCancelButton disabled={pending} />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : isEditing ? "Save changes" : "Create bookcase"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}