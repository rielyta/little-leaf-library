"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveLastReadPage } from "@/server/books";
import { requireSession } from "@/server/session";

const readingPositionSchema = z.object({
  bookId: z.string().min(1),
  page: z.number().int().min(1),
});

export async function saveReadingPosition(bookId: string, page: number) {
  const parsed = readingPositionSchema.safeParse({ bookId, page });

  if (!parsed.success) {
    return;
  }

  const { user } = await requireSession();
  const saved = await saveLastReadPage(user.id, parsed.data.bookId, parsed.data.page);

  if (saved) {
    revalidatePath("/library");
  }
}