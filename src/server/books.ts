import "server-only";
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