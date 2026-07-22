import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Market — Vellichor Docs",
  description: "Primary sale and secondary listings on the Vellichor Market.",
};

export default function MarketDocsPage() {
  return (
    <div>
      <span className="eyebrow">Product</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        The Market
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-dim">
        Buy and sell Vault Units. Two things happen here:
      </p>

      <ul className="mt-6 flex flex-col gap-6">
        <li>
          <h2 className="font-display text-lg font-normal text-ink">Primary sale</h2>
          <p className="mt-1 text-base leading-relaxed text-ink-dim">
            Units still held by Vellichor from initial listing, sold at the price set when the
            bottle was vaulted.
          </p>
        </li>
        <li>
          <h2 className="font-display text-lg font-normal text-ink">Secondary listings</h2>
          <p className="mt-1 text-base leading-relaxed text-ink-dim">
            Units resold by other holders, at whatever price the seller sets. A single bottle can
            have multiple simultaneous secondary listings from different sellers, all sharing the
            same underlying bottle image and metadata.
          </p>
        </li>
      </ul>

      <p className="mt-8 text-base leading-relaxed text-ink-dim">
        Listings can be sorted by price (low to high or high to low), same as any standard
        marketplace — this applies both across different bottles (comparing floor prices) and
        within a single bottle&apos;s listings (comparing unit prices from different sellers).
      </p>
    </div>
  );
}
