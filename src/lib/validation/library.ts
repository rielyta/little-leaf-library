import { z } from "zod";
import { LIBRARY_NAME_MAX_LENGTH } from "@/lib/library";

export const libraryNameSchema = z.object({
  libraryName: z.string().trim().max(LIBRARY_NAME_MAX_LENGTH, `At most ${LIBRARY_NAME_MAX_LENGTH} characters`),
});

export const deleteBookcaseSchema = z
  .object({
    books: z.enum(["move", "delete"], "Choose what happens to the books"),
    targetId: z.string().min(1).optional(),
  })
  .refine((data) => data.books === "delete" || Boolean(data.targetId), {
    message: "Pick a bookcase for these books",
    path: ["targetId"],
  });

export type LibraryNameValues = z.infer<typeof libraryNameSchema>;
export type DeleteBookcaseValues = z.infer<typeof deleteBookcaseSchema>;