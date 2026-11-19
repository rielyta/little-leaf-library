import "server-only";
import { z } from "zod";
import { isSingleWord, type DictionaryMeaning, type TranslateLanguage, type TranslationResult } from "@/lib/translate";

const DICTIONARY_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const TRANSLATION_ENDPOINT = "https://api.mymemory.translated.net/get";
const SOURCE_LANGUAGE = "en";
const CACHE_SECONDS = 60 * 60 * 24 * 7;
const REQUEST_TIMEOUT_MS = 6000;
const MAX_MEANINGS = 3;
const QUOTA_WARNING = "MYMEMORY WARNING";

const dictionarySchema = z
  .array(
    z.object({
      phonetic: z.string().optional(),
      phonetics: z.array(z.object({ text: z.string().optional() })).default([]),
      meanings: z
        .array(
          z.object({
            partOfSpeech: z.string(),
            definitions: z.array(z.object({ definition: z.string(), example: z.string().optional() })).min(1),
          }),
        )
        .default([]),
    }),
  )
  .min(1);

const translationSchema = z.object({
  responseStatus: z.coerce.number(),
  responseData: z.object({ translatedText: z.string() }),
});

const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&(amp|quot|apos|lt|gt);/g, (entity) => NAMED_ENTITIES[entity] ?? entity);
}

function matchCase(source: string, translated: string) {
  const sourceIsLowercase = source === source.toLowerCase();
  const startsUppercase = translated[0] !== translated[0].toLowerCase();
  const isAllCaps = translated === translated.toUpperCase();

  return sourceIsLowercase && startsUppercase && !isAllCaps ? translated[0].toLowerCase() + translated.slice(1) : translated;
}

async function fetchJson(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function translateText(text: string, language: TranslateLanguage) {
  const params = new URLSearchParams({ q: text, langpair: `${SOURCE_LANGUAGE}|${language}` });
  const contactEmail = process.env.MYMEMORY_EMAIL;

  if (contactEmail) {
    params.set("de", contactEmail);
  }

  const parsed = translationSchema.safeParse(await fetchJson(`${TRANSLATION_ENDPOINT}?${params}`));

  if (!parsed.success || parsed.data.responseStatus !== 200) {
    return null;
  }

  const translated = decodeEntities(parsed.data.responseData.translatedText).trim();

  if (!translated || translated.toUpperCase().includes(QUOTA_WARNING)) {
    return null;
  }

  return matchCase(text, translated);
}

async function lookupDefinition(word: string) {
  const parsed = dictionarySchema.safeParse(await fetchJson(`${DICTIONARY_ENDPOINT}${encodeURIComponent(word.toLowerCase())}`));

  if (!parsed.success) {
    return null;
  }

  const entries = parsed.data;
  const phonetic =
    entries.map((entry) => entry.phonetic ?? entry.phonetics.find((item) => item.text)?.text).find(Boolean) ?? null;

  const meanings: DictionaryMeaning[] = [];
  const seenParts = new Set<string>();

  for (const entry of entries) {
    for (const meaning of entry.meanings) {
      if (meanings.length >= MAX_MEANINGS || seenParts.has(meaning.partOfSpeech)) {
        continue;
      }

      const [first] = meaning.definitions;
      seenParts.add(meaning.partOfSpeech);
      meanings.push({ partOfSpeech: meaning.partOfSpeech, definition: first.definition, example: first.example ?? null });
    }
  }

  return meanings.length > 0 ? { phonetic, meanings } : null;
}

export async function translateSelection(text: string, language: TranslateLanguage): Promise<TranslationResult | null> {
  const [translation, dictionary] = await Promise.all([
    translateText(text, language),
    isSingleWord(text) ? lookupDefinition(text) : Promise.resolve(null),
  ]);

  if (!translation && !dictionary) {
    return null;
  }

  return {
    text,
    language,
    translation,
    phonetic: dictionary?.phonetic ?? null,
    meanings: dictionary?.meanings ?? [],
  };
}