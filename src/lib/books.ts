export const SPINE_COLOR_VALUES = [
  "#F2B8C6",
  "#A9CCD8",
  "#BFD8C2",
  "#F3E3C3",
  "#E9C6D9",
  "#CFE3EA",
  "#9CC5A1",
  "#FFF0C9",
] as const;

export type SpineColor = (typeof SPINE_COLOR_VALUES)[number];

export const SPINE_COLOR_NAMES: Record<SpineColor, string> = {
  "#F2B8C6": "Rose pink",
  "#A9CCD8": "Sky blue",
  "#BFD8C2": "Sage green",
  "#F3E3C3": "Vanilla cream",
  "#E9C6D9": "Lilac",
  "#CFE3EA": "Ice blue",
  "#9CC5A1": "Leaf green",
  "#FFF0C9": "Butter yellow",
};

export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const MAX_PDF_LABEL = "50 MB";

export const BOOK_TITLE_MAX_LENGTH = 120;
export const BOOK_AUTHOR_MAX_LENGTH = 80;

const SHELF_INNER_WIDTH = 250;
const SPINE_GAP = 3;
const MIN_SPINE_WIDTH = 18;
const MAX_SPINE_WIDTH = 44;
const PAGES_PER_PIXEL = 9;

export type BookOnShelf = {
  id: string;
  title: string;
  author: string | null;
  pageCount: number;
  spineColor: string;
  lastReadPage: number;
};

export function spineWidth(pageCount: number) {
  return Math.max(MIN_SPINE_WIDTH, Math.min(MAX_SPINE_WIDTH, Math.round(pageCount / PAGES_PER_PIXEL)));
}

export function spineHeight(id: string) {
  let hash = 0;

  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return 84 + (hash % 22);
}

export function arrangeOnShelves(books: BookOnShelf[], minShelves: number) {
  const shelves: BookOnShelf[][] = [[]];
  let usedWidth = 0;

  for (const book of books) {
    const width = spineWidth(book.pageCount);
    const current = shelves[shelves.length - 1];
    const needed = current.length === 0 ? width : usedWidth + SPINE_GAP + width;

    if (needed > SHELF_INNER_WIDTH && current.length > 0) {
      shelves.push([book]);
      usedWidth = width;
    } else {
      current.push(book);
      usedWidth = needed;
    }
  }

  while (shelves.length < minShelves) {
    shelves.push([]);
  }

  return shelves;
}

export function readingProgress({ lastReadPage, pageCount }: Pick<BookOnShelf, "lastReadPage" | "pageCount">) {
  if (lastReadPage <= 0) {
    return { percent: 0, label: "Not started" };
  }

  if (lastReadPage >= pageCount) {
    return { percent: 100, label: "Finished" };
  }

  return {
    percent: Math.round((lastReadPage / pageCount) * 100),
    label: `Page ${lastReadPage} of ${pageCount}`,
  };
}

export function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasPdfSignature(bytes: Uint8Array) {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d];
  return signature.every((byte, index) => bytes[index] === byte);
}