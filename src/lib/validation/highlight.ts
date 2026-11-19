import { z } from "zod";
import {
  HIGHLIGHT_COLOR_KEYS,
  HIGHLIGHT_MAX_RECTS,
  HIGHLIGHT_NOTE_MAX_LENGTH,
  HIGHLIGHT_TEXT_MAX_LENGTH,
} from "@/lib/highlights";

const unitInterval = z.number().min(0).max(1);

export const highlightRectsSchema = z
  .array(
    z.object({
      x: unitInterval,
      y: unitInterval,
      width: unitInterval,
      height: unitInterval,
    }),
  )
  .min(1)
  .max(HIGHLIGHT_MAX_RECTS);

export const highlightColorSchema = z.enum(HIGHLIGHT_COLOR_KEYS);

export const highlightNoteSchema = z
  .string()
  .trim()
  .max(HIGHLIGHT_NOTE_MAX_LENGTH, `At most ${HIGHLIGHT_NOTE_MAX_LENGTH} characters`);

export const newHighlightSchema = z.object({
  page: z.number().int().min(1),
  color: highlightColorSchema,
  text: z.string().trim().min(1).max(HIGHLIGHT_TEXT_MAX_LENGTH),
  rects: highlightRectsSchema,
  note: highlightNoteSchema.nullish(),
});