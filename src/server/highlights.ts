import "server-only";
import type { Highlight, HighlightColor, NewHighlight } from "@/lib/highlights";
import { highlightRectsSchema } from "@/lib/validation/highlight";
import { db } from "@/server/db";

const highlightSelect = {
  id: true,
  page: true,
  color: true,
  text: true,
  rects: true,
  note: true,
} as const;

type HighlightRow = {
  id: string;
  page: number;
  color: HighlightColor;
  text: string;
  rects: unknown;
  note: string | null;
};

function toHighlight(row: HighlightRow): Highlight {
  const rects = highlightRectsSchema.safeParse(row.rects);
  return { ...row, rects: rects.success ? rects.data : [] };
}

export async function listHighlights(userId: string, bookId: string) {
  const rows = await db.highlight.findMany({
    where: { userId, bookId },
    orderBy: [{ page: "asc" }, { createdAt: "asc" }],
    select: highlightSelect,
  });

  return rows.map(toHighlight);
}

export async function createHighlightForUser(userId: string, bookId: string, data: NewHighlight) {
  const book = await db.book.findFirst({
    where: { id: bookId, userId, pageCount: { gte: data.page } },
    select: { id: true },
  });

  if (!book) {
    return null;
  }

  const row = await db.highlight.create({
    data: { ...data, note: data.note || null, bookId, userId },
    select: highlightSelect,
  });

  return toHighlight(row);
}

export async function recolorHighlightForUser(userId: string, highlightId: string, color: HighlightColor) {
  const { count } = await db.highlight.updateMany({
    where: { id: highlightId, userId },
    data: { color },
  });

  return count > 0;
}

export async function updateHighlightNoteForUser(userId: string, highlightId: string, note: string | null) {
  const { count } = await db.highlight.updateMany({
    where: { id: highlightId, userId },
    data: { note },
  });

  return count > 0;
}

export async function deleteHighlightForUser(userId: string, highlightId: string) {
  const { count } = await db.highlight.deleteMany({
    where: { id: highlightId, userId },
  });

  return count > 0;
}