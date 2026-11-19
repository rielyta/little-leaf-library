import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

function resolveKey(key: string) {
  const fullPath = path.resolve(STORAGE_ROOT, key);

  if (!fullPath.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error("Invalid storage key");
  }

  return fullPath;
}

export function bookFileKey(userId: string, bookId: string) {
  return `books/${userId}/${bookId}.pdf`;
}

export async function saveStoredFile(key: string, bytes: Uint8Array) {
  const fullPath = resolveKey(key);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, bytes);
}

export async function readStoredFile(key: string) {
  return new Uint8Array(await readFile(resolveKey(key)));
}

export async function deleteStoredFile(key: string) {
  await unlink(resolveKey(key)).catch(() => undefined);
}