function HangingLamp({ className, cord }: { className: string; cord: number }) {
  return (
    <svg viewBox="0 0 80 120" className={className} aria-hidden="true">
      <path d={`M40 0v${cord}`} stroke="#5A4636" strokeWidth="1.4" />
      <path d={`M22 ${cord + 22}a18 18 0 0 1 36 0z`} fill="#FFFDF8" stroke="#5A4636" strokeWidth="1.6" />
      <rect x="36" y={cord - 2} width="8" height="8" rx="2" fill="#C9A27E" stroke="#5A4636" strokeWidth="1.2" />
    </svg>
  );
}

export function RoomBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 bottom-30 h-72 border-t-[10px] border-cream bg-mist-100" />
      <div className="floor-tiles absolute inset-x-0 bottom-0 h-30 border-t-[1.5px] border-[#D9C6B0]" />
      <HangingLamp className="absolute left-[22%] top-0 w-16" cord={70} />
      <HangingLamp className="absolute right-[26%] top-0 w-14" cord={50} />
    </div>
  );
}