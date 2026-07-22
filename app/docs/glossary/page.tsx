import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary — Vellichor Docs",
  description: "Key terms used across the Vellichor protocol.",
};

const TERMS = [
  {
    term: "Vault Unit",
    def: "An ERC-1155 token representing fractional ownership of one specific, physical bottle held in Vellichor's custody.",
  },
  {
    term: "Bottle ID",
    def: "The token ID shared by all Vault Units of one bottle; auto-incremented each time a new bottle is listed via listBottle().",
  },
  {
    term: "Listing ID",
    def: "The identifier for one secondary-market sell order on VellichorMarket.sol; distinct from Bottle ID.",
  },
  {
    term: "Genesis Vault",
    def: "The first bottle(s) vaulted at launch, growing one bottle at a time rather than launching with a pre-curated batch.",
  },
  {
    term: "Redemption",
    def: "Burning 100% of a bottle's outstanding Vault Units to become eligible to claim the physical bottle, subject to off-chain KYC and compliance.",
  },
  {
    term: "$VELL",
    def: "Vellichor's separate governance/utility token, launched via Virtuals Protocol; has no claim on any bottle.",
  },
];

export default function GlossaryPage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Glossary
      </h1>

      <dl className="mt-8 flex flex-col divide-y divide-line border-y border-line">
        {TERMS.map((item) => (
          <div key={item.term} className="py-5">
            <dt className="font-data text-sm font-medium text-gold">{item.term}</dt>
            <dd className="mt-1 text-base leading-relaxed text-ink-dim">{item.def}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
