import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { FloatingAnchor } from "@/components/reader/useTextSelection";
import { cn } from "@/lib/cn";
import { HIGHLIGHT_COLOR_KEYS, HIGHLIGHT_COLORS, HIGHLIGHT_NOTE_MAX_LENGTH, type HighlightColor } from "@/lib/highlights";

const EDGE_MARGIN_PX = 90;
const NOTE_EDGE_MARGIN_PX = 160;
const MIN_SPACE_ABOVE_PX = 72;
const NOTE_EDITOR_HEIGHT_PX = 260;

function horizontalPosition(x: number, margin: number) {
  return Math.min(Math.max(x, margin), window.innerWidth - margin);
}

function FloatingBar({ anchor, label, children }: { anchor: FloatingAnchor; label: string; children: ReactNode }) {
  const placeBelow = anchor.top < MIN_SPACE_ABOVE_PX;

  return (
    <div
      role="toolbar"
      aria-label={label}
      onPointerDown={(event) => event.preventDefault()}
      className="fixed z-50 flex items-center gap-1.5 rounded-2xl border-[1.5px] border-ink bg-paper p-1.5 shadow-[0_5px_0_#CFE3EA]"
      style={{
        left: horizontalPosition(anchor.x, EDGE_MARGIN_PX),
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

function TextButton({ onClick, children, tone = "default" }: { onClick: () => void; children: ReactNode; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-extrabold",
        tone === "danger" ? "text-danger hover:bg-blush-50" : "hover:bg-white",
      )}
    >
      {children}
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

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-6 w-[1.5px] bg-line" />;
}

type SelectionToolbarProps = {
  anchor: FloatingAnchor;
  onHighlight: (color: HighlightColor) => void;
  onComment: () => void;
  onCopy: () => void;
};

export function SelectionToolbar({ anchor, onHighlight, onComment, onCopy }: SelectionToolbarProps) {
  return (
    <FloatingBar anchor={anchor} label="Actions for selected text">
      {HIGHLIGHT_COLOR_KEYS.map((color) => (
        <ColorButton key={color} color={color} onClick={() => onHighlight(color)} />
      ))}
      <Divider />
      <TextButton onClick={onComment}>
        <NoteIcon className="size-3.5" />
        Comment
      </TextButton>
      <TextButton onClick={onCopy}>Copy</TextButton>
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
    <FloatingBar anchor={anchor} label="Highlight options">
      {HIGHLIGHT_COLOR_KEYS.map((color) => (
        <ColorButton key={color} color={color} active={color === current} onClick={() => onRecolor(color)} />
      ))}
      <Divider />
      <TextButton onClick={onComment}>
        <NoteIcon className="size-3.5" />
        {hasNote ? "Edit comment" : "Comment"}
      </TextButton>
      <TextButton onClick={onDelete} tone="danger">
        Remove
      </TextButton>
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