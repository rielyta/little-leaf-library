"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateAvatar } from "@/app/(app)/profile/actions";
import { Avatar } from "@/components/avatar/Avatar";
import { FormAlert } from "@/components/ui/FormAlert";
import { AVATAR_ANIMALS, AVATAR_PALETTES, parseAvatar, type AvatarAnimal } from "@/lib/avatars";
import { cn } from "@/lib/cn";

const groupTitles: Record<AvatarAnimal, string> = {
  cat: "Cats",
  dog: "Dogs",
  rabbit: "Bunnies",
};

type AvatarPickerProps = {
  current: string;
  name: string;
  username: string;
};

export function AvatarPicker({ current, name, username }: AvatarPickerProps) {
  const [selected, setSelected] = useOptimistic(current);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { palette } = parseAvatar(selected);

  function choose(value: string) {
    if (value === selected) {
      return;
    }

    setError(null);
    startTransition(async () => {
      setSelected(value);
      const result = await updateAvatar(value);

      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <section
      aria-labelledby="avatar-title"
      className="flex min-w-0 flex-[1_1_24rem] flex-col gap-5 rounded-[1.75rem] border-[1.5px] border-[#EADFD2] bg-white p-6.5"
    >
      <div className="flex items-center gap-4.5 rounded-[1.375rem] bg-blush-50 p-4.5">
        <Avatar value={selected} size={112} />
        <div className="flex min-w-0 flex-col gap-1">
          <strong className="truncate font-display text-2xl font-semibold text-ink-strong">{name}</strong>
          <span className="truncate text-ink-soft">@{username}</span>
          <span className="mt-1 self-start rounded-full bg-sage-100 px-2.5 py-1 text-xs font-extrabold text-sage-700">
            {palette.name}
          </span>
        </div>
      </div>

      <h2 id="avatar-title" className="font-display text-xl font-semibold text-ink-strong">
        Choose your avatar
      </h2>

      <FormAlert message={error} />

      {AVATAR_ANIMALS.map((animal) => (
        <fieldset key={animal} className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[13px] font-extrabold uppercase tracking-[0.06em] text-ink-soft">
            {groupTitles[animal]}
          </legend>
          <div className="grid grid-cols-4 gap-2.5">
            {AVATAR_PALETTES[animal].map((option, variant) => {
              const value = `${animal}-${variant}`;
              const isSelected = value === selected;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => choose(value)}
                  aria-pressed={isSelected}
                  aria-label={option.name}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-[1.375rem] border-[1.5px] p-1.5 transition-colors",
                    isSelected ? "border-ink bg-blush-50 shadow-[0_0_0_3px_#F2B8C6]" : "border-[#EADFD2] bg-white hover:bg-paper",
                  )}
                >
                  <Avatar value={value} size={64} className="h-auto w-full max-w-16" />
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </section>
  );
}