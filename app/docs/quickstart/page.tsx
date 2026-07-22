import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quickstart — Vellichor Docs",
  description: "Get started with Vellichor in four steps.",
};

const STEPS = [
  {
    title: "Connect a wallet",
    body: "Configured for Robinhood Chain (network switch is prompted automatically if you're on the wrong chain).",
  },
  {
    title: "Browse the Vault or the Market",
    body: "Browse the Vault to see every bottle currently in custody, or the Market to see what's available to buy right now.",
  },
  {
    title: "Buy Vault Units",
    body: "Either from a bottle's primary listing (never-before-sold units, sold directly by Vellichor) or from another holder's resale listing on the secondary market.",
  },
  {
    title: "Hold, trade, or redeem",
    body: "Units are tradable at any time; if you consolidate 100% of a bottle's outstanding units, you become eligible to redeem the physical bottle.",
  },
];

export default function QuickstartPage() {
  return (
    <div>
      <span className="eyebrow">Overview</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Quickstart
      </h1>
      <ol className="mt-8 flex flex-col gap-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-2 font-data text-sm font-medium text-gold">
              {i + 1}
            </span>
            <div>
              <h2 className="font-display text-lg font-normal text-ink">{step.title}</h2>
              <p className="mt-1 text-base leading-relaxed text-ink-dim">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
