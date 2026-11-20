import "server-only";
import type { BookcaseSummary, WoodKey } from "@/lib/bookcases";
import { db } from "@/server/db";

type BookcaseData = {
  name: string;
  wood: WoodKey;
  shelves: number;
};

export async function listBookcases(userId: string): Promise<BookcaseSummary[]> {
  return db.bookcase.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      wood: true,
      shelves: true,
      books: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          author: true,
          pageCount: true,
          spineColor: true,
          lastReadPage: true,
        },
      },
    },
  });
}

export async function findOwnedBookcase(userId: string, bookcaseId: string) {
  return db.bookcase.findFirst({
    where: { id: bookcaseId, userId },
    select: { id: true },
  });
}

export async function bookcaseNameExists(userId: string, name: string, excludeId?: string) {
  const existing = await db.bookcase.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function createBookcaseForUser(userId: string, data: BookcaseData) {
  const { _max } = await db.bookcase.aggregate({
    where: { userId },
    _max: { position: true },
  });

  return db.bookcase.create({
    data: { ...data, userId, position: (_max.position ?? -1) + 1 },
    select: { id: true },
  });
}

export async function updateBookcaseForUser(userId: string, bookcaseId: string, data: BookcaseData) {
  const { count } = await db.bookcase.updateMany({
    where: { id: bookcaseId, userId },
    data,
  });

  return count > 0;
}