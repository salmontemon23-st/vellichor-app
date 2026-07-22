import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs — Vellichor",
  description: "Reference documentation for the Vellichor protocol.",
};

export default function DocsHome() {
  return (
    <div>
      <span className="eyebrow">Docs</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        What is Vellichor?
      </h1>
      <p className="mt-2 text-sm italic leading-relaxed text-ink-dim">
        Reference documentation for the Vellichor protocol. Written to be verified against the
        actual deployed contracts, not aspirational — sections marked &quot;not yet live&quot;
        mean exactly that.
      </p>

      <p className="mt-6 text-base leading-relaxed text-ink-dim">
        Vellichor is a Real World Asset (RWA) protocol for rare whiskey and fine wine, built on
        Robinhood Chain. Physical bottles are sourced, authenticated, and held in insured
        custody, then split into fractional <strong className="text-ink">Vault Units</strong> —
        ERC-1155 tokens that represent verifiable, tradable ownership of one specific, named
        bottle.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink-dim">
        Vellichor solves five structural problems in rare spirits investing: illiquidity, high
        custody cost, counterfeiting, physical degradation, and manufactured &quot;limited
        edition&quot; scarcity. See the{" "}
        <a
          href="/vellichor-whitepaper.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-deep hover:underline"
        >
          whitepaper
        </a>{" "}
        for the full case.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ink-dim">
        Vellichor is an independent protocol. It is not affiliated with, endorsed by, or a
        product of Robinhood Markets, Inc.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/docs/quickstart"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-ink/90"
        >
          Get started →
        </Link>
        <Link
          href="/docs/vault-units"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-panel"
        >
          How Vault Units work
        </Link>
      </div>
    </div>
  );
}
