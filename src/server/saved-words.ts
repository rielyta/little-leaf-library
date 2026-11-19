import "server-only";
import type { NewSavedWord, SavedWord } from "@/lib/translate";
import { db } from "@/server/db";

const savedWordSelect = {
  id: true,
  word: true,
  translation: true,
  language: true,
  partOfSpeech: true,
  definition: true,
  page: true,
} as const;

export async function listSavedWords(userId: string, bookId: string): Promise<SavedWord[]> {
  return db.savedWord.findMany({
    where: { userId, bookId },
    orderBy: [{ page: "asc" }, { createdAt: "asc" }],
    select: savedWordSelect,
  });
}

export async function saveWordForUser(userId: string, bookId: string, data: NewSavedWord): Promise<SavedWord | null> {
  const book = await db.book.findFirst({
    where: { id: bookId, userId, pageCount: { gte: data.page } },
    select: { id: true },
  });

  if (!book) {
    return null;
  }

  const word = data.word.toLowerCase();
  const fields = {
    translation: data.translation,
    language: data.language,
    partOfSpeech: data.partOfSpeech,
    definition: data.definition,
    page: data.page,
  };

  return db.savedWord.upsert({
    where: { bookId_word: { bookId, word } },
    create: { ...fields, word, bookId, userId },
    update: fields,
    select: savedWordSelect,
  });
}

export async function deleteSavedWordForUser(userId: string, savedWordId: string) {
  const { count } = await db.savedWord.deleteMany({
    where: { id: savedWordId, userId },
  });

  return count > 0;
}