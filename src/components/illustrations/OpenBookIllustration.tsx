const INK = "#5A4636";
const LINE = "#D8CBBB";

export function OpenBookIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 330"
      className={className}
      role="img"
      aria-label="An open book with a ribbon bookmark, highlighted lines and a small sticky note"
    >
      <ellipse cx="240" cy="306" rx="210" ry="16" fill="#EFE3D3" />
      <path
        d="M30 60c70-14 140-10 210 18 70-28 140-32 210-18v232c-70-14-140-10-210 18-70-28-140-32-210-18z"
        fill="#B98E6B"
        stroke={INK}
        strokeWidth="1.6"
      />
      <path d="M44 52c64-12 132-8 196 18v226c-64-26-132-30-196-18z" fill="#FFFDF8" stroke={INK} strokeWidth="1.6" />
      <path d="M436 52c-64-12-132-8-196 18v226c64-26 132-30 196-18z" fill="#FFFDF8" stroke={INK} strokeWidth="1.6" />

      <path
        d="M70 92h136M70 112h140M70 172h138M70 192h130M70 212h140M70 232h96"
        stroke={LINE}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="64" y="124" width="132" height="16" rx="4" fill="#F6C9D3" />
      <path d="M70 132h120" stroke="#C9A6A6" strokeWidth="5" strokeLinecap="round" />

      <path
        d="M274 92h134M270 112h140M270 132h126M270 152h138M270 212h118M270 232h138"
        stroke={LINE}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="264" y="184" width="146" height="16" rx="4" fill="#CFE3EA" />
      <path d="M270 192h134" stroke="#A9BFC7" strokeWidth="5" strokeLinecap="round" />

      <path d="M380 40v66l14-12 14 12V40z" fill="#F2B8C6" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />

      <g transform="rotate(-6 189 178)">
        <rect x="150" y="150" width="78" height="56" rx="8" fill="#FFF3C9" stroke={INK} strokeWidth="1.4" />
        <path d="M162 170h48M162 182h40M162 194h28" stroke="#C9B37A" strokeWidth="4" strokeLinecap="round" />
      </g>

      <path d="M412 268a24 24 0 0 1 24-24v24z" fill="#EAD7C3" stroke={INK} strokeWidth="1.4" />
      <path
        d="M24 300c6-26 18-40 34-44M30 300c-2-18-12-28-22-30"
        stroke="#5E8C6A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}