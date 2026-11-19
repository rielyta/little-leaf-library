import { parseAvatar } from "@/lib/avatars";

const INK = "#5A4636";
const EYE = "#3F3128";
const BLUSH = "#F2B8C6";

type AvatarProps = {
  value?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ value, size = 44, className }: AvatarProps) {
  const { animal, palette } = parseAvatar(value);
  const { fur, inner, patch, background } = palette;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={`${palette.name} avatar`}>
      <circle cx="50" cy="50" r="48" fill={background} stroke={INK} strokeWidth="2" />

      {animal === "cat" && (
        <>
          <path d="M23 44L27 15l20 17z" fill={fur} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M77 44L73 15 53 32z" fill={fur} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M29 36l2-13 10 8z" fill={inner} />
          <path d="M71 36l-2-13-10 8z" fill={inner} />
          <ellipse cx="50" cy="58" rx="31" ry="26" fill={fur} stroke={INK} strokeWidth="2.2" />
          <path d="M44 34v7M50 33v8M56 34v7" stroke={patch} strokeWidth="3.4" strokeLinecap="round" />
          <Eyes y={56} />
          <ellipse cx="31" cy="66" rx="5.5" ry="3.2" fill={BLUSH} />
          <ellipse cx="69" cy="66" rx="5.5" ry="3.2" fill={BLUSH} />
          <path d="M47 63h6l-3 3.4z" fill="#E79AAE" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M50 66.5q-2.5 4-6 2M50 66.5q2.5 4 6 2" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M22 60l9 2M22 67l9-1M78 60l-9 2M78 67l-9-1" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}

      {animal === "dog" && (
        <>
          <ellipse cx="50" cy="54" rx="28" ry="27" fill={fur} stroke={INK} strokeWidth="2.2" />
          <ellipse cx="62" cy="47" rx="9" ry="8" fill={patch} />
          <ellipse cx="23" cy="48" rx="10" ry="19" fill={patch} stroke={INK} strokeWidth="2.2" transform="rotate(18 23 48)" />
          <ellipse cx="77" cy="48" rx="10" ry="19" fill={patch} stroke={INK} strokeWidth="2.2" transform="rotate(-18 77 48)" />
          <Eyes y={50} />
          <ellipse cx="50" cy="66" rx="14" ry="10.5" fill={inner} stroke={INK} strokeWidth="1.8" />
          <ellipse cx="50" cy="61" rx="5.5" ry="3.8" fill={EYE} />
          <path d="M50 64.5v3.5M50 68q-3 3-6 1M50 68q3 3 6 1" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M47.5 70.5h5v3.5a2.5 2.5 0 0 1-5 0z" fill="#F2A0B4" stroke={INK} strokeWidth="1.2" />
          <ellipse cx="31" cy="62" rx="5" ry="3" fill={BLUSH} />
          <ellipse cx="69" cy="62" rx="5" ry="3" fill={BLUSH} />
        </>
      )}

      {animal === "rabbit" && (
        <>
          <ellipse cx="38" cy="25" rx="8.5" ry="21" fill={fur} stroke={INK} strokeWidth="2.2" transform="rotate(-8 38 25)" />
          <ellipse cx="62" cy="25" rx="8.5" ry="21" fill={fur} stroke={INK} strokeWidth="2.2" transform="rotate(8 62 25)" />
          <ellipse cx="38" cy="26" rx="4" ry="14" fill={inner} transform="rotate(-8 38 26)" />
          <ellipse cx="62" cy="26" rx="4" ry="14" fill={inner} transform="rotate(8 62 26)" />
          <ellipse cx="50" cy="61" rx="28" ry="24" fill={fur} stroke={INK} strokeWidth="2.2" />
          <Eyes y={58} />
          <ellipse cx="32" cy="67" rx="5" ry="3" fill={BLUSH} />
          <ellipse cx="68" cy="67" rx="5" ry="3" fill={BLUSH} />
          <ellipse cx="50" cy="64" rx="3.4" ry="2.4" fill="#E79AAE" stroke={INK} strokeWidth="1.2" />
          <path d="M50 66.5v2.5M50 69q-2.5 2.5-5 1M50 69q2.5 2.5 5 1" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="47" y="70.5" width="6" height="5" rx="1.2" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
          <path d="M50 70.5v5" stroke={INK} strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

function Eyes({ y }: { y: number }) {
  return (
    <>
      <circle cx="39" cy={y} r="3.4" fill={EYE} />
      <circle cx="61" cy={y} r="3.4" fill={EYE} />
      <circle cx="40.2" cy={y - 1.2} r="1" fill="#FFFFFF" />
      <circle cx="62.2" cy={y - 1.2} r="1" fill="#FFFFFF" />
    </>
  );
}