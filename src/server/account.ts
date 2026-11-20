import "server-only";
import { deleteStoredFolder, userStoragePrefixes } from "@/server/storage";

export async function deleteUserFiles(userId: string) {
  const results = await Promise.allSettled(userStoragePrefixes(userId).map((prefix) => deleteStoredFolder(prefix)));

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(`[account] Could not remove stored files for user ${userId}`, result.reason);
    }
  }
}