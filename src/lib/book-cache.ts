const CACHE_NAME = "little-leaf-books-v1";
const INDEX_KEY = "little-leaf-book-cache";
const CACHE_PATH = "/book-cache/";
const MAX_CACHED_BOOKS = 12;

type LoadOptions = {
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
};

function cacheRequest(bookId: string) {
  return new Request(`${CACHE_PATH}${encodeURIComponent(bookId)}`);
}

function bookIdFromRequest(request: Request) {
  const { pathname } = new URL(request.url);
  return pathname.startsWith(CACHE_PATH) ? decodeURIComponent(pathname.slice(CACHE_PATH.length)) : null;
}

async function openCache() {
  if (typeof caches === "undefined") {
    return null;
  }

  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

function readIndex(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
  } catch {
    return;
  }
}

function markRecentlyOpened(bookId: string) {
  writeIndex([bookId, ...readIndex().filter((id) => id !== bookId)]);
}

async function trimCache(cache: Cache) {
  const ids = readIndex();
  const extra = ids.slice(MAX_CACHED_BOOKS);

  if (extra.length === 0) {
    return;
  }

  writeIndex(ids.slice(0, MAX_CACHED_BOOKS));
  await Promise.all(extra.map((id) => cache.delete(cacheRequest(id))));
}

async function downloadBook(fileUrl: string, { signal, onProgress }: LoadOptions) {
  const response = await fetch(fileUrl, { signal, credentials: "same-origin" });

  if (!response.ok) {
    throw new Error(`Could not download the book (${response.status})`);
  }

  const total = Number(response.headers.get("content-length")) || 0;

  if (!response.body || total === 0) {
    return response.blob();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    loaded += value.byteLength;
    onProgress?.(Math.min(loaded / total, 1));
  }

  return new Blob(chunks, { type: "application/pdf" });
}

export async function loadBookFile(bookId: string, fileUrl: string, options: LoadOptions = {}) {
  const cache = await openCache();
  const request = cacheRequest(bookId);

  if (cache) {
    const cached = await cache.match(request).catch(() => undefined);

    if (cached) {
      markRecentlyOpened(bookId);
      return cached.blob();
    }
  }

  const blob = await downloadBook(fileUrl, options);

  if (cache) {
    try {
      await cache.put(request, new Response(blob, { headers: { "Content-Type": "application/pdf" } }));
      markRecentlyOpened(bookId);
      await trimCache(cache);
    } catch {
      writeIndex(readIndex().filter((id) => id !== bookId));
    }
  }

  return blob;
}

export async function keepOnlyCachedBooks(bookIds: string[]) {
  const cache = await openCache();

  if (!cache) {
    return;
  }

  const keep = new Set(bookIds);
  const requests = await cache.keys().catch(() => [] as readonly Request[]);
  const stale = requests.filter((request) => {
    const id = bookIdFromRequest(request);
    return id === null || !keep.has(id);
  });

  await Promise.all(stale.map((request) => cache.delete(request)));
  writeIndex(readIndex().filter((id) => keep.has(id)));
}

export async function clearBookCache() {
  if (typeof caches !== "undefined") {
    await caches.delete(CACHE_NAME).catch(() => false);
  }

  writeIndex([]);
}