"use client";

import { useEffect, useRef, useState } from "react";
import {
  ATTENTION_RANGE,
  ATTENTIVE_MODES,
  BLINK_EVERY_S,
  BLINK_S,
  clampX,
  EDGE_GAP,
  EMOTE_MS,
  expressionFor,
  headTransform,
  hopTiming,
  MIN_WALK_DISTANCE,
  MOVING_MODES,
  PET_STREAK_MS,
  PET_WIDTH,
  PETS_FOR_JOY,
  PETS_TO_WAKE,
  poseFor,
  randomBetween,
  speciesFor,
  STEP_RATE,
  tailTransform,
  TOY_FRICTION,
  TOY_SIZE,
  weightedPick,
  type Emote,
  type Mode,
} from "@/components/library/pet-behavior";
import { animateEmote, EmoteBubble, PetToy } from "@/components/library/PetExtras";
import { PetSprite, type PetExpression, type PetPose } from "@/components/library/PetSprite";
import { parseAvatar } from "@/lib/avatars";
import { cn } from "@/lib/cn";

const CALM_PACE = 1.6;

type Jump = {
  start: number;
  duration: number;
  height: number;
  twist: number;
};

type Motion = {
  x: number;
  target: number;
  facing: 1 | -1;
  mode: Mode;
  until: number;
  width: number;
  ready: boolean;
  speed: number;
  hopClock: number;
  jump: Jump | null;
  queuedJump: Jump | null;
  petTimes: number[];
  sleepPets: number;
  twitchUntil: number;
  pointerX: number | null;
};

type Toy = {
  x: number;
  velocity: number;
  spin: number;
};

type Leg = {
  element: SVGElement;
  group: string;
  side: string;
};

type Parts = {
  body: SVGElement | null;
  tail: SVGElement | null;
  head: SVGElement | null;
  ears: SVGElement | null;
  eyes: SVGElement | null;
  paw: SVGElement | null;
  legs: Leg[];
};

type Controller = {
  pet: () => void;
  toss: () => void;
};

const EMPTY_PARTS: Parts = { body: null, tail: null, head: null, ears: null, eyes: null, paw: null, legs: [] };

function setTransform(element: Element | null, value: string) {
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.style.transform = value;
  }
}

export function LibraryPet({ avatar }: { avatar: string }) {
  const { animal, palette } = parseAvatar(avatar);
  const species = speciesFor(animal);

  const layerRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<SVGSVGElement>(null);
  const toyRef = useRef<HTMLDivElement>(null);
  const toySpinRef = useRef<HTMLSpanElement>(null);
  const partsRef = useRef<Parts>(EMPTY_PARTS);
  const controllerRef = useRef<Controller | null>(null);

  const [pose, setPose] = useState<PetPose>("stand");
  const [expression, setExpression] = useState<PetExpression>("neutral");
  const [emote, setEmote] = useState<{ id: number; type: Emote } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCalm, setIsCalm] = useState(false);

  useEffect(() => {
    const sprite = spriteRef.current;

    if (!sprite) {
      return;
    }

    partsRef.current = {
      body: sprite.querySelector<SVGElement>('[data-part="body"]'),
      tail: sprite.querySelector<SVGElement>('[data-part="tail"]'),
      head: sprite.querySelector<SVGElement>('[data-part="head"]'),
      ears: sprite.querySelector<SVGElement>('[data-part="ears"]'),
      eyes: sprite.querySelector<SVGElement>('[data-part="eyes"]'),
      paw: sprite.querySelector<SVGElement>('[data-part="paw"]'),
      legs: Array.from(sprite.querySelectorAll<SVGElement>("[data-leg]")).map((element) => ({
        element,
        group: element.dataset.leg ?? "a",
        side: element.dataset.side ?? "back",
      })),
    };
  }, [pose, expression, animal]);

  useEffect(() => {
    const layer = layerRef.current;

    if (!layer) {
      return;
    }

    const traits = speciesFor(animal);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blinkSeed = Math.random() * BLINK_EVERY_S;

    setIsCalm(calm);

    const motion: Motion = {
      x: 0,
      target: 0,
      facing: 1,
      mode: "idle",
      until: 0,
      width: 0,
      ready: false,
      speed: traits.walkSpeed,
      hopClock: 0,
      jump: null,
      queuedJump: null,
      petTimes: [],
      sleepPets: 0,
      twitchUntil: 0,
      pointerX: null,
    };

    const toy: Toy = { x: 0, velocity: 0, spin: 0 };

    let emoteCount = 0;
    let emoteTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let last = performance.now();

    function hold(min: number, max: number) {
      return randomBetween(min, max) * (calm ? CALM_PACE : 1);
    }

    function showEmote(type: Emote) {
      emoteCount += 1;
      clearTimeout(emoteTimer);
      setEmote({ id: emoteCount, type });
      emoteTimer = setTimeout(() => setEmote(null), EMOTE_MS);
    }

    function enterMode(mode: Mode, durationMs: number) {
      motion.mode = mode;
      motion.until = performance.now() + durationMs;
      motion.hopClock = 0;

      if (mode === "sleep") {
        motion.sleepPets = 0;
      }

      setPose(poseFor(mode, animal));
      setExpression(expressionFor(mode));
    }

    function moveTo(target: number, speed: number, mode: Mode) {
      motion.target = clampX(target, motion.width);
      motion.speed = speed;
      enterMode(mode, Number.POSITIVE_INFINITY);
    }

    function jump(height: number, duration: number, twist: number) {
      if (!calm) {
        motion.jump = { start: performance.now(), duration, height, twist };
      }
    }

    function walkSomewhere() {
      let target = randomBetween(EDGE_GAP, motion.width - PET_WIDTH - EDGE_GAP);

      if (Math.abs(target - motion.x) < MIN_WALK_DISTANCE) {
        target = motion.x + (target >= motion.x ? 1 : -1) * MIN_WALK_DISTANCE;
      }

      moveTo(target, traits.walkSpeed, "walk");
    }

    function startIdleActivity() {
      switch (weightedPick(traits.idleChoices)) {
        case "walk":
          if (calm) {
            enterMode("sit", hold(4000, 8000));
          } else {
            walkSomewhere();
          }

          return;
        case "sit":
          enterMode("sit", hold(4000, 8000));
          return;
        case "groom":
          enterMode("groom", hold(2500, 4000));
          return;
        case "look":
          enterMode("look", hold(2000, 3200));
          return;
        case "sniff":
          enterMode("sniff", hold(1800, 3000));
          return;
        case "sleep":
          enterMode("yawn", 1300);
          return;
        default:
          enterMode("idle", hold(800, 1600));
      }
    }

    function decide() {
      switch (motion.mode) {
        case "yawn":
          enterMode("sleep", hold(10000, 18000));
          return;
        case "sleep":
          enterMode("stretch", 1300);
          return;
        case "stretch":
        case "look":
        case "sniff":
          enterMode("idle", hold(600, 1300));
          return;
        case "groom":
          enterMode("sit", hold(1500, 3000));
          return;
        case "petted":
        case "joy":
          enterMode("sit", hold(2500, 4500));
          return;
        case "play":
          if (Math.random() < 0.6) {
            toy.velocity = motion.facing * randomBetween(90, 170);
          }

          enterMode("idle", hold(900, 1600));
          return;
        case "sit": {
          const roll = Math.random();

          if (roll < 0.3 && traits.grooms) {
            enterMode("groom", hold(2500, 4000));
          } else if (roll < 0.55) {
            enterMode("yawn", 1300);
          } else {
            enterMode("idle", hold(600, 1300));
          }

          return;
        }
        default:
          startIdleActivity();
      }
    }

    function celebrate() {
      if (calm) {
        enterMode("joy", hold(3500, 4500));
        return;
      }

      if (animal === "dog") {
        moveTo(motion.x < motion.width / 2 ? motion.width : 0, traits.runSpeed * 1.25, "zoom");
        return;
      }

      if (animal === "rabbit") {
        enterMode("joy", 1800);
        jump(22, 600, 16);
        motion.queuedJump = { start: performance.now() + 700, duration: 600, height: 22, twist: -16 };
        return;
      }

      enterMode("joy", hold(3500, 4500));
    }

    function pet() {
      const now = performance.now();

      if (motion.mode === "sleep") {
        motion.sleepPets += 1;
        motion.twitchUntil = now + 450;

        if (motion.sleepPets >= PETS_TO_WAKE) {
          showEmote("exclaim");
          enterMode("stretch", 1100);
        } else {
          showEmote("heart");
        }

        return;
      }

      motion.petTimes = [...motion.petTimes.filter((time) => now - time < PET_STREAK_MS), now];

      if (motion.petTimes.length >= PETS_FOR_JOY) {
        motion.petTimes = [];
        showEmote("hearts");
        celebrate();
        return;
      }

      showEmote(animal === "cat" ? "note" : "heart");
      motion.target = motion.x;
      enterMode("petted", hold(1800, 2400));

      if (animal === "rabbit") {
        jump(15, 520, Math.random() < 0.5 ? 12 : -12);
      } else if (animal === "dog") {
        jump(7, 300, 0);
      }
    }

    function toss() {
      if (calm) {
        return;
      }

      toy.velocity = (Math.random() < 0.5 ? -1 : 1) * randomBetween(200, 340);
      showEmote("exclaim");

      if (motion.mode === "sleep" || motion.mode === "yawn") {
        jump(8, 280, 0);
      }

      moveTo(motion.x, traits.runSpeed, "chase");
    }

    function chaseTarget() {
      const toyCenter = toy.x + TOY_SIZE / 2;
      const petCenter = motion.x + PET_WIDTH / 2;
      return toyCenter >= petCenter ? toy.x - PET_WIDTH + 18 : toy.x + TOY_SIZE - 18;
    }

    function arrive() {
      switch (motion.mode) {
        case "walk":
          enterMode("idle", hold(1000, 2800));
          return;
        case "zoom":
          enterMode("petted", hold(1800, 2600));
          return;
        case "chase":
          if (Math.abs(toy.velocity) < 40) {
            motion.facing = toy.x + TOY_SIZE / 2 > motion.x + PET_WIDTH / 2 ? 1 : -1;
            enterMode("play", hold(2200, 3200));
          }
      }
    }

    function move(elapsed: number) {
      const distance = motion.target - motion.x;

      if (Math.abs(distance) > 0.5) {
        motion.facing = distance > 0 ? 1 : -1;
      }

      let step = motion.speed * elapsed;

      if (traits.hops) {
        const { air, rest } = hopTiming(motion.mode);
        motion.hopClock += elapsed;
        const airborne = motion.hopClock % (air + rest) < air;
        step = airborne ? motion.speed * ((air + rest) / air) * elapsed : 0;
      }

      if (Math.abs(distance) <= Math.max(step, 0.5)) {
        motion.x = motion.target;
        arrive();
      } else {
        motion.x += Math.sign(distance) * step;
      }
    }

    function updateToy(elapsed: number) {
      if (toy.velocity === 0) {
        return;
      }

      toy.x += toy.velocity * elapsed;
      toy.spin += (toy.velocity * elapsed) / (TOY_SIZE / 2);

      const max = Math.max(EDGE_GAP, motion.width - TOY_SIZE - EDGE_GAP);

      if (toy.x < EDGE_GAP) {
        toy.x = EDGE_GAP;
        toy.velocity = Math.abs(toy.velocity) * 0.55;
      } else if (toy.x > max) {
        toy.x = max;
        toy.velocity = -Math.abs(toy.velocity) * 0.55;
      }

      const slowed = Math.abs(toy.velocity) - TOY_FRICTION * elapsed;
      toy.velocity = slowed <= 0 ? 0 : Math.sign(toy.velocity) * slowed;
    }

    function faceAttention(now: number) {
      if (motion.mode === "look") {
        motion.facing = Math.floor(now / (calm ? 2200 : 1100)) % 2 === 0 ? 1 : -1;
        return;
      }

      if (motion.mode === "play") {
        motion.facing = toy.x + TOY_SIZE / 2 > motion.x + PET_WIDTH / 2 ? 1 : -1;
        return;
      }

      if (ATTENTIVE_MODES.includes(motion.mode) && motion.pointerX !== null) {
        const offset = motion.pointerX - (motion.x + PET_WIDTH / 2);

        if (Math.abs(offset) > 24 && Math.abs(offset) < ATTENTION_RANGE) {
          motion.facing = offset > 0 ? 1 : -1;
        }
      }
    }

    function paintBody(now: number, lift: number) {
      const seconds = now / 1000;
      const parts = partsRef.current;
      const mode = motion.mode;
      const moving = MOVING_MODES.includes(mode);
      const airborne = lift > 0.5;
      const gaitRate = STEP_RATE * Math.min(2.4, motion.speed / traits.walkSpeed);
      const stride = !traits.hops && moving ? Math.sin(seconds * gaitRate) * 24 : 0;

      for (const leg of parts.legs) {
        let angle: number;

        if (airborne && (traits.hops || motion.jump)) {
          angle = leg.side === "front" ? -28 : 28;
        } else {
          angle = leg.group === "a" ? stride : -stride;
        }

        setTransform(leg.element, `rotate(${angle}deg)`);
      }

      let bodyX = 0;
      let bodyY = 0;
      let bodyScale = 1;

      if (!traits.hops && moving) {
        bodyY = -Math.abs(Math.sin(seconds * gaitRate)) * 1.8;
      } else if (mode === "sleep") {
        bodyScale = 1 + Math.sin(seconds * 1.3) * 0.025;
      } else {
        bodyY = Math.sin(seconds * 2.2) * 0.5;
      }

      if (animal === "cat" && (mode === "petted" || mode === "joy")) {
        bodyX = Math.sin(seconds * 80) * 0.35;
      }

      if (mode === "play" && animal !== "cat") {
        bodyY -= Math.abs(Math.sin(seconds * 7)) * 2.5;
      }

      setTransform(parts.body, `translate(${bodyX}px, ${bodyY}px) scaleY(${bodyScale})`);
      setTransform(parts.tail, tailTransform(animal, mode, seconds));
      setTransform(parts.head, headTransform(animal, mode, seconds));

      let ears = "";

      if (now < motion.twitchUntil) {
        ears = `rotate(${Math.sin(seconds * 40) * 12}deg)`;
      } else if (animal === "rabbit" && airborne) {
        ears = "rotate(-14deg)";
      } else if (animal === "rabbit" && mode === "sniff") {
        ears = `rotate(${Math.sin(seconds * 10) * 4}deg)`;
      }

      setTransform(parts.ears, ears);

      const blinking = (seconds + blinkSeed) % BLINK_EVERY_S < BLINK_S;
      setTransform(parts.eyes, blinking ? "scaleY(0.1)" : "");

      let paw = "";

      if (mode === "groom") {
        paw = `translateY(${Math.sin(seconds * 9) * 1.4}px)`;
      } else if (mode === "play" && animal === "cat") {
        paw = `rotate(${Math.sin(seconds * 11) * 30}deg)`;
      }

      setTransform(parts.paw, paw);
    }

    function paint(now: number) {
      setTransform(petRef.current, `translate3d(${motion.x}px, 0, 0)`);
      setTransform(flipRef.current, `scaleX(${motion.facing})`);
      setTransform(toyRef.current, `translate3d(${toy.x}px, 0, 0)`);
      setTransform(toySpinRef.current, `rotate(${toy.spin}rad)`);

      if (calm) {
        return;
      }

      let lift = 0;
      let twist = 0;
      let scaleX = 1;
      let scaleY = 1;

      if (motion.jump) {
        const progress = (now - motion.jump.start) / motion.jump.duration;

        if (progress >= 1) {
          motion.jump = null;
        } else {
          lift = Math.sin(progress * Math.PI) * motion.jump.height;
          twist = Math.sin(progress * Math.PI) * motion.jump.twist;
        }
      } else if (traits.hops && MOVING_MODES.includes(motion.mode)) {
        const { air, rest, height } = hopTiming(motion.mode);
        const phase = motion.hopClock % (air + rest);

        if (phase < air) {
          lift = Math.sin((phase / air) * Math.PI) * height;
          scaleX = 0.97;
          scaleY = 1.04;
        } else if (phase - air < 0.07) {
          scaleX = 1.08;
          scaleY = 0.9;
        }
      }

      setTransform(hopRef.current, `translateY(${-lift}px) rotate(${twist}deg) scale(${scaleX}, ${scaleY})`);
      paintBody(now, lift);
    }

    function tick(now: number) {
      const elapsed = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (motion.ready) {
        updateToy(elapsed);

        if (motion.queuedJump && now >= motion.queuedJump.start) {
          motion.jump = { ...motion.queuedJump, start: now };
          motion.queuedJump = null;
        }

        if (motion.mode === "chase") {
          motion.target = clampX(chaseTarget(), motion.width);
        }

        if (MOVING_MODES.includes(motion.mode)) {
          move(elapsed);
        } else if (now >= motion.until) {
          decide();
        }

        faceAttention(now);
        paint(now);
      }

      frame = requestAnimationFrame(tick);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = layer!.getBoundingClientRect();
      const nearby = event.clientY > rect.top - ATTENTION_RANGE && event.clientY < rect.bottom + 20;
      motion.pointerX = nearby ? event.clientX - rect.left : null;
    }

    function handlePointerOut(event: PointerEvent) {
      if (!event.relatedTarget) {
        motion.pointerX = null;
      }
    }

    const observer = new ResizeObserver(([entry]) => {
      motion.width = entry.contentRect.width;

      if (!motion.ready) {
        motion.ready = true;
        motion.x = clampX(randomBetween(0.2, 0.8) * motion.width, motion.width);
        motion.target = motion.x;
        motion.facing = Math.random() < 0.5 ? 1 : -1;
        toy.x = clampX(randomBetween(0.1, 0.9) * motion.width, motion.width, TOY_SIZE);
        enterMode(calm ? "sit" : "idle", hold(800, 1600));
        setIsVisible(true);
      } else {
        motion.x = clampX(motion.x, motion.width);
        motion.target = clampX(motion.target, motion.width);
        toy.x = clampX(toy.x, motion.width, TOY_SIZE);
      }
    });

    controllerRef.current = { pet, toss };
    observer.observe(layer);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerout", handlePointerOut);
    frame = requestAnimationFrame(tick);

    return () => {
      controllerRef.current = null;
      cancelAnimationFrame(frame);
      clearTimeout(emoteTimer);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, [animal]);

  const petName = palette.name.toLowerCase();

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 select-none">
      {!isCalm && (
        <div
          ref={toyRef}
          className={cn("absolute bottom-[11px] left-0 transition-opacity duration-500", isVisible ? "opacity-100" : "opacity-0")}
          style={{ width: TOY_SIZE, height: TOY_SIZE }}
        >
          <button
            type="button"
            onClick={() => controllerRef.current?.toss()}
            aria-label={`Toss the ${species.toyName} for your ${petName}`}
            className="pointer-events-auto block size-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
          >
            <span ref={toySpinRef} className="block size-full">
              <PetToy animal={animal} />
            </span>
          </button>
        </div>
      )}

      <div
        ref={petRef}
        className={cn("absolute bottom-2 left-0 transition-opacity duration-500", isVisible ? "opacity-100" : "opacity-0")}
        style={{ width: PET_WIDTH }}
      >
        {emote && (
          <span key={emote.id} ref={animateEmote} className="pointer-events-none absolute bottom-[86%] left-1/2 origin-bottom opacity-0">
            <EmoteBubble type={emote.type} />
          </span>
        )}

        {pose === "sleep" && !emote && (
          <span aria-hidden="true" className="pointer-events-none absolute top-3 left-[58%] font-display text-sm font-semibold text-ink-faint">
            z<span className="ml-0.5 text-[11px]">z</span>
          </span>
        )}

        <span className="sr-only" aria-live="polite">
          {emote ? `Your ${petName} looks happy.` : ""}
        </span>

        <button
          type="button"
          onClick={() => controllerRef.current?.pet()}
          aria-label={`Pet your ${petName}`}
          className="pointer-events-auto block w-full cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
        >
          <div ref={hopRef} style={{ transformOrigin: "50% 100%" }}>
            <div ref={flipRef}>
              <PetSprite ref={spriteRef} animal={animal} palette={palette} pose={pose} expression={expression} className="block h-auto w-full" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}