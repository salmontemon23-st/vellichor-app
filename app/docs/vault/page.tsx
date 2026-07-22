import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Vault — Vellichor Docs",
  description: "What the Vault page shows and Vellichor's curation standard.",
};

const LISTING_CONTENTS = [
  "Photos and full provenance (vintage, distillery/producer, condition report, chain of ownership)",
  "Total Vault Units and how many are still outstanding",
  "Custody status (insured, climate-controlled storage — details on the storage facility itself are limited to city/region, not full address, for security)",
];

export default function VaultDocsPage() {
  return (
    <div>
      <span className="eyebrow">Product</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        The Vault
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-dim">
        The Vault page shows every bottle currently in custody, whether or not any units are
        still available for primary sale. Genesis Vault launches with one bottle; additional
        bottles are added one at a time as each is sourced and authenticated — not released as a
        pre-curated batch.
      </p>

      <div className="mt-8">
        <h2 className="font-display text-lg font-normal text-ink">
          Each bottle listing shows:
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {LISTING_CONTENTS.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-ink-dim">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-normal text-ink">Curation standard</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          Not every bottle offered to Vellichor gets vaulted. Each is evaluated for verifiable
          provenance, genuine secondary-market demand, physical condition, and standing within
          serious collecting communities — filtering out packaging-driven &quot;limited
          edition&quot; releases with no real collector track record.
        </p>
      </div>
    </div>
  );
}
