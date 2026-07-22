import Link from "next/link";
import { VaultHeroGauge, GenesisCollectionPreview } from "@/components/HomeVaultOnChain";
import { WhyHoldVaultUnits } from "@/components/WhyHoldVaultUnits";

const WHY_ROWS = [
  { n: "01", problem: "Illiquid for months", fix: "trades 24/7 on Robinhood Chain" },
  {
    n: "02",
    problem: "Storage nobody can arrange",
    fix: "insured, climate-controlled custody, shared cost",
  },
  {
    n: "03",
    problem: "Counterfeits everywhere",
    fix: "authenticated before vaulting, provenance on-chain",
  },
  {
    n: "04",
    problem: "Bottles degrade if mishandled",
    fix: "professionally stored and monitored",
  },
  {
    n: "05",
    problem: 'Fake "limited edition" scarcity',
    fix: "curation filters for real collector demand",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Curate",
    body: "Sourced and authenticated from auctions, distilleries, and private collections.",
  },
  {
    n: "2",
    title: "Vault",
    body: "Insured, climate-controlled storage — before a single unit is listed.",
  },
  {
    n: "3",
    title: "Tokenize",
    body: "Split into a fixed number of Vault Units, minted on Robinhood Chain.",
  },
  {
    n: "4",
    title: "Trade",
    body: "Tradable 24/7, any size, on the Market.",
  },
  {
    n: "5",
    title: "Redeem",
    body: "Consolidate 100% of a bottle's units to claim it physically.",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section>
        <div className="container grid gap-10 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <span className="eyebrow">First Rare Spirits RWA on Robinhood Chain</span>
            <h1 className="mt-4 font-display text-4xl font-normal leading-tight text-ink sm:text-5xl">
              Own rare whiskey and fine wine as RWAs.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-dim">
              Vaulted. Liquid. Tradable. Every bottle is authenticated, insured, and stored before
              a single unit is sold — so you always know exactly what you own.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/vault"
                className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-deep"
              >
                Explore the Vault
              </Link>
              <a
                href="/vellichor-whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber"
              >
                Read Whitepaper
              </a>
            </div>
          </div>

          <VaultHeroGauge />
        </div>
      </section>

      {/* GENESIS COLLECTION */}
      <section>
        <div className="container py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Genesis Collection</span>
              <h2 className="mt-3 font-display text-2xl font-normal text-ink sm:text-3xl">
                The first bottle in the vault.
              </h2>
            </div>
            <Link
              href="/market"
              className="hidden shrink-0 text-sm font-medium text-amber-deep hover:underline sm:block"
            >
              View full Market →
            </Link>
          </div>

          <GenesisCollectionPreview />

          <Link
            href="/market"
            className="mt-8 block text-center text-sm font-medium text-amber-deep hover:underline sm:hidden"
          >
            View full Market →
          </Link>
        </div>
      </section>

      {/* WHY VELLICHOR — problem / fix ledger */}
      <section>
        <div className="container py-20">
          <span className="eyebrow">Why Vellichor</span>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-normal text-ink sm:text-3xl">
            Five reasons rare bottles stayed out of reach — and how the vault fixes each one.
          </h2>

          <ol className="mt-10 divide-y divide-line border-y border-line">
            {WHY_ROWS.map((row) => (
              <li key={row.n} className="flex items-baseline gap-4 py-4">
                <span className="font-data text-sm tabular-nums text-gold">{row.n}</span>
                <p className="text-sm leading-snug text-ink">
                  <span className="font-medium">{row.problem}</span>
                  <span className="text-ink-dim"> → {row.fix}</span>
                </p>
              </li>
            ))}
          </ol>

          <Link
            href="/docs/why-vellichor"
            className="mt-6 inline-block text-sm font-semibold text-amber-deep hover:underline"
          >
            Read more →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="container py-20">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 font-display text-2xl font-normal text-ink sm:text-3xl">
            From cask to on-chain unit.
          </h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="flex flex-col rounded-2xl bg-panel-2 p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/15 font-data text-sm font-semibold text-amber-deep">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-normal text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{step.body}</p>
              </li>
            ))}
          </ol>

          <Link
            href="/docs"
            className="mt-8 inline-block text-sm font-semibold text-amber-deep hover:underline"
          >
            Read the full docs →
          </Link>
        </div>
      </section>

      <WhyHoldVaultUnits />
    </>
  );
}
