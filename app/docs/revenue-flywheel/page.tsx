import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenue Flywheel — Vellichor Docs",
  description: "How value moves through the protocol, and what's actually revenue versus cost-recovery.",
};

const REVENUE_TABLE = [
  {
    flow: "Primary sale proceeds (bottle sold as Vault Units)",
    revenue: "No — cost recovery",
    why: "This money repays what Vellichor already spent acquiring the bottle. Selling $18,000 in units for a bottle that cost $18,000 nets to roughly zero, not profit.",
  },
  {
    flow: "Marketplace fee (2% on secondary trades)",
    revenue: "Yes — recurring",
    why: "Vellichor didn't spend anything to earn this; it's a cut of trades happening between other people.",
  },
  {
    flow: "Custody fee (1.5% annually on vaulted bottles)",
    revenue: "Yes — recurring",
    why: "Ongoing charge that funds (and should roughly offset) real insurance/storage cost, with any margin counting as revenue.",
  },
  {
    flow: "Virtuals Genesis Launch treasury allocation (50% of $VELL raise)",
    revenue: "No — one-time capital, not revenue",
    why: "This is a capital injection at token launch, not something that recurs. It seeds early bottle acquisitions; it doesn't repeat every cycle the way fees do.",
  },
];

const LOOP_STEPS = [
  {
    title: "Buyer buys a Vault Unit",
    body: (
      <>
        Either primary sale (never-before-sold units, via{" "}
        <code className="font-data text-sm">buyUnits()</code>) or secondary market (resale
        between holders, via <code className="font-data text-sm">buyListing()</code>).
      </>
    ),
  },
  {
    title: "Marketplace fee + custody fee flow to treasury",
    body: "2% marketplace fee on secondary trades, 1.5% annual custody fee on vaulted bottles. These are the protocol's real, recurring revenue.",
  },
  {
    title: "Treasury acquires the next bottle",
    body: "Funded by accumulated fees (and, early on, by Virtuals Genesis Launch proceeds — see below). Genesis Vault grows by one bottle at a time, per the roadmap.",
  },
  {
    title: "More bottles, more liquidity, attracts the next buyer",
    body: "A larger, more liquid Vault Unit catalog is more attractive to new buyers, which restarts the loop at step 1.",
  },
];

const VELL_FIT = [
  "Holding 1,000,000+ $VELL brings the marketplace fee down from 2% to 1% (see the $VELL token page for the full tier table — corrected from an earlier ambiguous draft) — this slightly reduces the fee flowing to treasury per transaction from that holder, in exchange for making Vellichor more attractive to hold for than a competitor without a comparable token.",
  "The same threshold unlocks priority access to new drops — this doesn't change the revenue math directly, but it's a retention mechanic that keeps $VELL holders engaged with the loop (buying earlier, more often).",
  <>
    None of this is implemented in the contracts yet (see the $VELL token page&apos;s &quot;How
    the platform uses it&quot; section) — this describes intended design, not current behavior.
  </>,
];

const SPEEDS_UP = [
  "Higher secondary trading volume (more 2% fee events) — this is why liquidity, not just primary sales, matters to the flywheel.",
  "More bottles in the Genesis Vault — more surface area for both primary and secondary activity.",
  "$VELL holder retention (priority access, fee discounts) — keeps demand concentrated rather than one-off.",
];

const SLOWS_DOWN = [
  "If custody/insurance costs run close to or above the 1.5% fee collected, the custody fee stops being real revenue and becomes closer to a break-even pass-through — worth tracking once real vaulting costs are known, not assumed from the fee percentage alone.",
  "Thin secondary liquidity (few resales happening) starves the flywheel of its main recurring revenue source, since primary sale alone doesn't generate profit.",
  "Redemption removes a bottle (and its future fee-generating trade volume) from circulation entirely once 100% consolidation happens — each redemption is a small permanent contraction of the fee-generating asset base, not just a one-time event.",
];

export default function RevenueFlywheelPage() {
  return (
    <div>
      <span className="eyebrow">Token</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Revenue Flywheel
      </h1>
      <p className="mt-2 text-sm italic leading-relaxed text-ink-dim">
        How value moves through the protocol, and what&apos;s actually revenue versus
        cost-recovery. Written to be accurate against the contracts (
        <code className="font-data text-xs not-italic">VellichorVault.sol</code>,{" "}
        <code className="font-data text-xs not-italic">VellichorMarket.sol</code>), not
        aspirational.
      </p>

      <div className="mt-10">
        <h2 className="font-display text-lg font-normal text-ink">The loop</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {LOOP_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/10 font-data text-xs font-medium text-amber-deep">
                {i + 1}
              </span>
              <span className="text-base leading-relaxed text-ink-dim">
                <strong className="text-ink">{step.title}</strong> — {step.body}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-base leading-relaxed text-ink-dim">
          This is a slow-compounding loop, not a fast one — each cycle depends on real
          transaction volume, not on emissions or token inflation.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-normal text-ink">
          What&apos;s actually revenue, and what isn&apos;t
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          This distinction matters and shouldn&apos;t get blurred in investor-facing material:
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-panel-2">
                <th className="px-4 py-3 font-data text-xs font-medium uppercase tracking-wide text-ink-dim">
                  Flow
                </th>
                <th className="px-4 py-3 font-data text-xs font-medium uppercase tracking-wide text-ink-dim">
                  Is it revenue?
                </th>
                <th className="px-4 py-3 font-data text-xs font-medium uppercase tracking-wide text-ink-dim">
                  Why
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {REVENUE_TABLE.map((row) => (
                <tr key={row.flow}>
                  <td className="px-4 py-3 text-ink">{row.flow}</td>
                  <td className="px-4 py-3 font-data text-ink-dim">{row.revenue}</td>
                  <td className="px-4 py-3 text-ink-dim">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          Only the two fee lines are durable revenue. Everything else is either capital (one-time)
          or pass-through (primary sale).
        </p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-normal text-ink">
          Where $VELL fits into the loop
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          $VELL doesn&apos;t add a new stage to the loop — it modifies the existing one:
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {VELL_FIT.map((item, i) => (
            <li key={i} className="flex gap-2 text-base leading-relaxed text-ink-dim">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-normal text-ink">
          What makes the loop speed up or stall
        </h2>

        <h3 className="mt-6 font-display text-base font-normal text-ink">Speeds it up</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {SPEEDS_UP.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-ink-dim">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-display text-base font-normal text-ink">Slows or stalls it</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {SLOWS_DOWN.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-ink-dim">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-normal text-ink">
          Honest framing for any investor-facing material
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          Don&apos;t describe primary sale volume as &quot;protocol revenue&quot; — it isn&apos;t.
          If a pitch deck or landing page needs a revenue figure, it should be built from the two
          fee lines only (marketplace fee + custody fee), not gross transaction volume. Gross
          volume is a legitimate metric to show (it demonstrates activity), but it should never be
          labeled or implied as revenue.
        </p>
      </div>
    </div>
  );
}
