import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqAccordion } from "@/components/about/FaqAccordion";

export const metadata: Metadata = {
  title: "About — Vellichor",
  description: "Rare bottles deserve real liquidity. Learn how Vellichor works.",
};

const ROADMAP = [
  {
    phase: "Phase 0",
    milestone:
      "Brand, whitepaper, smart contract testnet deployment on Robinhood Chain testnet",
  },
  {
    phase: "Phase 1",
    milestone:
      "Genesis vault: launch with the first curated bottle, direct-sale Vault Units, Market opens — additional bottles vaulted one at a time as each is sourced and authenticated",
  },
  {
    phase: "Phase 2",
    milestone:
      "$VELLICHOR utility token, token-gated priority access to curated drops, community governance over acquisitions",
  },
  {
    phase: "Phase 3",
    milestone: "Secondary marketplace liquidity, DeFi collateral integration",
  },
  { phase: "Phase 4", milestone: "First redemption completed" },
  {
    phase: "Phase 5",
    milestone: "Expansion to additional spirit categories and international vaulting partners",
  },
];

const FAQS = [
  {
    question: "How does Vellichor keep bottles secure?",
    answer:
      "Every bottle is held in third-party, climate-controlled, fully insured vault storage — never in a founder's closet, and never shipped or handled outside professional custody until redemption. Provenance documentation, condition reports, and certificates are attached to each bottle's on-chain record and available to every unit holder.",
  },
  {
    question: "What blockchain does this run on?",
    answer:
      "Vellichor is built on Robinhood Chain, the Ethereum Layer-2 network Robinhood launched on July 1, 2026 on the Arbitrum Orbit stack — purpose-built for tokenized real-world assets, with 24/7 settlement and low transaction costs. Vellichor is an independent project built on Robinhood Chain's public infrastructure and is not affiliated with, endorsed by, or operated by Robinhood Markets, Inc.",
  },
  {
    question: "How do you decide which bottles to vault?",
    answer:
      "We don't vault every bottle we're offered. Each one is evaluated for verifiable provenance, genuine secondary-market demand, physical condition, and standing within serious collecting communities — not how limited the packaging claims to be. If a bottle doesn't clear that bar, it doesn't go in the vault.",
  },
  {
    question: "What happens when I want the physical bottle?",
    answer:
      "Once you hold 100% of a bottle's outstanding Vault Units, you can request redemption on-chain. Fulfillment requires identity verification and compliance checks before the bottle ships, since redemption is separately regulated by local alcohol import and export rules.",
  },
  {
    question: "Is this legal and regulated?",
    answer:
      "Fractional ownership of a physical asset can be treated as a security in many jurisdictions, and shipping alcohol across borders is separately regulated. We design around both: bottles are held through a dedicated legal structure, and redemption requires identity verification and compliance checks. This page is for information only and isn't legal, tax, or investment advice.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-[70vh] pb-0">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <Image src="/about-hero.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
        <div className="container relative py-16 sm:py-24">
          <div className="max-w-3xl">
            <span className="eyebrow">About Vellichor</span>
            <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink-on-black sm:text-4xl">
              Rare bottles deserve real liquidity.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-on-black-dim">
              Vellichor exists because the best whiskey and wine in the world are locked away in
              private collections, auction houses, and warehouses — trading hands slowly, once every
              few years, at prices almost no one can verify. We built a better way to own them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/vault"
                className="rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-deep"
              >
                Explore the Vault
              </Link>
              <a
                href="/vellichor-whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink-on-black-dim/40 px-6 py-3 text-sm font-medium text-ink-on-black transition-colors hover:border-amber"
              >
                Read the whitepaper
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="border-y border-line bg-panel-2">
        <div className="container py-16">
          <span className="eyebrow">Roadmap</span>
          <h2 className="mt-3 font-display text-2xl font-normal text-ink sm:text-3xl">
            Where Vellichor is headed.
          </h2>
          <ol className="mt-10 max-w-2xl">
            {ROADMAP.map((row, i) => (
              <li key={row.phase} className="relative flex gap-6 pb-10 last:pb-0">
                {i !== ROADMAP.length - 1 && (
                  <span className="absolute left-[7px] top-4 h-full w-px bg-line" />
                )}
                <span className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-amber bg-panel" />
                <div>
                  <span className="font-data text-sm font-medium text-gold">{row.phase}</span>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{row.milestone}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-2 max-w-2xl font-data text-xs leading-relaxed text-ink-dim">
            Redemption is not gated to Phase 4 — the mechanism is live from launch. &quot;First
            redemption completed&quot; marks when it first happens in practice, once secondary
            liquidity makes full unit consolidation achievable.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="container py-16">
        <span className="eyebrow">FAQ</span>
        <h2 className="mt-3 font-display text-2xl font-normal text-ink sm:text-3xl">
          Questions collectors ask us.
        </h2>
        <div className="mt-10 max-w-3xl">
          <FaqAccordion items={FAQS} />
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-dim">
          This page is for information only and isn&apos;t legal, tax, or investment advice — read
          the{" "}
          <a
            href="/vellichor-whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-deep hover:underline"
          >
            full whitepaper
          </a>{" "}
          for details.
        </p>
      </div>
    </div>
  );
}
