type IconProps = { className?: string };

const base = "h-6 w-6";

export function IconVault({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="12" cy="12" r="3.25" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <path d="M12 8.75V9.5M12 14.5v.75M8.75 12h.75M14.5 12h.75" />
    </svg>
  );
}

export function IconLayers({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="M3.5 12l8.5 4.5L20.5 12" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </svg>
  );
}

export function IconExchange({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 8h13.5" />
      <path d="M14 4.5L17.5 8 14 11.5" />
      <path d="M20 16H6.5" />
      <path d="M10 12.5L6.5 16 10 19.5" />
    </svg>
  );
}

export function IconShieldCheck({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 3l7 3v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function IconChainLink({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="7" width="8" height="8" rx="2.5" />
      <rect x="13" y="9" width="8" height="8" rx="2.5" />
      <path d="M9 11l6 2" />
    </svg>
  );
}

export function IconWallet({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3.5 7.5A2.5 2.5 0 016 5h11a1.5 1.5 0 010 3H6a2.5 2.5 0 00-2.5 2.5v6A2.5 2.5 0 006 19h13a1.5 1.5 0 001.5-1.5V10" />
      <circle cx="16.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPackage({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3.5 8l8.5-4 8.5 4-8.5 4-8.5-4z" />
      <path d="M3.5 8v8l8.5 4 8.5-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

export function IconChevron({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
