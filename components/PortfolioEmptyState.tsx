import Link from "next/link";

/**
 * Shared empty-state pattern for every empty list/value in the Portfolio
 * section: a softly blurred placeholder (chart or list rows) behind a
 * centered overlay card with a headline, one line of supporting copy, and a
 * CTA. Reused across Dashboard, Holdings, and Listings — not one-off per
 * section.
 */
export function PortfolioEmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
  variant = "chart",
  minHeightClassName = "",
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  variant?: "chart" | "list";
  minHeightClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line bg-panel p-6 ${minHeightClassName}`}>
      <div aria-hidden className="pointer-events-none select-none opacity-40 blur-sm">
        {variant === "chart" ? (
          <div className="flex h-40 items-end gap-2">
            {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-amber" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-panel-2 p-3">
                <div className="h-10 w-10 rounded-lg bg-line" />
                <div className="flex-1">
                  <div className="h-3 w-2/3 rounded bg-line" />
                  <div className="mt-2 h-2 w-1/3 rounded bg-line" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-panel/70 backdrop-blur-[2px]">
        <div className="mx-4 max-w-xs rounded-2xl border border-line bg-panel p-6 text-center shadow-lg">
          <p className="font-display text-lg font-normal text-ink">{title}</p>
          <p className="mt-2 text-sm text-ink-dim">{body}</p>
          <Link
            href={ctaHref}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
