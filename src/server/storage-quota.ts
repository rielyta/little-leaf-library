import "server-only";
import { cache } from "react";
import { describeUsage, STORAGE_QUOTA_BYTES } from "@/lib/storage-quota";
import { db } from "@/server/db";

function unlimitedEmails() {
  return new Set(
    (process.env.UNLIMITED_STORAGE_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const getStorageUsage = cache(async (userId: string) => {
  const [user, { _sum }] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    }),
    db.book.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    }),
  ]);

  const isUnlimited = Boolean(user?.emailVerified && unlimitedEmails().has(user.email.toLowerCase()));

  return describeUsage(_sum.fileSize ?? 0, isUnlimited ? null : STORAGE_QUOTA_BYTES);
});