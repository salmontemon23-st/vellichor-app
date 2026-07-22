import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Vellichor — Vellichor Docs",
  description: "Five structural problems in rare spirits investing, and how the Vault fixes each one.",
};

const WHY_ROWS = [
  {
    n: "01",
    problem: "Illiquid for months",
    fix: "Vault Units trade 24/7 on Robinhood Chain. No waiting on an auction house.",
  },
  {
    n: "02",
    problem: "Storage most collectors can't arrange",
    fix: "Every bottle is already in insured, climate-controlled custody before it's listed — the cost is shared, not yours alone.",
  },
  {
    n: "03",
    problem: "Counterfeits everywhere",
    fix: "Every bottle is authenticated before vaulting, with provenance recorded permanently on-chain.",
  },
  {
    n: "04",
    problem: "Bottles degrade if mishandled",
    fix: "Professional vault operators store and monitor every bottle under correct conditions — not left to chance in transit or storage.",
  },
  {
    n: "05",
    problem: '"Limited edition" doesn\'t always mean valuable',
    fix: "Vellichor's curation standard filters for real collector demand, not packaging hype.",
  },
];

export default function WhyVellichorPage() {
  return (
    <div>
      <span className="eyebrow">Product</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Why Vellichor
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-dim">
        Five reasons rare bottles stayed out of reach — and how the vault fixes each one.
      </p>

      <ol className="mt-10 divide-y divide-line border-y border-line">
        {WHY_ROWS.map((row) => (
          <li
            key={row.n}
            className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[2.5rem_minmax(0,38%)_1fr] sm:items-baseline sm:gap-8"
          >
            <span className="font-data text-sm tabular-nums text-gold">{row.n}</span>
            <p className="text-base font-medium leading-snug text-ink">{row.problem}</p>
            <p className="text-sm leading-relaxed text-ink-dim">{row.fix}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-dim">
        You&apos;re not just buying a fraction of a bottle. You&apos;re buying past the five
        problems that made rare spirits investing hard in the first place.
      </p>
    </div>
  );
}
