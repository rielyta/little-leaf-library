import { z } from "zod";
import {
  PART_OF_SPEECH_MAX_LENGTH,
  SAVED_WORD_DEFINITION_MAX_LENGTH,
  SAVED_WORD_MAX_LENGTH,
  SAVED_WORD_TRANSLATION_MAX_LENGTH,
  TRANSLATE_LANGUAGE_CODES,
  TRANSLATE_TEXT_MAX_LENGTH,
} from "@/lib/translate";

export const translateLanguageSchema = z.enum(TRANSLATE_LANGUAGE_CODES);

export const translateQuerySchema = z.object({
  text: z.string().trim().min(1).max(TRANSLATE_TEXT_MAX_LENGTH),
  to: translateLanguageSchema,
});

export const newSavedWordSchema = z.object({
  word: z.string().trim().min(1).max(SAVED_WORD_MAX_LENGTH),
  translation: z.string().trim().min(1).max(SAVED_WORD_TRANSLATION_MAX_LENGTH),
  language: translateLanguageSchema,
  partOfSpeech: z.string().trim().max(PART_OF_SPEECH_MAX_LENGTH).nullable(),
  definition: z.string().trim().max(SAVED_WORD_DEFINITION_MAX_LENGTH).nullable(),
  page: z.number().int().min(1),
});