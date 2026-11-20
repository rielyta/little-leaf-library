"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { updateLibraryName, type LibraryNameState } from "@/app/(app)/library/actions";
import { Button } from "@/components/ui/Button";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { LIBRARY_NAME_MAX_LENGTH } from "@/lib/library";

const initialState: LibraryNameState = {};

type LibraryNameDialogProps = {
  savedName: string | null;
  defaultName: string;
};

export function LibraryNameDialog({ savedName, defaultName }: LibraryNameDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateLibraryName, initialState);
  const [value, setValue] = useState(savedName ?? "");

  return (
    <Modal open title="Name your library" titleId="library-name-title" onClose={() => router.replace("/library", { scroll: false })}>
      <form action={formAction} className="flex flex-col gap-5">
        <div aria-hidden="true" className="flex justify-center rounded-[1.25rem] bg-blush-100 px-4 py-7">
          <span className="max-w-full rounded-[1.25rem] border-[1.5px] border-ink bg-wood-300 p-1.5">
            <span className="block truncate rounded-[0.9rem] border-[1.5px] border-ink bg-paper px-6 pb-1.5 pt-0.5 font-[family-name:var(--font-pacifico)] text-2xl leading-[1.6] text-ink-strong">
              {value.trim() || defaultName}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <TextField
            label="Library name"
            name="libraryName"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={LIBRARY_NAME_MAX_LENGTH}
            placeholder={defaultName}
            autoComplete="off"
            error={state.errors?.libraryName}
          />
          <span className="text-[13px] text-ink-soft">Leave it empty to use &quot;{defaultName}&quot;.</span>
        </div>

        <div className="flex justify-end gap-3">
          <ModalCancelButton disabled={pending} />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save name"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}