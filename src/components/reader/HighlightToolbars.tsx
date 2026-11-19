import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { FloatingAnchor } from "@/components/reader/useTextSelection";
import { cn } from "@/lib/cn";
import { HIGHLIGHT_COLOR_KEYS, HIGHLIGHT_COLORS, HIGHLIGHT_NOTE_MAX_LENGTH, type HighlightColor } from "@/lib/highlights";

const SELECTION_TOOLBAR_MARGIN_PX = 230;
const HIGHLIGHT_MENU_MARGIN_PX = 190;
const NOTE_EDGE_MARGIN_PX = 160;
const MIN_SPACE_ABOVE_PX = 72;
const NOTE_EDITOR_HEIGHT_PX = 260;

function horizontalPosition(x: number, margin: number) {
  const safeMargin = Math.min(margin, window.innerWidth / 2);
  return Math.min(Math.max(x, safeMargin), window.innerWidth - safeMargin);
}

function FloatingBar({ anchor, label, margin, children }: { anchor: FloatingAnchor; label: string; margin: number; children: ReactNode }) {
  const placeBelow = anchor.top < MIN_SPACE_ABOVE_PX;

  return (
    <div
      role="toolbar"
      aria-label={label}
      onPointerDown={(event) => event.preventDefault()}
      className="fixed z-50 flex items-center gap-1.5 rounded-2xl border-[1.5px] border-ink bg-paper p-1.5 shadow-[0_5px_0_#CFE3EA]"
      style={{
        left: horizontalPosition(anchor.x, margin),
        top: placeBelow ? anchor.bottom + 10 : anchor.top - 10,
        transform: placeBelow ? "translateX(-50%)" : "translate(-50%, -100%)",
      }}
    >
      {children}
    </div>
  );
}

function ColorButton({ color, active = false, onClick }: { color: HighlightColor; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Highlight ${HIGHLIGHT_COLORS[color].label.toLowerCase()}`}
      aria-pressed={active}
      className={cn(
        "size-9 rounded-full border-[1.5px] border-ink transition-transform hover:scale-110",
        active && "shadow-[0_0_0_2.5px_#FFFDF8,0_0_0_4.5px_#5A4636]",
      )}
      style={{ backgroundColor: HIGHLIGHT_COLORS[color].fill }}
    />
  );
}

type TextButtonProps = {
  label: string;
  icon?: ReactNode;
  compact?: boolean;
  tone?: "default" | "danger";
  onClick: () => void;
};

function TextButton({ label, icon, compact = false, tone = "default", onClick }: TextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-extrabold sm:px-3",
        tone === "danger" ? "text-danger hover:bg-blush-50" : "hover:bg-white",
      )}
    >
      {icon}
      <span className={cn(compact && "hidden sm:inline")}>{label}</span>
    </button>
  );
}

export function NoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3h10v7H8l-3 3v-3H3z" />
    </svg>
  );
}

export function TranslateIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4h7M5.5 2.5V4M7.5 4c-.6 2.4-2.1 4.3-4.5 5.5M4 6c.7 1.5 1.9 2.6 3.5 3.3" />
      <path d="M8.5 14l2.5-6 2.5 6M9.3 12h3.4" />
    </svg>
  );
}

export function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8.5" rx="1.5" />
      <path d="M3 10.5V3.5A1.5 1.5 0 0 1 4.5 2H10" />
    </svg>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-6 w-[1.5px] bg-line" />;
}

type SelectionToolbarProps = {
  anchor: FloatingAnchor;
  onHighlight: (color: HighlightColor) => void;
  onComment: () => void;
  onTranslate: () => void;
  onCopy: () => void;
};

export function SelectionToolbar({ anchor, onHighlight, onComment, onTranslate, onCopy }: SelectionToolbarProps) {
  return (
    <FloatingBar anchor={anchor} label="Actions for selected text" margin={SELECTION_TOOLBAR_MARGIN_PX}>
      {HIGHLIGHT_COLOR_KEYS.map((color) => (
        <ColorButton key={color} color={color} onClick={() => onHighlight(color)} />
      ))}
      <Divider />
      <TextButton label="Comment" icon={<NoteIcon className="size-3.5" />} compact onClick={onComment} />
      <TextButton label="Translate" icon={<TranslateIcon className="size-4" />} compact onClick={onTranslate} />
      <TextButton label="Copy" icon={<CopyIcon className="size-3.5" />} compact onClick={onCopy} />
    </FloatingBar>
  );
}

type HighlightMenuProps = {
  anchor: FloatingAnchor;
  current: HighlightColor;
  hasNote: boolean;
  onRecolor: (color: HighlightColor) => void;
  onComment: () => void;
  onDelete: () => void;
};

export function HighlightMenu({ anchor, current, hasNote, onRecolor, onComment, onDelete }: HighlightMenuProps) {
  return (
    <FloatingBar anchor={anchor} label="Highlight options" margin={HIGHLIGHT_MENU_MARGIN_PX}>
      {HIGHLIGHT_COLOR_KEYS.map((color) => (
        <ColorButton key={color} color={color} active={color === current} onClick={() => onRecolor(color)} />
      ))}
      <Divider />
      <TextButton label={hasNote ? "Edit comment" : "Comment"} icon={<NoteIcon className="size-3.5" />} compact onClick={onComment} />
      <TextButton label="Remove" tone="danger" onClick={onDelete} />
    </FloatingBar>
  );
}

type NoteEditorProps = {
  anchor: FloatingAnchor;
  quote: string;
  initialNote: string;
  isEditing: boolean;
  onSave: (note: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
};

export function NoteEditor({ anchor, quote, initialNote, isEditing, onSave, onDelete, onCancel }: NoteEditorProps) {
  const [value, setValue] = useState(initialNote);
  const canSave = value.trim().length > 0;
  const placeBelow = anchor.top < NOTE_EDITOR_HEIGHT_PX;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSave) {
      onSave(value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && canSave) {
      event.preventDefault();
      onSave(value);
    }
  }

  return (
    <form
      role="dialog"
      aria-label={isEditing ? "Edit comment" : "Add a comment"}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="fixed z-50 flex w-72 flex-col gap-2.5 rounded-2xl border-[1.5px] border-ink bg-paper p-3.5 shadow-[0_5px_0_#CFE3EA]"
      style={{
        left: horizontalPosition(anchor.x, NOTE_EDGE_MARGIN_PX),
        top: placeBelow ? anchor.bottom + 12 : anchor.top - 12,
        transform: placeBelow ? "translateX(-50%)" : "translate(-50%, -100%)",
      }}
    >
      <p className="line-clamp-2 border-l-4 border-[#FBE3A0] pl-2.5 font-serif text-[13px] italic leading-snug text-ink-soft">{quote}</p>

      <label htmlFor="highlight-note" className="sr-only">
        Your comment
      </label>
      <textarea
        id="highlight-note"
        autoFocus
        rows={4}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={HIGHLIGHT_NOTE_MAX_LENGTH}
        placeholder="Write a little note to yourself..."
        className="resize-none rounded-xl border-[1.5px] border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-sage-600"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-ink-faint">
          {value.length}/{HIGHLIGHT_NOTE_MAX_LENGTH}
        </span>
        <div className="flex items-center gap-1.5">
          {isEditing && onDelete && (
            <button type="button" onClick={onDelete} className="min-h-9 rounded-full px-3 text-[13px] font-extrabold text-danger hover:bg-blush-50">
              Delete
            </button>
          )}
          <button type="button" onClick={onCancel} className="min-h-9 rounded-full px-3 text-[13px] font-extrabold hover:bg-white">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="min-h-9 rounded-full bg-sage-600 px-4 text-[13px] font-extrabold text-white hover:bg-sage-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}