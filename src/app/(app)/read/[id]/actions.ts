"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Highlight, HighlightColor, NewHighlight } from "@/lib/highlights";
import type { NewSavedWord, SavedWord } from "@/lib/translate";
import { highlightColorSchema, highlightNoteSchema, newHighlightSchema } from "@/lib/validation/highlight";
import { newSavedWordSchema } from "@/lib/validation/translate";
import { toggleBookmarkForUser } from "@/server/bookmarks";
import { saveLastReadPage } from "@/server/books";
import {
  createHighlightForUser,
  deleteHighlightForUser,
  recolorHighlightForUser,
  updateHighlightNoteForUser,
} from "@/server/highlights";
import { deleteSavedWordForUser, saveWordForUser } from "@/server/saved-words";
import { requireSession } from "@/server/session";

const pageInBookSchema = z.object({
  bookId: z.string().min(1),
  page: z.number().int().min(1),
});

const idSchema = z.string().min(1);

export type ChangeResult = { ok: true } | { ok: false; error: string };
export type HighlightChangeResult = ChangeResult;
export type BookmarkResult = { ok: true; bookmarks: number[] } | { ok: false; error: string };
export type CreateHighlightResult = { ok: true; highlight: Highlight } | { ok: false; error: string };
export type SaveWordResult = { ok: true; word: SavedWord } | { ok: false; error: string };

export async function saveReadingPosition(bookId: string, page: number) {
  const parsed = pageInBookSchema.safeParse({ bookId, page });

  if (!parsed.success) {
    return;
  }

  const { user } = await requireSession();
  const saved = await saveLastReadPage(user.id, parsed.data.bookId, parsed.data.page);

  if (saved) {
    revalidatePath("/library");
  }
}

export async function toggleBookmark(bookId: string, page: number): Promise<BookmarkResult> {
  const parsed = pageInBookSchema.safeParse({ bookId, page });

  if (!parsed.success) {
    return { ok: false, error: "That page could not be bookmarked." };
  }

  const { user } = await requireSession();
  const bookmarks = await toggleBookmarkForUser(user.id, parsed.data.bookId, parsed.data.page);

  if (!bookmarks) {
    return { ok: false, error: "That page could not be bookmarked." };
  }

  return { ok: true, bookmarks };
}

export async function createHighlight(bookId: string, input: NewHighlight): Promise<CreateHighlightResult> {
  const parsedBookId = idSchema.safeParse(bookId);
  const parsed = newHighlightSchema.safeParse(input);

  if (!parsedBookId.success || !parsed.success) {
    return { ok: false, error: "That highlight could not be saved." };
  }

  const { user } = await requireSession();
  const highlight = await createHighlightForUser(user.id, parsedBookId.data, parsed.data);

  if (!highlight) {
    return { ok: false, error: "That highlight could not be saved." };
  }

  return { ok: true, highlight };
}

export async function recolorHighlight(highlightId: string, color: HighlightColor): Promise<HighlightChangeResult> {
  const parsedId = idSchema.safeParse(highlightId);
  const parsedColor = highlightColorSchema.safeParse(color);

  if (!parsedId.success || !parsedColor.success) {
    return { ok: false, error: "That highlight could not be changed." };
  }

  const { user } = await requireSession();
  const updated = await recolorHighlightForUser(user.id, parsedId.data, parsedColor.data);

  return updated ? { ok: true } : { ok: false, error: "That highlight could not be changed." };
}

export async function saveHighlightNote(highlightId: string, note: string): Promise<HighlightChangeResult> {
  const parsedId = idSchema.safeParse(highlightId);
  const parsedNote = highlightNoteSchema.safeParse(note);

  if (!parsedId.success || !parsedNote.success) {
    return { ok: false, error: "That comment could not be saved." };
  }

  const { user } = await requireSession();
  const updated = await updateHighlightNoteForUser(user.id, parsedId.data, parsedNote.data || null);

  return updated ? { ok: true } : { ok: false, error: "That comment could not be saved." };
}

export async function removeHighlight(highlightId: string): Promise<HighlightChangeResult> {
  const parsedId = idSchema.safeParse(highlightId);

  if (!parsedId.success) {
    return { ok: false, error: "That highlight could not be removed." };
  }

  const { user } = await requireSession();
  const removed = await deleteHighlightForUser(user.id, parsedId.data);

  return removed ? { ok: true } : { ok: false, error: "That highlight could not be removed." };
}

export async function saveWord(bookId: string, input: NewSavedWord): Promise<SaveWordResult> {
  const parsedBookId = idSchema.safeParse(bookId);
  const parsed = newSavedWordSchema.safeParse(input);

  if (!parsedBookId.success || !parsed.success) {
    return { ok: false, error: "That word could not be saved." };
  }

  const { user } = await requireSession();
  const word = await saveWordForUser(user.id, parsedBookId.data, parsed.data);

  if (!word) {
    return { ok: false, error: "That word could not be saved." };
  }

  return { ok: true, word };
}

export async function removeSavedWord(savedWordId: string): Promise<ChangeResult> {
  const parsedId = idSchema.safeParse(savedWordId);

  if (!parsedId.success) {
    return { ok: false, error: "That word could not be removed." };
  }

  const { user } = await requireSession();
  const removed = await deleteSavedWordForUser(user.id, parsedId.data);

  return removed ? { ok: true } : { ok: false, error: "That word could not be removed." };
}