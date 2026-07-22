import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Vault Units work — Vellichor Docs",
  description: "How Vellichor Vault Units are minted, traded, and protected from wash trading.",
};

const POINTS = [
  {
    title: "One bottle = one token ID.",
    body: "All units of that bottle share the same ID, the same image, and the same metadata (photos, provenance, tasting notes) — they are fungible copies of a fractional claim, not individually unique items. There are no per-unit serial numbers.",
  },
  {
    title: "Two markets, same bottle.",
    body: "Primary sale is units bought directly from Vellichor (never previously owned). Secondary market is units resold between holders. Both can be active simultaneously for the same bottle.",
  },
  {
    title: "Sellers cannot buy their own listings.",
    body: "This is enforced on-chain, not just in the interface — it prevents wash trading (a seller creating fake demand by trading with themselves).",
  },
];

export default function VaultUnitsPage() {
  return (
    <div>
      <span className="eyebrow">Product</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        How Vault Units work
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-dim">
        Each bottle is minted as one ERC-1155 token series with a fixed total supply of units,
        set at listing time — there&apos;s no separate &quot;mint the NFT&quot; step followed by
        &quot;split it later.&quot; Minting and fractionalizing happen in the same on-chain call.
      </p>

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
