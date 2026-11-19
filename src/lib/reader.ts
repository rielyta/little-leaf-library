export type ReaderMode = "single" | "double";

export type TurnDirection = "next" | "prev";

export type Turn = {
  direction: TurnDirection;
  progress: number;
  settling: boolean;
};

export type Spread = {
  left: number | null;
  right: number | null;
};

export type Leaf = {
  side: "left" | "right" | "single";
  front: number | null;
  back: number | null;
  angle: number;
  origin: "left" | "right";
};

function existingPage(page: number, pageCount: number) {
  return page >= 1 && page <= pageCount ? page : null;
}

export function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
}

export function viewForPage(page: number, mode: ReaderMode) {
  return mode === "double" ? Math.floor((page - 1) / 2) : page - 1;
}

export function firstPageOfView(view: number, mode: ReaderMode) {
  return mode === "double" ? view * 2 + 1 : view + 1;
}

export function lastView(mode: ReaderMode, pageCount: number) {
  return mode === "double" ? Math.ceil(pageCount / 2) - 1 : pageCount - 1;
}

export function spreadPages(view: number, mode: ReaderMode, pageCount: number): Spread {
  if (mode === "single") {
    return { left: null, right: existingPage(view + 1, pageCount) };
  }

  return {
    left: existingPage(view * 2 + 1, pageCount),
    right: existingPage(view * 2 + 2, pageCount),
  };
}

export function furthestPage(view: number, mode: ReaderMode, pageCount: number) {
  const spread = spreadPages(view, mode, pageCount);
  return spread.right ?? spread.left ?? 1;
}

export function pageLabel(view: number, mode: ReaderMode, pageCount: number) {
  const { left, right } = spreadPages(view, mode, pageCount);

  if (left && right) {
    return `Pages ${left}–${right} of ${pageCount}`;
  }

  return `Page ${left ?? right} of ${pageCount}`;
}

export function computeLayers(view: number, mode: ReaderMode, pageCount: number, turn: Turn | null) {
  const current = spreadPages(view, mode, pageCount);

  if (!turn) {
    return { ...current, leaf: null };
  }

  const progress = turn.progress;

  if (mode === "double") {
    if (turn.direction === "next") {
      const next = spreadPages(view + 1, mode, pageCount);
      return {
        left: current.left,
        right: next.right,
        leaf: { side: "right", front: current.right, back: next.left, angle: -180 * progress, origin: "left" } satisfies Leaf,
      };
    }

    const previous = spreadPages(view - 1, mode, pageCount);
    return {
      left: previous.left,
      right: current.right,
      leaf: { side: "left", front: current.left, back: previous.right, angle: 180 * progress, origin: "right" } satisfies Leaf,
    };
  }

  if (turn.direction === "next") {
    const next = spreadPages(view + 1, mode, pageCount);
    return {
      left: null,
      right: next.right,
      leaf: { side: "single", front: current.right, back: null, angle: -180 * progress, origin: "left" } satisfies Leaf,
    };
  }

  const previous = spreadPages(view - 1, mode, pageCount);
  return {
    left: null,
    right: current.right,
    leaf: { side: "single", front: previous.right, back: null, angle: -180 * (1 - progress), origin: "left" } satisfies Leaf,
  };
}