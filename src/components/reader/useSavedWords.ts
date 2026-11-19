import { useState, useTransition } from "react";
import { removeSavedWord, saveWord } from "@/app/(app)/read/[id]/actions";
import type { NewSavedWord, SavedWord } from "@/lib/translate";

const TEMP_ID_PREFIX = "temp-";

export function useSavedWords(bookId: string, initialWords: SavedWord[]) {
  const [words, setWords] = useState(initialWords);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function find(text: string) {
    const key = text.toLowerCase();
    return words.find((item) => item.word === key);
  }

  function save(input: NewSavedWord) {
    const tempId = `${TEMP_ID_PREFIX}${crypto.randomUUID()}`;
    const word = input.word.toLowerCase();

    setError(null);
    setWords((current) => [...current.filter((item) => item.word !== word), { ...input, word, id: tempId }]);

    startTransition(async () => {
      const result = await saveWord(bookId, { ...input, word });

      if (result.ok) {
        setWords((current) => current.map((item) => (item.id === tempId ? result.word : item)));
      } else {
        setWords((current) => current.filter((item) => item.id !== tempId));
        setError(result.error);
      }
    });
  }

  function remove(id: string) {
    const previous = words.find((item) => item.id === id);

    if (!previous || id.startsWith(TEMP_ID_PREFIX)) {
      return;
    }

    setError(null);
    setWords((current) => current.filter((item) => item.id !== id));

    startTransition(async () => {
      const result = await removeSavedWord(id);

      if (!result.ok) {
        setWords((current) => [...current, previous]);
        setError(result.error);
      }
    });
  }

  return { words, error, find, save, remove };
}