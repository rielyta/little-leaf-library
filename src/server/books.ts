import "server-only";
import { cache } from "react";
import { db } from "@/server/db";

type NewBook = {
  id: string;
  userId: string;
  bookcaseId: string;
  title: string;
  author: string | null;
  pageCount: number;
  fileSize: number;
  fileKey: string;
  spineColor: string;
};

export async function createBookForUser(book: NewBook) {
  const { _max } = await db.book.aggregate({
    where: { bookcaseId: book.bookcaseId },
    _max: { position: true },
  });

  return db.book.create({
    data: { ...book, position: (_max.position ?? -1) + 1 },
    select: { id: true },
  });
}

export async function findOwnedBook(userId: string, bookId: string) {
  return db.book.findFirst({
    where: { id: bookId, userId },
    select: { id: true, title: true, fileKey: true },
  });
}

export const getReadableBook = cache(async (userId: string, bookId: string) => {
  return db.book.findFirst({
    where: { id: bookId, userId },
    select: {
      id: true,
      title: true,
      author: true,
      pageCount: true,
      lastReadPage: true,
      bookcase: { select: { name: true } },
    },
  });
});

export async function saveLastReadPage(userId: string, bookId: string, page: number) {
  const { count } = await db.book.updateMany({
    where: { id: bookId, userId, pageCount: { gte: page } },
    data: { lastReadPage: page },
  });

  return count > 0;
}