import { PetToy } from "@/components/library/PetExtras";
import { PetSprite } from "@/components/library/PetSprite";
import { parseAvatar } from "@/lib/avatars";

export type TourArtKind = "welcome" | "bookcase" | "upload" | "reading" | "notes" | "pet" | "sprout";

const LINE = "#5A4636";
const PAPER = "#FFFDF8";

function Bookcase() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-auto" aria-hidden="true">
      <rect x="40" y="14" width="80" height="16" rx="6" fill="#D9B99B" stroke={LINE} strokeWidth="1.6" />
      <rect x="58" y="18" width="44" height="8" rx="3" fill={PAPER} stroke={LINE} strokeWidth="1.2" />
      <rect x="40" y="28" width="80" height="80" fill="#C49A76" stroke={LINE} strokeWidth="1.6" />
      <rect x="46" y="34" width="68" height="30" rx="2" fill="#EAD7C3" stroke={LINE} strokeWidth="1.2" />
      <rect x="46" y="70" width="68" height="30" rx="2" fill="#EAD7C3" stroke={LINE} strokeWidth="1.2" />
      <g stroke={LINE} strokeWidth="1.2">
        <rect x="50" y="38" width="8" height="26" rx="1.5" fill="#F2B8C6" />
        <rect x="60" y="41" width="10" height="23" rx="1.5" fill="#A9CCD8" />
        <rect x="72" y="37" width="7" height="27" rx="1.5" fill="#BFD8C2" />
        <rect x="81" y="43" width="9" height="21" rx="1.5" fill="#F3E3C3" />
        <rect x="50" y="76" width="9" height="24" rx="1.5" fill="#E9C6D9" />
        <rect x="61" y="73" width="7" height="27" rx="1.5" fill="#9CC5A1" />
      </g>
      <rect x="46" y="108" width="8" height="6" rx="2" fill="#C49A76" stroke={LINE} strokeWidth="1.2" />
      <rect x="106" y="108" width="8" height="6" rx="2" fill="#C49A76" stroke={LINE} strokeWidth="1.2" />
    </svg>
  );
}

function Upload() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-auto" aria-hidden="true">
      <path d="M62 10h28l14 14v44H62z" fill={PAPER} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M90 10v14h14" fill="none" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <text x="83" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#C97A8E">
        PDF
      </text>
      <path d="M83 74v16M76 83l7 7 7-7" fill="none" stroke="#5E8C6A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <g stroke={LINE} strokeWidth="1.2">
        <rect x="46" y="96" width="8" height="12" rx="1.5" fill="#A9CCD8" />
        <rect x="56" y="98" width="10" height="10" rx="1.5" fill="#F3E3C3" />
        <rect x="78" y="94" width="10" height="14" rx="1.5" fill="#F2B8C6" />
        <rect x="102" y="97" width="8" height="11" rx="1.5" fill="#BFD8C2" />
      </g>
      <rect x="38" y="108" width="88" height="7" rx="2" fill="#D9B99B" stroke={LINE} strokeWidth="1.4" />
    </svg>
  );
}

function Reading() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-auto" aria-hidden="true">
      <path d="M80 30C66 22 44 20 26 24v66c18-4 40-2 54 6z" fill={PAPER} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M80 30c14-8 36-10 54-6v66c-18-4-40-2-54 6z" fill={PAPER} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M36 40h34M36 48h30M36 56h34M36 64h26M90 40h34M90 48h30M90 56h34M90 64h22" stroke="#D8CBBB" strokeWidth="2" strokeLinecap="round" />
      <path d="M112 24v26l5-4 5 4V24" fill="#F2B8C6" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M134 76l-16 14h16z" fill="#EAD7C3" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function Notes() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-auto" aria-hidden="true">
      <rect x="8" y="18" width="78" height="92" rx="8" fill={PAPER} stroke={LINE} strokeWidth="1.6" />
      <rect x="16" y="31" width="50" height="9" rx="2" fill="#FBE3A0" />
      <rect x="16" y="63" width="36" height="9" rx="2" fill="#F2B8C6" opacity="0.85" />
      <path d="M18 35.5h46M18 51.5h54M18 67.5h32M18 83.5h48M18 99.5h38" stroke="#B8A898" strokeWidth="2" strokeLinecap="round" />
      <rect x="70" y="60" width="14" height="14" rx="4" fill="#FBE3A0" stroke={LINE} strokeWidth="1.3" />
      <path d="M73.5 65.5h7M73.5 69h5" stroke={LINE} strokeWidth="1" strokeLinecap="round" />
      <rect x="84" y="10" width="72" height="28" rx="9" fill="#FFFFFF" stroke={LINE} strokeWidth="1.4" />
      <path d="M94 37.5l-4 9 11-9" fill="#FFFFFF" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <text
        x="120"
        y="27.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#5E8C6A"
        textLength="58"
        lengthAdjust="spacingAndGlyphs"
      >
        cozy → nyaman
      </text>
    </svg>
  );
}

function Sprout() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-auto" aria-hidden="true">
      <path d="M80 82c0-14 0-24 0-36" stroke="#5E8C6A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="69" cy="52" rx="12" ry="6" transform="rotate(-30 69 52)" fill="#BFD8C2" stroke={LINE} strokeWidth="1.4" />
      <ellipse cx="91" cy="42" rx="13" ry="6.5" transform="rotate(30 91 42)" fill="#9CC5A1" stroke={LINE} strokeWidth="1.4" />
      <rect x="62" y="80" width="36" height="8" rx="3" fill="#F3E3C3" stroke={LINE} strokeWidth="1.4" />
      <path d="M66 88h28l-4 22H70z" fill="#F2B8C6" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M122 26l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FBE3A0" stroke={LINE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M40 40l1.5 4.5 4.5 1.5-4.5 1.5L40 52l-1.5-4.5L34 46l4.5-1.5z" fill="#FBE3A0" stroke={LINE} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function TourArt({ kind, avatar }: { kind: TourArtKind; avatar: string }) {
  const { animal, palette } = parseAvatar(avatar);

  switch (kind) {
    case "welcome":
      return <PetSprite animal={animal} palette={palette} pose="sit" expression="happy" className="h-full w-auto" />;
    case "pet":
      return (
        <div className="flex h-full items-end gap-3 pb-2">
          <PetSprite animal={animal} palette={palette} pose="stand" expression="happy" className="h-[85%] w-auto" />
          <span className="mb-1 block size-7">
            <PetToy animal={animal} />
          </span>
        </div>
      );
    case "bookcase":
      return <Bookcase />;
    case "upload":
      return <Upload />;
    case "reading":
      return <Reading />;
    case "notes":
      return <Notes />;
    default:
      return <Sprout />;
  }
}