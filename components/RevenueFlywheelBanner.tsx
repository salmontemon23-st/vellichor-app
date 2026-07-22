"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "vellichor:revenue-flywheel-banner-dismissed";

function BookIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M10 5.5C8.7 4.6 6.8 4 4.5 4C3.9 4 3.5 4.4 3.5 5v9.5c0 .6.4 1 1 1 2 0 3.7.5 5 1.4M10 5.5c1.3-.9 3.2-1.5 5.5-1.5.6 0 1 .4 1 1v9.5c0 .6-.4 1-1 1-2 0-3.7.5-5 1.4M10 5.5v11.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RevenueFlywheelBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-line bg-panel-2 px-5 py-4 sm:items-center">
      <span className="mt-0.5 shrink-0 text-gold sm:mt-0">
        <BookIcon />
      </span>

      <p className="flex-1 text-sm leading-relaxed text-ink-dim">
        Understand how value moves through Vellichor before you buy — including what&rsquo;s
        actually revenue versus cost-recovery.{" "}
        <Link href="/docs/revenue-flywheel" className="font-medium text-amber-deep hover:underline">
          Read the Revenue Flywheel →
        </Link>
      </p>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="shrink-0 rounded-full p-1 text-ink-dim transition-colors hover:bg-panel hover:text-ink"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
