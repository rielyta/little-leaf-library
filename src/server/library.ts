import "server-only";
import { db } from "@/server/db";
import { deleteStoredFile } from "@/server/storage";

export async function getLibraryName(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { libraryName: true },
  });

  return user?.libraryName ?? null;
}

export async function saveLibraryName(userId: string, libraryName: string | null) {
  await db.user.update({
    where: { id: userId },
    data: { libraryName },
  });
}

export async function deleteBookForUser(userId: string, bookId: string) {
  const book = await db.book.findFirst({
    where: { id: bookId, userId },
    select: { id: true, fileKey: true },
  });

  if (!book) {
    return false;
  }

  await db.book.delete({ where: { id: book.id } });
  await deleteStoredFile(book.fileKey);

  return true;
}

export async function deleteBookcaseForUser(userId: string, bookcaseId: string, moveToId: string | null) {
  const fileKeys = await db.$transaction(async (tx) => {
    const bookcase = await tx.bookcase.findFirst({
      where: { id: bookcaseId, userId },
      select: { id: true },
    });

    if (!bookcase) {
      return null;
    }

    const books = await tx.book.findMany({
      where: { bookcaseId: bookcase.id },
      orderBy: { position: "asc" },
      select: { id: true, fileKey: true },
    });

    if (moveToId && books.length > 0) {
      const target = await tx.bookcase.findFirst({
        where: { id: moveToId, userId, NOT: { id: bookcase.id } },
        select: { id: true },
      });

      if (!target) {
        return null;
      }

      const { _max } = await tx.book.aggregate({
        where: { bookcaseId: target.id },
        _max: { position: true },
      });

      let position = (_max.position ?? -1) + 1;

      for (const book of books) {
        await tx.book.update({
          where: { id: book.id },
          data: { bookcaseId: target.id, position },
        });
        position += 1;
      }

      await tx.bookcase.delete({ where: { id: bookcase.id } });
      return [];
    }

    await tx.bookcase.delete({ where: { id: bookcase.id } });
    return books.map((book) => book.fileKey);
  });

  if (fileKeys === null) {
    return false;
  }

  await Promise.all(fileKeys.map((key) => deleteStoredFile(key)));

  return true;
}