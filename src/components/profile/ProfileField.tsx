"use client";

import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextField } from "@/components/ui/TextField";

export type SaveResult = { ok: true; notice?: string } | { ok: false; error: string };

type ProfileFieldProps = {
  id: string;
  label: string;
  value: string;
  displayValue?: string;
  type?: "text" | "email";
  hint?: string;
  editHint: string;
  schema: z.ZodType<string>;
  onSave: (value: string) => Promise<SaveResult>;
};

export function ProfileField({
  id,
  label,
  value,
  displayValue,
  type = "text",
  hint,
  editHint,
  schema,
  onSave,
}: ProfileFieldProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startEditing() {
    setError(undefined);
    setNotice(null);
    setEditing(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const raw = new FormData(event.currentTarget).get(id);
    const parsed = schema.safeParse(typeof raw === "string" ? raw : "");

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }

    if (parsed.data === value) {
      setEditing(false);
      return;
    }

    setPending(true);
    const result = await onSave(parsed.data);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setEditing(false);
    setNotice(result.notice ?? null);
  }

  return (
    <div className="flex flex-col gap-2.5 border-t-[1.5px] border-[#F0E6DA] py-4">
      {editing ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-end gap-2">
            <TextField
              id={id}
              name={id}
              label={label}
              type={type}
              defaultValue={value}
              error={error}
              autoFocus
              className="flex-[1_1_14rem]"
            />
            <div className="flex gap-2 pb-[1px]">
              <Button variant="plain" onClick={() => setEditing(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <p className="text-[13px] text-ink-soft">{editHint}</p>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 flex-[1_1_14rem] flex-col gap-0.5">
            <span className="text-[13px] font-extrabold text-ink-soft">{label}</span>
            <span className="break-words text-[17px] font-bold text-ink-strong">{displayValue ?? value}</span>
            {hint && <span className="text-[13px] text-ink-soft">{hint}</span>}
          </div>
          <Button variant="outline" onClick={startEditing}>
            Edit
          </Button>
        </div>
      )}

      <FormAlert tone="success" message={notice} />
    </div>
  );
}