import { useMemo, useState, useTransition } from "react";
import { createHighlight, recolorHighlight, removeHighlight, saveHighlightNote } from "@/app/(app)/read/[id]/actions";
import { groupByPage, type Highlight, type HighlightColor, type NewHighlight } from "@/lib/highlights";

const TEMP_ID_PREFIX = "temp-";

export function useHighlights(bookId: string, initialHighlights: Highlight[]) {
  const [highlights, setHighlights] = useState(initialHighlights);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const byPage = useMemo(() => groupByPage(highlights), [highlights]);

  function replace(id: string, update: (highlight: Highlight) => Highlight) {
    setHighlights((current) => current.map((highlight) => (highlight.id === id ? update(highlight) : highlight)));
  }

  function findSaved(id: string) {
    return id.startsWith(TEMP_ID_PREFIX) ? undefined : highlights.find((highlight) => highlight.id === id);
  }

  function add(input: NewHighlight) {
    const tempId = `${TEMP_ID_PREFIX}${crypto.randomUUID()}`;
    const note = input.note?.trim() || null;

    setError(null);
    setHighlights((current) => [...current, { ...input, note, id: tempId }]);

    startTransition(async () => {
      const result = await createHighlight(bookId, { ...input, note });

      if (result.ok) {
        replace(tempId, () => result.highlight);
      } else {
        setHighlights((current) => current.filter((highlight) => highlight.id !== tempId));
        setError(result.error);
      }
    });
  }

  function recolor(id: string, color: HighlightColor) {
    const previous = findSaved(id);

    if (!previous) {
      return;
    }

    setError(null);
    replace(id, (highlight) => ({ ...highlight, color }));

    startTransition(async () => {
      const result = await recolorHighlight(id, color);

      if (!result.ok) {
        replace(id, () => previous);
        setError(result.error);
      }
    });
  }

  function saveNote(id: string, note: string) {
    const previous = findSaved(id);

    if (!previous) {
      return;
    }

    setError(null);
    replace(id, (highlight) => ({ ...highlight, note: note.trim() || null }));

    startTransition(async () => {
      const result = await saveHighlightNote(id, note);

      if (!result.ok) {
        replace(id, () => previous);
        setError(result.error);
      }
    });
  }

  function remove(id: string) {
    const previous = findSaved(id);

    if (!previous) {
      return;
    }

    setError(null);
    setHighlights((current) => current.filter((highlight) => highlight.id !== id));

    startTransition(async () => {
      const result = await removeHighlight(id);

      if (!result.ok) {
        setHighlights((current) => [...current, previous]);
        setError(result.error);
      }
    });
  }

  return { highlights, byPage, error, add, recolor, saveNote, remove };
}