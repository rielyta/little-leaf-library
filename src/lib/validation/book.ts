import { z } from "zod";
import { BOOK_AUTHOR_MAX_LENGTH, BOOK_TITLE_MAX_LENGTH, SPINE_COLOR_VALUES } from "@/lib/books";

export const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your book a title")
    .max(BOOK_TITLE_MAX_LENGTH, `At most ${BOOK_TITLE_MAX_LENGTH} characters`),
  author: z.string().trim().max(BOOK_AUTHOR_MAX_LENGTH, `At most ${BOOK_AUTHOR_MAX_LENGTH} characters`),
  bookcaseId: z.string().min(1, "Pick a bookcase"),
  spineColor: z.enum(SPINE_COLOR_VALUES, "Pick a spine color"),
});

export type BookValues = z.infer<typeof bookSchema>;