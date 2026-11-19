const INK = "#5A4636";

export function WindowIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 520"
      className={className}
      role="img"
      aria-label="A window with curtains, a cloudy blue sky, a flower vase and a stack of books on the sill"
    >
      <rect x="0" y="380" width="560" height="140" fill="#CFE3EA" />
      <path d="M0 380h560" stroke="#FBF6EE" strokeWidth="10" />

      <path d="M130 360V150a150 150 0 0 1 300 0v210z" fill="#DCEAF0" stroke={INK} strokeWidth="1.8" />
      <g fill="#FFFFFF">
        <ellipse cx="220" cy="190" rx="54" ry="20" />
        <ellipse cx="250" cy="176" rx="34" ry="20" />
        <ellipse cx="360" cy="268" rx="60" ry="18" />
        <ellipse cx="334" cy="256" rx="30" ry="18" />
        <ellipse cx="200" cy="310" rx="44" ry="14" />
      </g>
      <path d="M300 110l8 4M316 98l7 4" stroke="#8FB0BC" strokeWidth="2" strokeLinecap="round" />
      <path d="M280 2v358M130 250h300" stroke="#F2B8C6" strokeWidth="8" />
      <path d="M130 360V150a150 150 0 0 1 300 0v210z" fill="none" stroke="#F2B8C6" strokeWidth="10" />

      <path d="M96 20h64c-10 110-14 230 6 340H96z" fill="#FFFDF8" stroke={INK} strokeWidth="1.6" />
      <path d="M112 40c-4 100-2 210 8 316M136 40c-4 100-4 210 10 316" stroke="#EFE3D3" strokeWidth="2" />
      <path d="M464 20h-64c10 110 14 230-6 340h70z" fill="#FFFDF8" stroke={INK} strokeWidth="1.6" />
      <path d="M448 40c4 100 2 210-8 316M424 40c4 100 4 210-10 316" stroke="#EFE3D3" strokeWidth="2" />
      <rect x="86" y="10" width="388" height="12" rx="6" fill="#C9A27E" stroke={INK} strokeWidth="1.6" />

      <rect x="110" y="356" width="340" height="18" rx="6" fill="#FBF6EE" stroke={INK} strokeWidth="1.6" />
      <g stroke={INK} strokeWidth="1.4">
        <rect x="150" y="326" width="86" height="14" rx="3" fill="#A9CCD8" />
        <rect x="156" y="340" width="96" height="16" rx="3" fill="#F2B8C6" />
        <rect x="160" y="312" width="70" height="14" rx="3" fill="#BFD8C2" />
      </g>

      <path d="M330 356c-6-10-8-26-2-40h40c6 14 4 30-2 40z" fill="#EEF5F8" stroke={INK} strokeWidth="1.4" />
      <path
        d="M348 316c-4-20-14-34-28-42M350 316c2-24 12-40 26-46M348 316c0-26-4-40-2-56"
        stroke="#5E8C6A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke={INK} strokeWidth="1.4">
        <circle cx="318" cy="270" r="13" fill="#F6C9D3" />
        <circle cx="378" cy="266" r="12" fill="#FFFDF8" />
        <circle cx="346" cy="252" r="11" fill="#F2B8C6" />
      </g>
      <circle cx="318" cy="270" r="4" fill="#EBB4C0" />
      <circle cx="378" cy="266" r="3.5" fill="#F3E3C3" />
      <circle cx="346" cy="252" r="3.5" fill="#FBF6EE" />

      <path d="M396 354h34v-14c0-8-6-12-17-12s-17 4-17 12z" fill="#FFFDF8" stroke={INK} strokeWidth="1.4" />
      <path d="M430 340c8 0 10 8 2 10" stroke={INK} strokeWidth="1.4" fill="none" />
      <path d="M408 322c-2-6 2-10 0-14M418 322c-2-6 2-10 0-14" stroke="#C9A27E" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      <path
        d="M470 40c-10 30-6 60 4 90M474 70c10-4 18 0 22 6M472 100c-10-2-16 2-20 8"
        stroke="#5E8C6A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke={INK} strokeWidth="1.2">
        <ellipse cx="496" cy="78" rx="8" ry="4.5" fill="#9CC5A1" />
        <ellipse cx="450" cy="108" rx="8" ry="4.5" fill="#BFD8C2" />
        <ellipse cx="480" cy="140" rx="7" ry="4" fill="#9CC5A1" />
      </g>
    </svg>
  );
}