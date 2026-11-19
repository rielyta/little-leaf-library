import { z } from "zod";
import { BOOKCASE_NAME_MAX_LENGTH, WOOD_KEYS } from "@/lib/bookcases";

export const bookcaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your bookcase a name")
    .max(BOOKCASE_NAME_MAX_LENGTH, `At most ${BOOKCASE_NAME_MAX_LENGTH} characters`),
  wood: z.enum(WOOD_KEYS, "Pick a wood color"),
});

export type BookcaseValues = z.infer<typeof bookcaseSchema>;