import "server-only";
import { db } from "@/server/db";

export async function listBookmarkPages(userId: string, bookId: string) {
  const bookmarks = await db.bookmark.findMany({
    where: { userId, bookId },
    orderBy: { page: "asc" },
    select: { page: true },
  });

  return bookmarks.map((bookmark) => bookmark.page);
}

export async function toggleBookmarkForUser(userId: string, bookId: string, page: number) {
  const book = await db.book.findFirst({
    where: { id: bookId, userId, pageCount: { gte: page } },
    select: { id: true },
  });

  if (!book) {
    return null;
  }

  const { count } = await db.bookmark.deleteMany({
    where: { bookId, userId, page },
  });

  if (count === 0) {
    await db.bookmark.create({
      data: { bookId, userId, page },
    });
  }

  return listBookmarkPages(userId, bookId);
}