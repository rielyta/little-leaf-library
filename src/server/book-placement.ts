import "server-only";
import { db } from "@/server/db";

export async function getMoveOptions(userId: string, bookId: string) {
  const book = await db.book.findFirst({
    where: { id: bookId, userId },
    select: { bookcaseId: true },
  });

  if (!book) {
    return null;
  }

  const bookcases = await db.bookcase.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: { id: true, name: true, _count: { select: { books: true } } },
  });

  return {
    currentBookcaseId: book.bookcaseId,
    bookcases: bookcases.map(({ _count, ...bookcase }) => ({ ...bookcase, bookCount: _count.books })),
  };
}

export async function moveBookForUser(userId: string, bookId: string, bookcaseId: string) {
  return db.$transaction(async (tx) => {
    const book = await tx.book.findFirst({
      where: { id: bookId, userId },
      select: { bookcaseId: true },
    });

    const bookcase = await tx.bookcase.findFirst({
      where: { id: bookcaseId, userId },
      select: { id: true, name: true },
    });

    if (!book || !bookcase) {
      return null;
    }

    if (book.bookcaseId === bookcase.id) {
      return bookcase;
    }

    const { _max } = await tx.book.aggregate({
      where: { bookcaseId: bookcase.id },
      _max: { position: true },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { bookcaseId: bookcase.id, position: (_max.position ?? -1) + 1 },
    });

    return bookcase;
  });
}