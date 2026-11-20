import "server-only";
import { db } from "@/server/db";

export async function saveReadingProgress(userId: string, bookId: string, page: number) {
  const { count } = await db.book.updateMany({
    where: { id: bookId, userId, pageCount: { gte: page } },
    data: { lastReadPage: page },
  });

  return count > 0;
}