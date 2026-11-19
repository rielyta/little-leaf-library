export const TRANSLATE_LANGUAGE_CODES = ["id", "ms", "ja", "ko", "zh-CN", "es", "fr", "de"] as const;

export type TranslateLanguage = (typeof TRANSLATE_LANGUAGE_CODES)[number];

export const TRANSLATE_LANGUAGES: Record<TranslateLanguage, string> = {
  id: "Indonesian",
  ms: "Malay",
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Chinese",
  es: "Spanish",
  fr: "French",
  de: "German",
};

export const DEFAULT_TRANSLATE_LANGUAGE: TranslateLanguage = "id";

export const TRANSLATE_TEXT_MAX_LENGTH = 500;
export const SAVED_WORD_MAX_LENGTH = 60;
export const SAVED_WORD_TRANSLATION_MAX_LENGTH = 200;
export const SAVED_WORD_DEFINITION_MAX_LENGTH = 500;
export const PART_OF_SPEECH_MAX_LENGTH = 40;

const SINGLE_WORD_PATTERN = /^[A-Za-z]+(?:['’-][A-Za-z]+)*$/;
const EDGE_PUNCTUATION_PATTERN = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

export type DictionaryMeaning = {
  partOfSpeech: string;
  definition: string;
  example: string | null;
};

export type TranslationResult = {
  text: string;
  language: TranslateLanguage;
  translation: string | null;
  phonetic: string | null;
  meanings: DictionaryMeaning[];
};

export type SavedWord = {
  id: string;
  word: string;
  translation: string;
  language: string;
  partOfSpeech: string | null;
  definition: string | null;
  page: number;
};

export type NewSavedWord = Omit<SavedWord, "id">;

export function isTranslateLanguage(value: string): value is TranslateLanguage {
  return (TRANSLATE_LANGUAGE_CODES as readonly string[]).includes(value);
}

export function normalizeSelection(text: string) {
  return text.replace(/\s+/g, " ").replace(EDGE_PUNCTUATION_PATTERN, "").trim();
}

export function isSingleWord(text: string) {
  return SINGLE_WORD_PATTERN.test(text);
}

export function canSaveWord(text: string) {
  return text.length > 0 && text.length <= SAVED_WORD_MAX_LENGTH;
}