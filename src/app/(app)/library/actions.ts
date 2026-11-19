"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bookcaseSchema, type BookcaseValues } from "@/lib/validation/bookcase";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";
import { bookcaseNameExists, createBookcaseForUser, updateBookcaseForUser } from "@/server/bookcases";
import { requireSession } from "@/server/session";

export type BookcaseFormState = {
  errors?: FieldErrors<BookcaseValues>;
  formError?: string;
};

const DUPLICATE_NAME_ERROR = "You already have a bookcase with this name";

function parseBookcaseForm(formData: FormData) {
  return bookcaseSchema.safeParse({
    name: formData.get("name"),
    wood: formData.get("wood"),
  });
}

export async function createBookcase(_state: BookcaseFormState, formData: FormData): Promise<BookcaseFormState> {
  const { user } = await requireSession();
  const parsed = parseBookcaseForm(formData);

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  if (await bookcaseNameExists(user.id, parsed.data.name)) {
    return { errors: { name: DUPLICATE_NAME_ERROR } };
  }

  await createBookcaseForUser(user.id, parsed.data);

  revalidatePath("/library");
  redirect("/library");
}

export async function updateBookcase(
  bookcaseId: string,
  _state: BookcaseFormState,
  formData: FormData,
): Promise<BookcaseFormState> {
  const { user } = await requireSession();
  const parsed = parseBookcaseForm(formData);

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  if (await bookcaseNameExists(user.id, parsed.data.name, bookcaseId)) {
    return { errors: { name: DUPLICATE_NAME_ERROR } };
  }

  const updated = await updateBookcaseForUser(user.id, bookcaseId, parsed.data);

  if (!updated) {
    return { formError: "This bookcase could not be found." };
  }

  revalidatePath("/library");
  redirect("/library");
}