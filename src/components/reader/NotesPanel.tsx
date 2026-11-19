import { useEffect, useState, type ReactNode } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { NoteIcon } from "@/components/reader/HighlightToolbars";
import { LeafIcon } from "@/components/reader/TranslateCard";
import { cn } from "@/lib/cn";
import { HIGHLIGHT_COLORS, type Highlight } from "@/lib/highlights";
import type { SavedWord } from "@/lib/translate";

const SNIPPET_LENGTH = 90;

type NotesTab = "bookmarks" | "highlights" | "comments" | "words";

type NotesPanelProps = {
  pdf: PDFDocumentProxy | null;
  bookmarks: number[];
  highlights: Highlight[];
  savedWords: SavedWord[];
  visiblePages: number[];
  onSelectPage: (page: number) => void;
  onRemoveBookmark: (page: number) => void;
  onRemoveHighlight: (id: string) => void;
  onRemoveNote: (id: string) => void;
  onRemoveSavedWord: (id: string) => void;
  onClose: () => void;
};

function usePageSnippet(pdf: PDFDocumentProxy | null, page: number) {
  const [snippet, setSnippet] = useState<string | null>(null);

  useEffect(() => {
    if (!pdf) {
      return;
    }

    let cancelled = false;

    pdf
      .getPage(page)
      .then((pdfPage) => pdfPage.getTextContent())
      .then((content) => {
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (!cancelled) {
          setSnippet(text.length > SNIPPET_LENGTH ? `${text.slice(0, SNIPPET_LENGTH).trimEnd()}...` : text);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnippet("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pdf, page]);

  return snippet;
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="m-1.5 flex size-8 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-blush-50 hover:text-danger"
    >
      <svg viewBox="0 0 18 18" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 4l10 10M14 4L4 14" />
      </svg>
    </button>
  );
}

function ItemShell({
  isCurrent,
  onSelect,
  onRemove,
  removeLabel,
  children,
}: {
  isCurrent: boolean;
  onSelect: () => void;
  onRemove: () => void;
  removeLabel: string;
  children: ReactNode;
}) {
  return (
    <li className={cn("flex items-start rounded-2xl border-[1.5px] bg-white", isCurrent ? "border-ink" : "border-[#EADFD2]")}>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-start gap-3 rounded-2xl p-3 text-left hover:bg-paper">
        {children}
      </button>
      <RemoveButton label={removeLabel} onClick={onRemove} />
    </li>
  );
}

function BookmarkItem({
  pdf,
  page,
  isCurrent,
  onSelect,
  onRemove,
}: {
  pdf: PDFDocumentProxy | null;
  page: number;
  isCurrent: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const snippet = usePageSnippet(pdf, page);

  return (
    <ItemShell isCurrent={isCurrent} onSelect={onSelect} onRemove={onRemove} removeLabel={`Remove bookmark from page ${page}`}>
      <span className="flex size-8 flex-none items-center justify-center rounded-[10px] border-[1.5px] border-ink bg-blush-400">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 2h8v12l-4-3-4 3z" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-extrabold text-ink-soft">Page {page}</span>
        <span className="text-sm leading-snug text-ink-strong">{snippet === null ? "Loading..." : snippet || "No text on this page"}</span>
      </span>
    </ItemShell>
  );
}

function ColorBar({ highlight }: { highlight: Highlight }) {
  return (
    <span
      className="mt-0.5 h-8 w-1.5 flex-none rounded-full border border-ink"
      style={{ backgroundColor: HIGHLIGHT_COLORS[highlight.color].fill }}
    />
  );
}

function EmptyNotice({ children }: { children: string }) {
  return <p className="rounded-2xl border-[1.5px] border-dashed border-wood-300 p-4 text-sm leading-relaxed text-ink-soft">{children}</p>;
}

function ItemList({ children }: { children: ReactNode }) {
  return <ul className="scrollbar-none flex min-h-0 flex-col gap-2.5 overflow-y-auto">{children}</ul>;
}

export function NotesPanel({
  pdf,
  bookmarks,
  highlights,
  savedWords,
  visiblePages,
  onSelectPage,
  onRemoveBookmark,
  onRemoveHighlight,
  onRemoveNote,
  onRemoveSavedWord,
  onClose,
}: NotesPanelProps) {
  const [tab, setTab] = useState<NotesTab>("bookmarks");

  const sortedHighlights = [...highlights].sort((a, b) => a.page - b.page);
  const comments = sortedHighlights.filter((highlight) => highlight.note);
  const sortedWords = [...savedWords].sort((a, b) => a.page - b.page || a.word.localeCompare(b.word));

  const tabs: { key: NotesTab; label: string; count: number }[] = [
    { key: "bookmarks", label: "Bookmarks", count: bookmarks.length },
    { key: "highlights", label: "Highlights", count: highlights.length },
    { key: "comments", label: "Comments", count: comments.length },
    { key: "words", label: "Words", count: savedWords.length },
  ];

  return (
    <aside
      aria-label="Notes"
      className="absolute inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col gap-4 border-l-[1.5px] border-wood-200 bg-cream p-5 shadow-[-12px_0_30px_-20px_#5A4636] lg:static lg:w-84 lg:shadow-none"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-semibold text-ink-strong">Notes</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notes"
          className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-line hover:bg-white"
        >
          <svg viewBox="0 0 18 18" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        </button>
      </div>

      <div role="tablist" aria-label="Note type" className="grid grid-cols-4 gap-1 rounded-2xl bg-[#F3EADF] p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center rounded-xl px-1 leading-tight transition-colors",
              tab === item.key ? "bg-white shadow-[0_2px_0_var(--color-line)]" : "hover:bg-white/60",
            )}
          >
            <span className="text-[11px] font-extrabold">{item.label}</span>
            <span className="text-[11px] font-bold text-ink-soft">{item.count}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="flex min-h-0 flex-1 flex-col">
        {tab === "bookmarks" &&
          (bookmarks.length === 0 ? (
            <EmptyNotice>No bookmarks yet. Tap the ribbon at the top of a page, or press B, to keep your place.</EmptyNotice>
          ) : (
            <ItemList>
              {bookmarks.map((page) => (
                <BookmarkItem
                  key={page}
                  pdf={pdf}
                  page={page}
                  isCurrent={visiblePages.includes(page)}
                  onSelect={() => onSelectPage(page)}
                  onRemove={() => onRemoveBookmark(page)}
                />
              ))}
            </ItemList>
          ))}

        {tab === "highlights" &&
          (highlights.length === 0 ? (
            <EmptyNotice>No highlights yet. Select some text on a page and pick a color.</EmptyNotice>
          ) : (
            <ItemList>
              {sortedHighlights.map((highlight) => (
                <ItemShell
                  key={highlight.id}
                  isCurrent={visiblePages.includes(highlight.page)}
                  onSelect={() => onSelectPage(highlight.page)}
                  onRemove={() => onRemoveHighlight(highlight.id)}
                  removeLabel={`Remove highlight on page ${highlight.page}`}
                >
                  <ColorBar highlight={highlight} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft">
                      Page {highlight.page}
                      {highlight.note && <NoteIcon className="size-3" />}
                    </span>
                    <span className="line-clamp-3 font-serif text-sm leading-snug text-ink-strong">{highlight.text}</span>
                  </span>
                </ItemShell>
              ))}
            </ItemList>
          ))}

        {tab === "comments" &&
          (comments.length === 0 ? (
            <EmptyNotice>No comments yet. Select some text and choose Comment to leave yourself a note.</EmptyNotice>
          ) : (
            <ItemList>
              {comments.map((highlight) => (
                <ItemShell
                  key={highlight.id}
                  isCurrent={visiblePages.includes(highlight.page)}
                  onSelect={() => onSelectPage(highlight.page)}
                  onRemove={() => onRemoveNote(highlight.id)}
                  removeLabel={`Delete comment on page ${highlight.page}`}
                >
                  <ColorBar highlight={highlight} />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs font-extrabold text-ink-soft">Page {highlight.page}</span>
                    <span className="line-clamp-2 font-serif text-[13px] italic leading-snug text-ink-soft">{highlight.text}</span>
                    <span className="whitespace-pre-line text-sm leading-snug text-ink-strong">{highlight.note}</span>
                  </span>
                </ItemShell>
              ))}
            </ItemList>
          ))}

        {tab === "words" &&
          (savedWords.length === 0 ? (
            <EmptyNotice>No saved words yet. Select a word, choose Translate, then tap the leaf to keep it here.</EmptyNotice>
          ) : (
            <ItemList>
              {sortedWords.map((item) => (
                <ItemShell
                  key={item.id}
                  isCurrent={visiblePages.includes(item.page)}
                  onSelect={() => onSelectPage(item.page)}
                  onRemove={() => onRemoveSavedWord(item.id)}
                  removeLabel={`Remove ${item.word} from saved words`}
                >
                  <span className="flex size-8 flex-none items-center justify-center rounded-[10px] border-[1.5px] border-ink bg-sage-100">
                    <LeafIcon filled className="size-3.5" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-serif text-[15px] font-semibold text-ink-strong">{item.word}</span>
                      <span className="text-xs font-extrabold text-ink-soft">Page {item.page}</span>
                    </span>
                    <span className="text-sm leading-snug text-ink-strong">{item.translation}</span>
                    {item.definition && (
                      <span className="line-clamp-2 text-xs leading-snug text-ink-soft">
                        {item.partOfSpeech && <em>{item.partOfSpeech}. </em>}
                        {item.definition}
                      </span>
                    )}
                  </span>
                </ItemShell>
              ))}
            </ItemList>
          ))}
      </div>
    </aside>
  );
}