type P = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CompassIcon({ size = 19 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-2 4.4-4.4 2 2-4.4z" />
    </svg>
  );
}

export function ScanIcon({ size = 17 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M7 12h10" />
    </svg>
  );
}

export function ZoomIcon({ size = 14 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.2} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6M11 8.4v5.2M8.4 11h5.2" />
    </svg>
  );
}

export function CheckIcon({ size = 13 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={3} aria-hidden>
      <path d="m4 12.5 5.2 5.2L20 6.5" />
    </svg>
  );
}

export function FlagIcon({ size = 17 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M5 21V4M5 4h10.5l-1.8 3.5L15.5 11H5" />
    </svg>
  );
}
