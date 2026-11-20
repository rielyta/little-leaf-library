export const STORAGE_QUOTA_BYTES = 50 * 1024 * 1024;
export const MAX_BOOK_FILE_BYTES = 20 * 1024 * 1024;

export type StorageUsage = {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
};

export function describeUsage(used: number, limit = STORAGE_QUOTA_BYTES): StorageUsage {
  const safeUsed = Math.max(0, used);

  return {
    used: safeUsed,
    limit,
    remaining: Math.max(0, limit - safeUsed),
    percent: Math.min(100, Math.round((safeUsed / limit) * 100)),
  };
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