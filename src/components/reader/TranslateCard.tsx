import { useEffect, useRef, type KeyboardEvent } from "react";
import type { FloatingAnchor } from "@/components/reader/useTextSelection";
import { useTranslation } from "@/components/reader/useTranslation";
import { cn } from "@/lib/cn";
import {
  canSaveWord,
  isSingleWord,
  isTranslateLanguage,
  SAVED_WORD_DEFINITION_MAX_LENGTH,
  SAVED_WORD_TRANSLATION_MAX_LENGTH,
  TRANSLATE_LANGUAGE_CODES,
  TRANSLATE_LANGUAGES,
  type NewSavedWord,
  type SavedWord,
  type TranslateLanguage,
} from "@/lib/translate";

const CARD_EDGE_MARGIN_PX = 172;
const SPACE_NEEDED_ABOVE_PX = 300;
const VIEWPORT_GAP_PX = 16;
const MIN_CARD_HEIGHT_PX = 180;

export function LeafIcon({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 13C3 7.5 6.8 3 13 3c0 6.2-4.5 10-10 10z" className={filled ? "fill-sage-300" : undefined} />
      <path d="M3 13l5.5-5.5" />
    </svg>
  );
}

function LanguagePicker({ language, onChange }: { language: TranslateLanguage; onChange: (language: TranslateLanguage) => void }) {
  return (
    <label className="relative flex w-fit items-center">
      <span className="sr-only">Translate to</span>
      <select
        value={language}
        onChange={(event) => {
          if (isTranslateLanguage(event.target.value)) {
            onChange(event.target.value);
          }
        }}
        className="cursor-pointer appearance-none rounded-md bg-transparent py-0.5 pr-5 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-mist-200"
      >
        {TRANSLATE_LANGUAGE_CODES.map((code) => (
          <option key={code} value={code}>
            {TRANSLATE_LANGUAGES[code]}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 12 12" className="pointer-events-none absolute right-0 size-3 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 4.5l3 3 3-3" />
      </svg>
    </label>
  );
}

function LoadingLines() {
  return (
    <div className="flex flex-col gap-2 py-1">
      <span className="sr-only">Translating...</span>
      <span aria-hidden="true" className="h-3.5 w-2/3 animate-pulse rounded-full bg-wood-100" />
      <span aria-hidden="true" className="h-3 w-full animate-pulse rounded-full bg-wood-100" />
      <span aria-hidden="true" className="h-3 w-4/5 animate-pulse rounded-full bg-wood-100" />
    </div>
  );
}

type TranslateCardProps = {
  anchor: FloatingAnchor;
  text: string;
  page: number;
  language: TranslateLanguage;
  savedWord: SavedWord | undefined;
  onLanguageChange: (language: TranslateLanguage) => void;
  onSave: (word: NewSavedWord) => void;
  onUnsave: (id: string) => void;
  onClose: () => void;
};

export function TranslateCard({
  anchor,
  text,
  page,
  language,
  savedWord,
  onLanguageChange,
  onSave,
  onUnsave,
  onClose,
}: TranslateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { result, error, isLoading, retry } = useTranslation(text, language);

  const singleWord = isSingleWord(text);
  const showSaveButton = canSaveWord(text);
  const isSaved = Boolean(savedWord);
  const canSave = Boolean(result?.translation);

  const placeBelow = anchor.top < SPACE_NEEDED_ABOVE_PX;
  const safeMargin = Math.min(CARD_EDGE_MARGIN_PX, window.innerWidth / 2);
  const left = Math.min(Math.max(anchor.x, safeMargin), window.innerWidth - safeMargin);
  const maxHeight = Math.max(
    MIN_CARD_HEIGHT_PX,
    placeBelow ? window.innerHeight - anchor.bottom - VIEWPORT_GAP_PX * 2 : anchor.top - VIEWPORT_GAP_PX * 2,
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  function handleToggleSave() {
    if (savedWord) {
      onUnsave(savedWord.id);
      return;
    }

    if (!result?.translation) {
      return;
    }

    const [meaning] = result.meanings;

    onSave({
      word: text.toLowerCase(),
      translation: result.translation.slice(0, SAVED_WORD_TRANSLATION_MAX_LENGTH),
      language: result.language,
      partOfSpeech: meaning?.partOfSpeech ?? null,
      definition: meaning ? meaning.definition.slice(0, SAVED_WORD_DEFINITION_MAX_LENGTH) : null,
      page,
    });
  }

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`Translation of ${text}`}
      onKeyDown={handleKeyDown}
      className="fixed z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border-[1.5px] border-ink bg-paper shadow-[0_5px_0_#CFE3EA]"
      style={{
        left,
        top: placeBelow ? anchor.bottom + 12 : anchor.top - 12,
        transform: placeBelow ? "translateX(-50%)" : "translate(-50%, -100%)",
        maxHeight,
      }}
    >
      <div className="flex items-start gap-3 px-4 pb-3 pt-3.5">
        <div className="min-w-0 flex-1">
          {singleWord ? (
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-serif text-xl font-semibold text-ink-strong">{text}</span>
              {result?.phonetic && <span className="text-xs text-ink-faint">{result.phonetic}</span>}
            </p>
          ) : (
            <p className="line-clamp-3 border-l-4 border-mist-200 pl-2.5 font-serif text-[13px] italic leading-snug text-ink-soft">{text}</p>
          )}
        </div>

        {showSaveButton && (
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={!isSaved && !canSave}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from saved words" : "Save word"}
            title={isSaved ? "Saved to Words" : "Save word"}
            className={cn(
              "flex size-9 flex-none items-center justify-center rounded-full border-[1.5px] transition-colors disabled:opacity-40",
              isSaved ? "border-ink bg-sage-50" : "border-line hover:bg-white",
            )}
          >
            <LeafIcon filled={isSaved} className="size-4" />
          </button>
        )}
      </div>

      <div className="scrollbar-none flex min-h-0 flex-col gap-3.5 overflow-y-auto border-t-[1.5px] border-line px-4 pb-4 pt-3">
        <div className="flex flex-col gap-1">
          <LanguagePicker language={language} onChange={onLanguageChange} />

          {isLoading && <LoadingLines />}

          {!isLoading && error && (
            <div className="flex flex-col items-start gap-1.5">
              <p className="text-sm leading-snug text-ink-soft">{error}</p>
              <button type="button" onClick={retry} className="text-[13px] font-extrabold text-sage-700 underline underline-offset-2">
                Try again
              </button>
            </div>
          )}

          {!isLoading && result && (
            <p className={cn("text-ink-strong", singleWord ? "text-base font-bold" : "text-sm leading-relaxed")}>
              {result.translation ?? <span className="text-sm font-normal text-ink-soft">No translation found for this language.</span>}
            </p>
          )}
        </div>

        {!isLoading && result && result.meanings.length > 0 && (
          <ul className="flex flex-col gap-3">
            {result.meanings.map((meaning) => (
              <li key={meaning.partOfSpeech} className="flex flex-col gap-0.5">
                <span className="text-xs italic text-ink-soft">{meaning.partOfSpeech}</span>
                <span className="text-sm leading-snug text-ink">{meaning.definition}</span>
                {meaning.example && (
                  <span className="mt-1 border-l-2 border-line pl-2 font-serif text-[13px] italic leading-snug text-ink-soft">{meaning.example}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="border-t-[1.5px] border-line px-4 py-2 text-[11px] text-ink-faint">
        {singleWord ? "Translation by MyMemory, definitions by Free Dictionary API" : "Translation by MyMemory"}
      </p>
    </div>
  );
}