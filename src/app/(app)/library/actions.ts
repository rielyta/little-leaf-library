"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bookcaseSchema, type BookcaseValues } from "@/lib/validation/bookcase";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";
import {
  deleteBookcaseSchema,
  libraryNameSchema,
  type DeleteBookcaseValues,
  type LibraryNameValues,
} from "@/lib/validation/library";
import { bookcaseNameExists, createBookcaseForUser, updateBookcaseForUser } from "@/server/bookcases";
import { deleteBookcaseForUser, deleteBookForUser, saveLibraryName } from "@/server/library";
import { requireSession } from "@/server/session";

export type BookcaseFormState = {
  errors?: FieldErrors<BookcaseValues>;
  formError?: string;
};

export type DeleteBookcaseState = {
  errors?: FieldErrors<DeleteBookcaseValues>;
  formError?: string;
};

export type LibraryNameState = {
  errors?: FieldErrors<LibraryNameValues>;
};

export type ChangeResult = { ok: true } | { ok: false; error: string };

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

export async function deleteBookcase(
  bookcaseId: string,
  _state: DeleteBookcaseState,
  formData: FormData,
): Promise<DeleteBookcaseState> {
  const { user } = await requireSession();
  const parsed = deleteBookcaseSchema.safeParse({
    books: formData.get("books"),
    targetId: formData.get("targetId") ?? undefined,
  });

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  const moveToId = parsed.data.books === "move" ? (parsed.data.targetId ?? null) : null;
  const deleted = await deleteBookcaseForUser(user.id, bookcaseId, moveToId);

  if (!deleted) {
    return { formError: "This bookcase could not be deleted. Please try again." };
  }

  revalidatePath("/library");
  redirect("/library");
}

export async function deleteBook(bookId: string): Promise<ChangeResult> {
  const parsedId = z.string().min(1).safeParse(bookId);

  if (!parsedId.success) {
    return { ok: false, error: "That book could not be deleted." };
  }

  const { user } = await requireSession();
  const deleted = await deleteBookForUser(user.id, parsedId.data);

  if (!deleted) {
    return { ok: false, error: "That book could not be deleted." };
  }

  revalidatePath("/library");

  return { ok: true };
}

export async function updateLibraryName(_state: LibraryNameState, formData: FormData): Promise<LibraryNameState> {
  const { user } = await requireSession();
  const parsed = libraryNameSchema.safeParse({ libraryName: formData.get("libraryName") ?? "" });

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  await saveLibraryName(user.id, parsed.data.libraryName || null);

  revalidatePath("/library");
  redirect("/library");
}