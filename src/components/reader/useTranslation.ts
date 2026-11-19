import { useEffect, useState } from "react";
import type { TranslateLanguage, TranslationResult } from "@/lib/translate";

const FALLBACK_ERROR = "We couldn't find a translation right now.";

const cache = new Map<string, TranslationResult>();

type Entry = {
  key: string;
  result: TranslationResult | null;
  error: string | null;
};

function errorMessageFrom(body: unknown) {
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return body.error;
  }

  return FALLBACK_ERROR;
}

async function requestTranslation(text: string, language: TranslateLanguage, signal: AbortSignal) {
  const response = await fetch(`/api/translate?${new URLSearchParams({ text, to: language })}`, { signal });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(errorMessageFrom(body));
  }

  return body as TranslationResult;
}

export function useTranslation(text: string, language: TranslateLanguage) {
  const key = `${language}:${text.toLowerCase()}`;
  const [attempt, setAttempt] = useState(0);
  const [entry, setEntry] = useState<Entry | null>(() => {
    const cached = cache.get(key);
    return cached ? { key, result: cached, error: null } : null;
  });

  useEffect(() => {
    const cached = cache.get(key);

    if (cached) {
      setEntry({ key, result: cached, error: null });
      return;
    }

    const controller = new AbortController();

    requestTranslation(text, language, controller.signal)
      .then((result) => {
        cache.set(key, result);
        setEntry({ key, result, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error && !(error instanceof TypeError) ? error.message : FALLBACK_ERROR;
        setEntry({ key, result: null, error: message });
      });

    return () => controller.abort();
  }, [key, text, language, attempt]);

  const current = entry?.key === key ? entry : null;

  function retry() {
    setEntry(null);
    setAttempt((count) => count + 1);
  }

  return {
    result: current?.result ?? null,
    error: current?.error ?? null,
    isLoading: current === null,
    retry,
  };
}