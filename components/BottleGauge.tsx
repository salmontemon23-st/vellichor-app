const BOTTLE_PATH =
  "M24 2 H36 V22 L46 40 Q50 46 50 54 V128 Q50 138 40 138 H20 Q10 138 10 128 V54 Q10 46 14 40 L24 22 Z";

export function BottleGauge({
  percent,
  accent = "amber",
  height = 140,
  className,
}: {
  percent: number;
  accent?: "amber" | "wine";
  height?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillColor = accent === "wine" ? "var(--wine)" : "var(--amber)";
  const liquidTop = 138 - (clamped / 100) * (138 - 24);

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className ?? ""}`}>
      <svg
        viewBox="0 0 60 140"
        width={(height / 140) * 60}
        height={height}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`bottle-clip-${accent}`}>
            <path d={BOTTLE_PATH} />
          </clipPath>
        </defs>
        <path d={BOTTLE_PATH} fill="var(--panel-2)" stroke="var(--line)" strokeWidth="1.5" />
        <g clipPath={`url(#bottle-clip-${accent})`}>
          <rect
            x="0"
            y={liquidTop}
            width="60"
            height={138 - liquidTop}
            fill={fillColor}
            opacity="0.9"
          />
        </g>
        <path d={BOTTLE_PATH} fill="none" stroke="var(--ink)" strokeOpacity="0.15" strokeWidth="1.5" />
      </svg>
      <span className="font-data text-xs text-ink-dim">{clamped}% claimed</span>
    </div>
  );
}
