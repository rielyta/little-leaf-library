export const HIGHLIGHT_COLOR_KEYS = ["pink", "blue", "green", "yellow"] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLOR_KEYS)[number];

export const HIGHLIGHT_COLORS: Record<HighlightColor, { label: string; fill: string; swatch: string }> = {
  pink: { label: "Pink", fill: "#F4B9C7", swatch: "#F2B8C6" },
  blue: { label: "Blue", fill: "#B9D8E4", swatch: "#A9CCD8" },
  green: { label: "Green", fill: "#BFDDC4", swatch: "#9CC5A1" },
  yellow: { label: "Yellow", fill: "#FBE3A0", swatch: "#F3E3C3" },
};

export const DEFAULT_COMMENT_COLOR: HighlightColor = "yellow";

export const HIGHLIGHT_TEXT_MAX_LENGTH = 2000;
export const HIGHLIGHT_NOTE_MAX_LENGTH = 1000;
export const HIGHLIGHT_MAX_RECTS = 60;

export type HighlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Highlight = {
  id: string;
  page: number;
  color: HighlightColor;
  text: string;
  rects: HighlightRect[];
  note: string | null;
};

export type NewHighlight = Pick<Highlight, "page" | "color" | "text" | "rects"> & {
  note?: string | null;
};

type LineBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const LINE_GAP_TOLERANCE_PX = 4;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function mergeIntoLines(rects: DOMRect[]) {
  const sorted = rects
    .filter((rect) => rect.width > 1 && rect.height > 1)
    .sort((a, b) => a.top - b.top || a.left - b.left);

  const lines: LineBox[] = [];

  for (const rect of sorted) {
    const line = lines.find(
      (candidate) =>
        Math.abs(candidate.top - rect.top) < rect.height / 2 && rect.left <= candidate.right + LINE_GAP_TOLERANCE_PX,
    );

    if (line) {
      line.left = Math.min(line.left, rect.left);
      line.right = Math.max(line.right, rect.right);
      line.top = Math.min(line.top, rect.top);
      line.bottom = Math.max(line.bottom, rect.bottom);
    } else {
      lines.push({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
    }
  }

  return lines;
}

export function normalizeRects(clientRects: DOMRect[], pageRect: DOMRect): HighlightRect[] {
  return mergeIntoLines(clientRects)
    .slice(0, HIGHLIGHT_MAX_RECTS)
    .map((line) => {
      const x = clamp01((line.left - pageRect.left) / pageRect.width);
      const y = clamp01((line.top - pageRect.top) / pageRect.height);
      const right = clamp01((line.right - pageRect.left) / pageRect.width);
      const bottom = clamp01((line.bottom - pageRect.top) / pageRect.height);

      return { x, y, width: right - x, height: bottom - y };
    })
    .filter((rect) => rect.width > 0 && rect.height > 0);
}

export function rectsContainPoint(rects: HighlightRect[], x: number, y: number) {
  return rects.some((rect) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height);
}

export function lastRect(rects: HighlightRect[]) {
  return rects.reduce((latest, rect) => {
    const isLowerLine = rect.y > latest.y + latest.height / 2;
    const isFurtherOnSameLine = Math.abs(rect.y - latest.y) <= latest.height / 2 && rect.x > latest.x;
    return isLowerLine || isFurtherOnSameLine ? rect : latest;
  });
}

export function groupByPage(highlights: Highlight[]) {
  const byPage = new Map<number, Highlight[]>();

  for (const highlight of highlights) {
    byPage.set(highlight.page, [...(byPage.get(highlight.page) ?? []), highlight]);
  }

  return byPage;
}