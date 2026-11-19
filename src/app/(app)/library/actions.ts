"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bookcaseSchema, type BookcaseValues } from "@/lib/validation/bookcase";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";
import { bookcaseNameExists, createBookcaseForUser } from "@/server/bookcases";
import { requireSession } from "@/server/session";

export type CreateBookcaseState = {
  errors?: FieldErrors<BookcaseValues>;
};

export async function createBookcase(_state: CreateBookcaseState, formData: FormData): Promise<CreateBookcaseState> {
  const { user } = await requireSession();

  const parsed = bookcaseSchema.safeParse({
    name: formData.get("name"),
    wood: formData.get("wood"),
  });

  if (!parsed.success) {
    return { errors: toFieldErrors(parsed.error) };
  }

  if (await bookcaseNameExists(user.id, parsed.data.name)) {
    return { errors: { name: "You already have a bookcase with this name" } };
  }

  await createBookcaseForUser(user.id, parsed.data);

  revalidatePath("/library");
  redirect("/library");
}