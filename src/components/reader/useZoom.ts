import { useState } from "react";

export const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2];

const ZOOM_STORAGE_KEY = "little-leaf-reader-zoom";

function readStoredZoom() {
  try {
    const stored = Number(window.localStorage.getItem(ZOOM_STORAGE_KEY));
    return ZOOM_LEVELS.includes(stored) ? stored : 1;
  } catch {
    return 1;
  }
}

export function useZoom() {
  const [zoom, setZoomState] = useState(readStoredZoom);
  const index = ZOOM_LEVELS.indexOf(zoom);

  function setZoom(next: number) {
    setZoomState(next);

    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, String(next));
    } catch {
      return;
    }
  }

  return {
    zoom,
    canZoomIn: index < ZOOM_LEVELS.length - 1,
    canZoomOut: index > 0,
    zoomIn: () => index < ZOOM_LEVELS.length - 1 && setZoom(ZOOM_LEVELS[index + 1]),
    zoomOut: () => index > 0 && setZoom(ZOOM_LEVELS[index - 1]),
    resetZoom: () => setZoom(1),
  };
}