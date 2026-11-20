import type { CSSProperties, Ref } from "react";
import type { AvatarAnimal, AvatarPalette } from "@/lib/avatars";

export type PetPose = "stand" | "sit" | "groom" | "sleep" | "stretch";

const LINE = "#6B4A3A";
const EYE = "#3F3128";
const BLUSH = "#F4B9C7";
const NOSE = "#E79AAE";
const CREAM = "#FFFDF8";
const SHADOW = "#A9CCD8";

const STROKE = 1.6;

type Layout = {
  body: { cx: number; cy: number; rx: number; ry: number; tilt: number };
  head: { x: number; y: number };
  tail: { x: number; y: number };
};

const LAYOUT: Record<PetPose, Layout> = {
  stand: { body: { cx: 40, cy: 54, rx: 17, ry: 12.5, tilt: 0 }, head: { x: 0, y: 0 }, tail: { x: 0, y: 0 } },
  sit: { body: { cx: 40, cy: 53, rx: 15.5, ry: 14, tilt: 0 }, head: { x: -2, y: -1 }, tail: { x: 2, y: 4 } },
  groom: { body: { cx: 40, cy: 53, rx: 15.5, ry: 14, tilt: 0 }, head: { x: -3, y: 0 }, tail: { x: 2, y: 4 } },
  sleep: { body: { cx: 40, cy: 59, rx: 22, ry: 9.5, tilt: 0 }, head: { x: -1, y: 13 }, tail: { x: -2, y: 6 } },
  stretch: { body: { cx: 40, cy: 55, rx: 18, ry: 10, tilt: 14 }, head: { x: 7, y: 13 }, tail: { x: 1, y: -6 } },
};

const STAND_FEET = [
  { x: 26, group: "a" },
  { x: 33.5, group: "b" },
  { x: 41, group: "a" },
  { x: 48.5, group: "b" },
] as const;

const FOOT_STYLE: CSSProperties = { transformBox: "fill-box", transformOrigin: "50% 0" };

type PetSpriteProps = {
  ref?: Ref<SVGSVGElement>;
  animal: AvatarAnimal;
  palette: AvatarPalette;
  pose: PetPose;
  className?: string;
};

function Ears({ animal, palette }: { animal: AvatarAnimal; palette: AvatarPalette }) {
  const { fur, inner } = palette;

  if (animal === "cat") {
    return (
      <>
        <path d="M30.5 25L31.5 11.5l10.5 7.5z" fill={fur} stroke={LINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <path d="M61.5 25L60.5 11.5 50 19z" fill={fur} stroke={LINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <path d="M33 21.5l.6-6.5 5 3.6z" fill={inner} />
        <path d="M59 21.5l-.6-6.5-5 3.6z" fill={inner} />
      </>
    );
  }

  if (animal === "rabbit") {
    return (
      <>
        <ellipse cx="39" cy="11" rx="4.6" ry="11" transform="rotate(-10 39 11)" fill={fur} stroke={LINE} strokeWidth={STROKE} />
        <ellipse cx="53" cy="11" rx="4.6" ry="11" transform="rotate(10 53 11)" fill={fur} stroke={LINE} strokeWidth={STROKE} />
        <ellipse cx="39" cy="12.5" rx="2" ry="7.5" transform="rotate(-10 39 12.5)" fill={inner} />
        <ellipse cx="53" cy="12.5" rx="2" ry="7.5" transform="rotate(10 53 12.5)" fill={inner} />
      </>
    );
  }

  return null;
}

function Head({ animal, palette, eyesClosed, licking }: { animal: AvatarAnimal; palette: AvatarPalette; eyesClosed: boolean; licking: boolean }) {
  const { fur, patch } = palette;

  return (
    <>
      <Ears animal={animal} palette={palette} />

      <ellipse cx="46" cy="32" rx="19" ry="16.5" fill={fur} stroke={LINE} strokeWidth={STROKE} />
      <ellipse cx="46.5" cy="39.5" rx="11.5" ry="7.5" fill={CREAM} />

      {animal === "cat" && <path d="M42 17.5v5M46 16.5v6M50 17.5v5" stroke={patch} strokeWidth="2.6" strokeLinecap="round" />}

      {animal === "dog" && (
        <>
          <ellipse cx="29.5" cy="31" rx="5" ry="9.5" transform="rotate(16 29.5 31)" fill={patch} stroke={LINE} strokeWidth={STROKE} />
          <ellipse cx="62.5" cy="31" rx="5" ry="9.5" transform="rotate(-16 62.5 31)" fill={patch} stroke={LINE} strokeWidth={STROKE} />
          <ellipse cx="53" cy="27" rx="4.5" ry="4" fill={patch} opacity="0.8" />
        </>
      )}

      {eyesClosed ? (
        <path d="M37.5 32.5q2.4 2 4.8 0M50.2 32.5q2.4 2 4.8 0" stroke={EYE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="40" cy="32" r="2.4" fill={EYE} />
          <circle cx="52.5" cy="32" r="2.4" fill={EYE} />
          <circle cx="40.8" cy="31.2" r="0.7" fill="#FFFFFF" />
          <circle cx="53.3" cy="31.2" r="0.7" fill="#FFFFFF" />
        </>
      )}

      <ellipse cx="35.5" cy="37.5" rx="3.4" ry="2.1" fill={BLUSH} opacity="0.85" />
      <ellipse cx="57" cy="37.5" rx="3.4" ry="2.1" fill={BLUSH} opacity="0.85" />

      {animal === "dog" ? (
        <ellipse cx="46.3" cy="35.6" rx="2.2" ry="1.6" fill={EYE} />
      ) : (
        <ellipse cx="46.3" cy="35.4" rx="1.3" ry="0.95" fill={NOSE} />
      )}
      <path d="M43.8 37q1.25 1.5 2.5 0q1.25 1.5 2.5 0" stroke={LINE} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {licking && <ellipse cx="49.5" cy="39.4" rx="1.4" ry="1.1" fill={NOSE} />}

      {animal === "cat" && (
        <path d="M28 34.5l-7.5-1.2M28 37.5l-7.2 1.6M64.5 34.5l7.5-1.2M64.5 37.5l7.2 1.6" stroke={LINE} strokeWidth="1" strokeLinecap="round" />
      )}
    </>
  );
}

function Tail({ animal, palette }: { animal: AvatarAnimal; palette: AvatarPalette }) {
  if (animal === "rabbit") {
    return (
      <g data-part="tail" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}>
        <circle cx="23" cy="53" r="5" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
      </g>
    );
  }

  const path = animal === "cat" ? "M27 59C15 61 9 53 13 45" : "M26 50C21 47 19 43 20 38";

  return (
    <g data-part="tail" style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}>
      <path d={path} stroke={LINE} strokeWidth="7.4" strokeLinecap="round" fill="none" />
      <path d={path} stroke={animal === "dog" ? palette.patch : palette.fur} strokeWidth="4.4" strokeLinecap="round" fill="none" />
      {animal === "cat" && <path d={path} stroke={palette.patch} strokeWidth="4.4" strokeDasharray="2 3.2" fill="none" />}
    </g>
  );
}

function BodyMarkings({ animal, palette, layout, lying }: { animal: AvatarAnimal; palette: AvatarPalette; layout: Layout; lying: boolean }) {
  const { cx, cy, tilt } = layout.body;

  return (
    <g transform={`rotate(${tilt} ${cx} ${cy}) translate(${cx - 40} ${cy - 54})`}>
      <ellipse cx="45" cy={lying ? 56 : 57} rx="8.5" ry={lying ? 5 : 8} fill={CREAM} />
      {animal === "cat" && (
        <path d="M27.5 49.5q3 .8 4.4 3.6M26 55q3 .6 4.2 3.2M31 45q2.6 1.4 3.4 4" stroke={palette.patch} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      )}
      {animal === "dog" && <ellipse cx="31" cy="50" rx="6.5" ry="5" fill={palette.patch} />}
    </g>
  );
}

export function PetSprite({ ref, animal, palette, pose, className }: PetSpriteProps) {
  const layout = LAYOUT[pose];
  const { fur } = palette;
  const isSeated = pose === "sit" || pose === "groom";
  const { cx, cy, rx, ry, tilt } = layout.body;

  return (
    <svg ref={ref} viewBox="0 0 80 72" className={className} aria-hidden="true">
      <ellipse cx="40" cy="68.5" rx="23" ry="3" fill={SHADOW} opacity="0.45" />

      {pose === "stand" &&
        STAND_FEET.map((foot) => (
          <rect
            key={foot.x}
            data-leg={foot.group}
            x={foot.x}
            y="58"
            width="7"
            height="10"
            rx="3.5"
            fill={fur}
            stroke={LINE}
            strokeWidth={STROKE}
            style={FOOT_STYLE}
          />
        ))}

      {pose === "stretch" && (
        <>
          <rect x="25" y="54" width="7" height="14" rx="3.5" fill={fur} stroke={LINE} strokeWidth={STROKE} />
          <rect x="32" y="54" width="7" height="14" rx="3.5" fill={fur} stroke={LINE} strokeWidth={STROKE} />
        </>
      )}

      <g data-part="body" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <g transform={`translate(${layout.tail.x} ${layout.tail.y})`}>
          <Tail animal={animal} palette={palette} />
        </g>

        {isSeated && <ellipse cx="29" cy="61" rx="8.5" ry="6.5" fill={fur} stroke={LINE} strokeWidth={STROKE} />}

        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${tilt} ${cx} ${cy})`} fill={fur} stroke={LINE} strokeWidth={STROKE} />

        <BodyMarkings animal={animal} palette={palette} layout={layout} lying={pose === "sleep" || pose === "stretch"} />

        {pose === "sit" && (
          <>
            <rect x="36" y="60" width="6.5" height="8" rx="3.25" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
            <rect x="43.5" y="60" width="6.5" height="8" rx="3.25" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
            <path d="M39.25 65.5v2M46.75 65.5v2" stroke={LINE} strokeWidth="0.9" strokeLinecap="round" />
          </>
        )}

        {pose === "groom" && (
          <>
            <rect x="36" y="60" width="6.5" height="8" rx="3.25" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
            <path d="M39.25 65.5v2" stroke={LINE} strokeWidth="0.9" strokeLinecap="round" />
          </>
        )}

        {pose === "sleep" && <ellipse cx="51" cy="66" rx="5.5" ry="2.6" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />}

        {pose === "stretch" && (
          <>
            <ellipse cx="56" cy="66" rx="7.5" ry="2.8" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
            <ellipse cx="63" cy="67" rx="6.5" ry="2.5" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
          </>
        )}

        <g transform={`translate(${layout.head.x} ${layout.head.y})`}>
          <g data-part="head" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
            <Head animal={animal} palette={palette} eyesClosed={pose === "sleep" || pose === "groom"} licking={pose === "groom"} />
          </g>
        </g>

        {pose === "groom" && (
          <g data-part="paw">
            <ellipse cx="49" cy="43" rx="3.6" ry="5.2" transform="rotate(-18 49 43)" fill={CREAM} stroke={LINE} strokeWidth={STROKE} />
          </g>
        )}
      </g>
    </svg>
  );
}