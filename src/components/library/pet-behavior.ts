import type { PetExpression, PetPose } from "@/components/library/PetSprite";
import type { AvatarAnimal } from "@/lib/avatars";

export const PET_WIDTH = 84;
export const TOY_SIZE = 22;
export const EDGE_GAP = 16;
export const MIN_WALK_DISTANCE = 80;
export const STEP_RATE = 9;
export const EMOTE_MS = 1500;
export const PET_STREAK_MS = 2600;
export const PETS_FOR_JOY = 3;
export const PETS_TO_WAKE = 3;
export const TOY_FRICTION = 240;
export const ATTENTION_RANGE = 240;
export const BLINK_EVERY_S = 3.8;
export const BLINK_S = 0.13;

export type Mode =
  | "idle"
  | "walk"
  | "sit"
  | "groom"
  | "look"
  | "sniff"
  | "yawn"
  | "sleep"
  | "stretch"
  | "petted"
  | "joy"
  | "zoom"
  | "chase"
  | "play";

export type Emote = "heart" | "hearts" | "note" | "exclaim";

export type Species = {
  walkSpeed: number;
  runSpeed: number;
  hops: boolean;
  grooms: boolean;
  toyName: string;
  idleChoices: [Mode, number][];
};

export const CAT: Species = {
  walkSpeed: 36,
  runSpeed: 120,
  hops: false,
  grooms: true,
  toyName: "yarn ball",
  idleChoices: [
    ["walk", 0.42],
    ["sit", 0.2],
    ["groom", 0.12],
    ["look", 0.1],
    ["sleep", 0.1],
    ["sniff", 0.06],
  ],
};

const SPECIES: Partial<Record<AvatarAnimal, Species>> = {
  cat: CAT,
  dog: {
    walkSpeed: 44,
    runSpeed: 140,
    hops: false,
    grooms: false,
    toyName: "tennis ball",
    idleChoices: [
      ["walk", 0.48],
      ["sit", 0.18],
      ["sniff", 0.14],
      ["look", 0.1],
      ["sleep", 0.1],
    ],
  },
  rabbit: {
    walkSpeed: 46,
    runSpeed: 120,
    hops: true,
    grooms: true,
    toyName: "little ball",
    idleChoices: [
      ["walk", 0.44],
      ["sit", 0.18],
      ["sniff", 0.14],
      ["groom", 0.12],
      ["sleep", 0.12],
    ],
  },
};

export const MOVING_MODES: Mode[] = ["walk", "zoom", "chase"];
export const ATTENTIVE_MODES: Mode[] = ["idle", "sit", "petted", "joy"];
const HAPPY_MODES: Mode[] = ["petted", "joy", "zoom", "play"];

export function speciesFor(animal: AvatarAnimal) {
  return SPECIES[animal] ?? CAT;
}

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function clampX(x: number, width: number, size = PET_WIDTH) {
  return Math.min(Math.max(x, EDGE_GAP), Math.max(EDGE_GAP, width - size - EDGE_GAP));
}

export function weightedPick(choices: [Mode, number][]): Mode {
  const total = choices.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;

  for (const [mode, weight] of choices) {
    roll -= weight;

    if (roll <= 0) {
      return mode;
    }
  }

  return choices[0][0];
}

export function hopTiming(mode: Mode) {
  return mode === "walk" ? { air: 0.36, rest: 0.2, height: 7 } : { air: 0.28, rest: 0.08, height: 10 };
}

export function poseFor(mode: Mode, animal: AvatarAnimal): PetPose {
  switch (mode) {
    case "sit":
    case "petted":
    case "yawn":
      return "sit";
    case "joy":
      return animal === "cat" ? "sit" : "stand";
    case "groom":
      return "groom";
    case "sleep":
      return "sleep";
    case "stretch":
      return "stretch";
    case "play":
      if (animal === "cat") {
        return "bat";
      }

      return animal === "dog" ? "stretch" : "stand";
    default:
      return "stand";
  }
}

export function expressionFor(mode: Mode): PetExpression {
  switch (mode) {
    case "sleep":
    case "stretch":
      return "sleepy";
    case "yawn":
      return "yawn";
    case "groom":
      return "licking";
    case "petted":
    case "joy":
    case "zoom":
    case "play":
      return "happy";
    default:
      return "neutral";
  }
}

export function tailTransform(animal: AvatarAnimal, mode: Mode, seconds: number) {
  const happy = HAPPY_MODES.includes(mode);

  if (animal === "rabbit") {
    return happy ? `translateX(${Math.sin(seconds * 26) * 1.2}px)` : "";
  }

  let angle: number;

  if (animal === "dog") {
    if (happy) {
      angle = Math.sin(seconds * 24) * 24;
    } else if (MOVING_MODES.includes(mode)) {
      angle = Math.sin(seconds * 12) * 12;
    } else {
      angle = mode === "sleep" ? 0 : Math.sin(seconds * 3) * 6;
    }

    return `rotate(${angle}deg)`;
  }

  switch (mode) {
    case "petted":
    case "joy":
      angle = Math.sin(seconds * 2) * 8 - 12;
      break;
    case "walk":
    case "chase":
    case "zoom":
      angle = Math.sin(seconds * 7) * 7;
      break;
    case "sleep":
      angle = Math.sin(seconds * 1.2) * 2;
      break;
    case "stretch":
      angle = -10;
      break;
    case "play":
      angle = Math.sin(seconds * 16) * 9;
      break;
    case "sit":
    case "groom": {
      const flick = Math.sin(seconds * 0.9) > 0.85 ? Math.sin(seconds * 14) * 10 : 0;
      angle = Math.sin(seconds * 2.5) * 4 + flick;
      break;
    }
    default:
      angle = Math.sin(seconds * 3) * 5;
  }

  return `rotate(${angle}deg)`;
}

export function headTransform(animal: AvatarAnimal, mode: Mode, seconds: number) {
  switch (mode) {
    case "groom":
      return `rotate(${Math.sin(seconds * 9) * 3}deg)`;
    case "sniff":
      return `translateY(${2.5 + Math.sin(seconds * 14) * 0.6}px)`;
    case "look":
      return `rotate(${Math.sin(seconds * 1.6) * 7}deg)`;
    case "petted":
    case "joy":
      return `rotate(${Math.sin(seconds * 3) * 4}deg)`;
    case "play":
      return animal === "cat" ? "" : `rotate(${Math.sin(seconds * 7) * 5}deg)`;
    default:
      return "";
  }
}