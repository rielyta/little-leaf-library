"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PetSprite, type PetPose } from "@/components/library/PetSprite";
import { parseAvatar } from "@/lib/avatars";
import { cn } from "@/lib/cn";

const PET_WIDTH = 84;
const EDGE_GAP = 16;
const MIN_WALK_DISTANCE = 80;
const WALK_SPEED = 38;
const STEP_RATE = 9;
const EMOTE_MS = 1500;
const STRETCH_MS = 1300;

type Mode = "idle" | "walk" | "sit" | "groom" | "sleep" | "stretch" | "petted";

type Motion = {
  x: number;
  target: number;
  facing: 1 | -1;
  mode: Mode;
  until: number;
  width: number;
  ready: boolean;
};

type Parts = {
  body: SVGElement | null;
  tail: SVGElement | null;
  head: SVGElement | null;
  paw: SVGElement | null;
  legsA: SVGElement[];
  legsB: SVGElement[];
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function poseFor(mode: Mode): PetPose {
  switch (mode) {
    case "sit":
    case "petted":
      return "sit";
    case "groom":
      return "groom";
    case "sleep":
      return "sleep";
    case "stretch":
      return "stretch";
    default:
      return "stand";
  }
}

function clampX(x: number, width: number) {
  return Math.min(Math.max(x, EDGE_GAP), Math.max(EDGE_GAP, width - PET_WIDTH - EDGE_GAP));
}

function animateEmote(element: HTMLSpanElement | null) {
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

function HeartEmote() {
  return (
    <svg viewBox="0 0 28 27" className="h-7 w-7" aria-hidden="true">
      <path
        d="M5 1.5h18a3.5 3.5 0 0 1 3.5 3.5v11a3.5 3.5 0 0 1-3.5 3.5h-6.5L14 25l-2.5-5.5H5A3.5 3.5 0 0 1 1.5 16V5A3.5 3.5 0 0 1 5 1.5z"
        fill="#FFFDF8"
        stroke="#5A4636"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 16.5s-5.5-3.2-5.5-7a2.8 2.8 0 0 1 5.5-1.1 2.8 2.8 0 0 1 5.5 1.1c0 3.8-5.5 7-5.5 7z"
        fill="#F28AA5"
        stroke="#5A4636"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LibraryPet({ avatar }: { avatar: string }) {
  const { animal, palette } = parseAvatar(avatar);

  const petRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<SVGSVGElement>(null);
  const partsRef = useRef<Parts>({ body: null, tail: null, head: null, paw: null, legsA: [], legsB: [] });
  const motionRef = useRef<Motion>({ x: 0, target: 0, facing: 1, mode: "idle", until: 0, width: 0, ready: false });
  const reducedMotionRef = useRef(false);
  const emoteTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextEmoteIdRef = useRef(0);

  const [pose, setPose] = useState<PetPose>("stand");
  const [emoteId, setEmoteId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const enterMode = useCallback((mode: Mode, durationMs: number) => {
    const motion = motionRef.current;
    motion.mode = mode;
    motion.until = performance.now() + durationMs;
    setPose(poseFor(mode));
  }, []);

  const walkSomewhere = useCallback(() => {
    const motion = motionRef.current;
    let target = randomBetween(EDGE_GAP, motion.width - PET_WIDTH - EDGE_GAP);

    if (Math.abs(target - motion.x) < MIN_WALK_DISTANCE) {
      target = motion.x + (target >= motion.x ? 1 : -1) * MIN_WALK_DISTANCE;
    }

    motion.target = clampX(target, motion.width);
    enterMode("walk", Number.POSITIVE_INFINITY);
  }, [enterMode]);

  const decide = useCallback(() => {
    const motion = motionRef.current;
    const roll = Math.random();

    switch (motion.mode) {
      case "sleep":
        enterMode("stretch", STRETCH_MS);
        return;
      case "stretch":
        enterMode("idle", randomBetween(500, 1200));
        return;
      case "groom":
        enterMode("sit", randomBetween(1500, 3000));
        return;
      case "petted":
        enterMode("sit", randomBetween(2500, 4500));
        return;
      case "sit":
        if (roll < 0.35) {
          enterMode("groom", randomBetween(2500, 4000));
        } else if (roll < 0.6) {
          enterMode("sleep", randomBetween(9000, 16000));
        } else {
          enterMode("idle", randomBetween(500, 1200));
        }
        return;
      default:
        if (roll < 0.6) {
          walkSomewhere();
        } else if (roll < 0.85) {
          enterMode("sit", randomBetween(4000, 8000));
        } else if (roll < 0.93) {
          enterMode("groom", randomBetween(2500, 4000));
        } else {
          enterMode("sleep", randomBetween(9000, 16000));
        }
    }
  }, [enterMode, walkSomewhere]);

  useEffect(() => () => clearTimeout(emoteTimerRef.current), []);

  useEffect(() => {
    const layer = layerRef.current;

    if (!layer) {
      return;
    }

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new ResizeObserver(([entry]) => {
      const motion = motionRef.current;
      motion.width = entry.contentRect.width;

      if (!motion.ready) {
        motion.ready = true;
        motion.x = clampX(randomBetween(0.2, 0.8) * motion.width, motion.width);
        motion.target = motion.x;
        motion.facing = Math.random() < 0.5 ? 1 : -1;
        enterMode(reducedMotionRef.current ? "sit" : "idle", randomBetween(800, 1600));
        setIsVisible(true);
      } else {
        motion.x = clampX(motion.x, motion.width);
        motion.target = clampX(motion.target, motion.width);
      }
    });

    observer.observe(layer);
    return () => observer.disconnect();
  }, [enterMode]);

  useEffect(() => {
    const sprite = spriteRef.current;

    if (!sprite) {
      return;
    }

    partsRef.current = {
      body: sprite.querySelector<SVGElement>('[data-part="body"]'),
      tail: sprite.querySelector<SVGElement>('[data-part="tail"]'),
      head: sprite.querySelector<SVGElement>('[data-part="head"]'),
      paw: sprite.querySelector<SVGElement>('[data-part="paw"]'),
      legsA: Array.from(sprite.querySelectorAll<SVGElement>('[data-leg="a"]')),
      legsB: Array.from(sprite.querySelectorAll<SVGElement>('[data-leg="b"]')),
    };
  }, [pose, animal]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    function tailAngle(mode: Mode, seconds: number) {
      switch (mode) {
        case "walk":
          return Math.sin(seconds * 7) * 7;
        case "petted":
          return Math.sin(seconds * 10) * 12;
        case "sleep":
          return Math.sin(seconds * 1.2) * 2;
        case "stretch":
          return -10;
        case "sit":
        case "groom": {
          const flick = Math.sin(seconds * 0.9) > 0.85 ? Math.sin(seconds * 14) * 10 : 0;
          return Math.sin(seconds * 2.5) * 4 + flick;
        }
        default:
          return Math.sin(seconds * 3) * 5;
      }
    }

    function paint(now: number) {
      const motion = motionRef.current;
      const parts = partsRef.current;
      const seconds = now / 1000;

      if (petRef.current) {
        petRef.current.style.transform = `translate3d(${motion.x}px, 0, 0)`;
      }

      if (flipRef.current) {
        flipRef.current.style.transform = `scaleX(${motion.facing})`;
      }

      if (reducedMotionRef.current) {
        return;
      }

      const walking = motion.mode === "walk";
      const grooming = motion.mode === "groom";
      const stride = walking ? Math.sin(seconds * STEP_RATE) * 24 : 0;

      for (const leg of parts.legsA) {
        leg.style.transform = `rotate(${stride}deg)`;
      }

      for (const leg of parts.legsB) {
        leg.style.transform = `rotate(${-stride}deg)`;
      }

      const bob = walking
        ? -Math.abs(Math.sin(seconds * STEP_RATE)) * 1.8
        : Math.sin(seconds * (motion.mode === "sleep" ? 1.3 : 2.2)) * 0.6;

      if (parts.body) {
        parts.body.style.transform = `translateY(${bob}px)`;
      }

      if (parts.tail) {
        parts.tail.style.transform = `rotate(${tailAngle(motion.mode, seconds)}deg)`;
      }

      if (parts.head) {
        parts.head.style.transform = grooming ? `rotate(${Math.sin(seconds * 9) * 3}deg)` : "";
      }

      if (parts.paw) {
        parts.paw.style.transform = grooming ? `translateY(${Math.sin(seconds * 9) * 1.4}px)` : "";
      }
    }

    function tick(now: number) {
      const motion = motionRef.current;
      const elapsed = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (motion.ready) {
        if (motion.mode === "walk") {
          const distance = motion.target - motion.x;
          const step = WALK_SPEED * elapsed;

          if (Math.abs(distance) <= step) {
            motion.x = motion.target;
            enterMode("idle", randomBetween(1000, 2800));
          } else {
            motion.x += Math.sign(distance) * step;
            motion.facing = distance > 0 ? 1 : -1;
          }
        } else if (now >= motion.until && !reducedMotionRef.current) {
          decide();
        }

        paint(now);
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [decide, enterMode]);

  function handlePet() {
    const motion = motionRef.current;

    clearTimeout(emoteTimerRef.current);
    nextEmoteIdRef.current += 1;
    setEmoteId(nextEmoteIdRef.current);
    emoteTimerRef.current = setTimeout(() => setEmoteId(null), EMOTE_MS);

    if (motion.mode === "sleep") {
      return;
    }

    motion.target = motion.x;
    enterMode("petted", randomBetween(1600, 2200));
  }

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 select-none">
      <div
        ref={petRef}
        className={cn("absolute bottom-2 left-0 transition-opacity duration-500", isVisible ? "opacity-100" : "opacity-0")}
        style={{ width: PET_WIDTH }}
      >
        {emoteId !== null && (
          <span key={emoteId} ref={animateEmote} className="pointer-events-none absolute bottom-[86%] left-1/2 origin-bottom opacity-0">
            <HeartEmote />
          </span>
        )}

        {pose === "sleep" && emoteId === null && (
          <span aria-hidden="true" className="pointer-events-none absolute top-3 left-[58%] font-display text-sm font-semibold text-ink-faint">
            z<span className="ml-0.5 text-[11px]">z</span>
          </span>
        )}

        <span className="sr-only" aria-live="polite">
          {emoteId !== null ? `Your ${palette.name.toLowerCase()} looks happy.` : ""}
        </span>

        <button
          type="button"
          onClick={handlePet}
          aria-label={`Pet your ${palette.name.toLowerCase()}`}
          className="pointer-events-auto block w-full cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
        >
          <div ref={flipRef}>
            <PetSprite ref={spriteRef} animal={animal} palette={palette} pose={pose} className="block h-auto w-full" />
          </div>
        </button>
      </div>
    </div>
  );
}