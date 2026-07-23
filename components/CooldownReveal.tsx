"use client";

import { useEffect, useState } from "react";

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/**
 * Blurs its children (typically a bottle image) until `revealAt` (unix seconds)
 * passes, with a countdown overlay. If `revealAt` is unset or already in the
 * past, renders children unchanged — no cooldown was set for this bottle, or
 * it already ended.
 */
export function CooldownReveal({
  revealAt,
  children,
  className = "",
}: {
  revealAt?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const locked = !!revealAt && revealAt > now;

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, [locked]);

  if (!revealAt || revealAt <= now) return <>{children}</>;

  const remaining = revealAt - now;

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none blur-xl brightness-90">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel/90 text-ink shadow-sm">
          <LockIcon />
        </span>
        <p className="rounded-full bg-panel/90 px-3 py-1 font-data text-xs font-semibold text-ink shadow-sm">
          Unlocks in {formatRemaining(remaining)}
        </p>
      </div>
    </div>
  );
}
