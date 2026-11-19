import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TRANSLATE_LANGUAGE, isTranslateLanguage, type TranslateLanguage } from "@/lib/translate";

const STORAGE_KEY = "little-leaf:translate-language";

export function useTranslateLanguage() {
  const [language, setLanguageState] = useState<TranslateLanguage>(DEFAULT_TRANSLATE_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored && isTranslateLanguage(stored)) {
        setLanguageState(stored);
      }
    } catch {
      // Storage can be unavailable in private windows. The default language still works.
    }
  }, []);

  const setLanguage = useCallback((next: TranslateLanguage) => {
    setLanguageState(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore: the choice still applies for this visit.
    }
  }, []);

  return { language, setLanguage };
}