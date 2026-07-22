import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture — Vellichor Docs",
  description: "Why the Vellichor protocol is built the way it is.",
};

const POINTS = [
  {
    title: "Two contracts, not one.",
    body: "VellichorVault.sol handles primary sale, bottle data, and redemption. VellichorMarket.sol handles secondary resale, with units escrowed in the market contract while listed. Separating them keeps redemption logic (which only needs to know about outstanding balances) independent from marketplace logic (which needs escrow, listings, and fees).",
  },
  {
    title: "ERC-1155, not ERC-721.",
    body: "Vault Units are fungible fractions of one bottle, not unique collectibles — ERC-1155 supports many units under one token ID natively, without needing 100 separate ERC-721 tokens per bottle.",
  },
  {
    title: "Off-chain redemption fulfillment.",
    body: "Covered in the Redemption page — shipping/KYC data doesn't belong on a public, permanent ledger.",
  },
  {
    title: "View-function reads, not indexing, at current scale.",
    body: "getAllBottles(), getPortfolio(), getActiveListings(), and getListingsBySeller() loop on-chain data directly. This is fine at Genesis Vault scale (a handful of bottles and listings) and free to call (view functions, no gas for reads) — but should move to an off-chain indexer if the catalog grows large enough that looping gets expensive to query.",
  },
  {
    title: "Payment token is swappable.",
    body: "Both contracts take paymentToken as a constructor parameter rather than hardcoding a token address — live on mainnet using the real USDG token, after testing against TSLA on testnet during development.",
  },
];

export default function ArchitecturePage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Architecture — why it&apos;s built this way
      </h1>

      <ul className="mt-8 flex flex-col gap-6">
        {POINTS.map((point) => (
          <li key={point.title}>
            <h2 className="font-display text-lg font-normal text-ink">{point.title}</h2>
            <p className="mt-1 text-base leading-relaxed text-ink-dim">{point.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
