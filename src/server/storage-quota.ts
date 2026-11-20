import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import { describeUsage } from "@/lib/storage-quota";

export const getStorageUsage = cache(async (userId: string) => {
  const { _sum } = await db.book.aggregate({
    where: { userId },
    _sum: { fileSize: true },
  });

  return describeUsage(_sum.fileSize ?? 0);
});

export async function hasRoomFor(userId: string, bytes: number) {
  const usage = await getStorageUsage(userId);
  return bytes <= usage.remaining;
}