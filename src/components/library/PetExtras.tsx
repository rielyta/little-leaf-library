import { EMOTE_MS, type Emote } from "@/components/library/pet-behavior";
import type { AvatarAnimal } from "@/lib/avatars";

export function animateEmote(element: HTMLSpanElement | null) {
  if (!element) {
    return;
  }

  element.animate(
    [
      { transform: "translate(-50%, 6px) scale(0.2)", opacity: 0 },
      { transform: "translate(-50%, 0) scale(1.15)", opacity: 1, offset: 0.14 },
      { transform: "translate(-50%, 0) scale(1)", opacity: 1, offset: 0.24 },
      { transform: "translate(-50%, 0) scale(1)", opacity: 1, offset: 0.82 },
      { transform: "translate(-50%, -6px) scale(1)", opacity: 0 },
    ],
    { duration: EMOTE_MS, easing: "ease-out", fill: "forwards" },
  );
}

function heartPath(x: number, y: number, k: number) {
  return `M${x} ${y}s${-5.5 * k} ${-3.2 * k} ${-5.5 * k} ${-7 * k}a${2.8 * k} ${2.8 * k} 0 0 1 ${5.5 * k} ${-1.1 * k} ${2.8 * k} ${2.8 * k} 0 0 1 ${5.5 * k} ${1.1 * k}c0 ${3.8 * k} ${-5.5 * k} ${7 * k} ${-5.5 * k} ${7 * k}z`;
}

export function EmoteBubble({ type }: { type: Emote }) {
  return (
    <svg viewBox="0 0 28 27" className="h-7 w-7" aria-hidden="true">
      <path
        d="M5 1.5h18a3.5 3.5 0 0 1 3.5 3.5v11a3.5 3.5 0 0 1-3.5 3.5h-6.5L14 25l-2.5-5.5H5A3.5 3.5 0 0 1 1.5 16V5A3.5 3.5 0 0 1 5 1.5z"
        fill="#FFFDF8"
        stroke="#5A4636"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {type === "heart" && <path d={heartPath(14, 16.5, 1)} fill="#F28AA5" stroke="#5A4636" strokeWidth="1.1" strokeLinejoin="round" />}

      {type === "hearts" && (
        <>
          <path d={heartPath(9.5, 15.5, 0.62)} fill="#F28AA5" stroke="#5A4636" strokeWidth="1" strokeLinejoin="round" />
          <path d={heartPath(18.5, 13, 0.7)} fill="#F28AA5" stroke="#5A4636" strokeWidth="1" strokeLinejoin="round" />
        </>
      )}

      {type === "note" && (
        <>
          <path d="M11.5 15V7l7.5-2v8" fill="none" stroke="#5A4636" strokeWidth="1.6" strokeLinejoin="round" />
          <ellipse cx="9.6" cy="15.2" rx="2.3" ry="1.8" fill="#A9CCD8" stroke="#5A4636" strokeWidth="1.2" />
          <ellipse cx="17.1" cy="13.2" rx="2.3" ry="1.8" fill="#A9CCD8" stroke="#5A4636" strokeWidth="1.2" />
        </>
      )}

      {type === "exclaim" && (
        <>
          <path d="M14 5.5v7.5" stroke="#5A4636" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="14" cy="16.3" r="1.5" fill="#5A4636" />
        </>
      )}
    </svg>
  );
}

export function PetToy({ animal }: { animal: AvatarAnimal }) {
  if (animal === "dog") {
    return (
      <svg viewBox="0 0 22 22" className="block size-full" aria-hidden="true">
        <circle cx="11" cy="11" r="9.5" fill="#E6E58F" stroke="#5A4636" strokeWidth="1.5" />
        <path d="M3.6 6.5c3.6 2.2 3.6 6.8 0 9M18.4 6.5c-3.6 2.2-3.6 6.8 0 9" stroke="#FFFDF8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (animal === "cat") {
    return (
      <svg viewBox="0 0 22 22" className="block size-full" aria-hidden="true">
        <circle cx="11" cy="11" r="9.5" fill="#F2B8C6" stroke="#5A4636" strokeWidth="1.5" />
        <path d="M4.5 7c4 2.2 9 2.2 13 0M3.2 11.5c5 2.2 10.6 2.2 15.6 0M6 16c3.2 1.5 7 1.5 10 0" stroke="#D98BA0" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 22 22" className="block size-full" aria-hidden="true">
      <circle cx="11" cy="11" r="9.5" fill="#BFD8C2" stroke="#5A4636" strokeWidth="1.5" />
      <path d="M11 1.8v18.4M1.8 11h18.4" stroke="#FFFDF8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}