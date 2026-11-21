export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[calc(100vh-4.75rem)] flex-col items-center justify-center gap-4 bg-blush-100 px-6">
      <svg viewBox="0 0 64 64" className="size-16 motion-safe:animate-bounce" aria-hidden="true">
        <path d="M14 50h36" stroke="#5A4636" strokeWidth="2" strokeLinecap="round" />
        <rect x="16" y="18" width="9" height="32" rx="2" fill="#CFE3EA" stroke="#5A4636" strokeWidth="1.6" />
        <rect x="27" y="12" width="10" height="38" rx="2" fill="#F2B8C6" stroke="#5A4636" strokeWidth="1.6" />
        <rect x="39" y="20" width="9" height="30" rx="2" fill="#BFD8C2" stroke="#5A4636" strokeWidth="1.6" transform="rotate(8 43 35)" />
      </svg>
      <p className="font-display text-lg font-semibold text-ink-strong">Just a moment...</p>
    </div>
  );
}