export const STORAGE_QUOTA_BYTES = 50 * 1024 * 1024;
export const MAX_BOOK_FILE_BYTES = 20 * 1024 * 1024;

export type StorageUsage = {
  used: number;
  limit: number | null;
  remaining: number | null;
  percent: number;
};

export function describeUsage(used: number, limit: number | null = STORAGE_QUOTA_BYTES): StorageUsage {
  const safeUsed = Math.max(0, used);

  if (limit === null) {
    return { used: safeUsed, limit: null, remaining: null, percent: 0 };
  }

  return {
    used: safeUsed,
    limit,
    remaining: Math.max(0, limit - safeUsed),
    percent: Math.min(100, Math.round((safeUsed / limit) * 100)),
  };
}

export function hasRoomFor(usage: StorageUsage, size: number) {
  return usage.remaining === null || size <= usage.remaining;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} MB`;
}

export function fileTooLargeMessage(size: number) {
  return `This PDF is ${formatBytes(size)}. Each book can be up to ${formatBytes(MAX_BOOK_FILE_BYTES)}.`;
}

export function quotaExceededMessage(size: number, usage: StorageUsage) {
  return `This PDF is ${formatBytes(size)}, but your library only has ${formatBytes(usage.remaining ?? 0)} of space left. Remove a book to make room.`;
}