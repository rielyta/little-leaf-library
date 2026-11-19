import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { TurnDirection } from "@/lib/reader";

type ArrowButtonProps = {
  direction: TurnDirection;
  disabled: boolean;
  onClick: () => void;
  className?: string;
};

export function ArrowButton({ direction, disabled, onClick, className }: ArrowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "next" ? "Next page" : "Previous page"}
      className={cn(
        "flex size-13 flex-none items-center justify-center rounded-full border-[1.5px] border-ink bg-paper shadow-[0_4px_0_#CFE3EA] transition-opacity disabled:opacity-40",
        className,
      )}
    >
      <svg viewBox="0 0 22 22" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={direction === "next" ? "M8.5 5l6 6-6 6" : "M13.5 5l-6 6 6 6"} />
      </svg>
    </button>
  );
}

type ZoomControlsProps = {
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function ZoomControls({ zoom, canZoomIn, canZoomOut, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div role="group" aria-label="Zoom" className="flex flex-none items-center rounded-full border-[1.5px] border-line bg-white">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Zoom out"
        className="flex size-10 items-center justify-center rounded-full text-lg font-extrabold disabled:opacity-35"
      >
        −
      </button>
      <button type="button" onClick={onReset} aria-label="Fit page to screen" className="min-w-13 text-center text-sm font-extrabold">
        {zoom === 1 ? "Fit" : `${Math.round(zoom * 100)}%`}
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Zoom in"
        className="flex size-10 items-center justify-center rounded-full text-lg font-extrabold disabled:opacity-35"
      >
        +
      </button>
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  badge?: number;
};

export function ToolbarButton({ label, active = false, onClick, children, badge }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex size-10 flex-none items-center justify-center rounded-full border-[1.5px] transition-colors",
        active ? "border-ink bg-blush-100" : "border-line bg-white hover:bg-paper",
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full border-[1.5px] border-ink bg-blush-400 px-1 text-[11px] font-extrabold leading-4">
          {badge}
        </span>
      )}
    </button>
  );
}

export function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={active ? "M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4" : "M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4"} />
    </svg>
  );
}

export function NotesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 3h10v14l-5-3.5L5 17z" />
    </svg>
  );
}