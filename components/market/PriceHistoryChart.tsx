"use client";

export interface PricePoint {
  timestamp: number; // unix seconds
  price: number; // price per unit, already formatted (token units, not wei)
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatDate(sec: number) {
  return new Date(sec * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Minimal inline SVG line chart — no charting library installed, and this is
 * a simple chronological price-per-unit plot straight from recorded
 * transaction prices (no oracle, no interpolation beyond straight segments
 * between real trades).
 */
export function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  if (points.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        No trades yet for this bottle — price history will appear here once units are bought.
      </p>
    );
  }

  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const prices = sorted.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const minTime = sorted[0].timestamp;
  const maxTime = sorted[sorted.length - 1].timestamp;
  const timeRange = maxTime - minTime || 1;

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const coords = sorted.map((p) => {
    const x = PAD_X + (sorted.length === 1 ? plotWidth / 2 : ((p.timestamp - minTime) / timeRange) * plotWidth);
    const y = PAD_TOP + plotHeight - ((p.price - minPrice) / priceRange) * plotHeight;
    return { x, y, p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-dim">
        <span>High: {maxPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
        <span>Low: {minPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-2 h-48 w-full" preserveAspectRatio="none">
        <line
          x1={PAD_X}
          y1={PAD_TOP + plotHeight}
          x2={WIDTH - PAD_X}
          y2={PAD_TOP + plotHeight}
          stroke="var(--line)"
          strokeWidth="1"
        />
        <path d={linePath} fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill="var(--amber-deep)">
            <title>
              {formatDate(c.p.timestamp)} — {c.p.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-data text-xs text-ink-dim">
        <span>{formatDate(minTime)}</span>
        <span>{formatDate(maxTime)}</span>
      </div>
    </div>
  );
}
