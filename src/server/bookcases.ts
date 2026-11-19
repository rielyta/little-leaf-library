import "server-only";
import type { BookcaseSummary } from "@/lib/bookcases";
import { db } from "@/server/db";

export async function listBookcases(userId: string): Promise<BookcaseSummary[]> {
  const bookcases = await db.bookcase.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: { id: true, name: true, wood: true },
  });

  return bookcases.map((bookcase) => ({ ...bookcase, bookCount: 0 }));
}

export async function bookcaseNameExists(userId: string, name: string) {
  const existing = await db.bookcase.findFirst({
    where: { userId, name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function createBookcaseForUser(userId: string, data: { name: string; wood: BookcaseSummary["wood"] }) {
  const { _max } = await db.bookcase.aggregate({
    where: { userId },
    _max: { position: true },
  });

  return db.bookcase.create({
    data: { ...data, userId, position: (_max.position ?? -1) + 1 },
    select: { id: true },
  });
}