import { z } from "zod";
import { bookSchema } from "@/lib/validation/book";

export const uploadIdSchema = z.uuid();

export const uploadRequestSchema = z.object({
  size: z.number().int().positive(),
});

export const finishUploadSchema = bookSchema.extend({
  uploadId: uploadIdSchema,
});