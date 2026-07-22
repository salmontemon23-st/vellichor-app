import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Vellichor Docs",
  description: "Frequently asked questions about the Vellichor protocol.",
};

const FAQS = [
  {
    q: "Why can't I buy my own listing?",
    a: "Blocked on-chain to prevent wash trading — a seller can't create fake demand by trading with themselves.",
  },
  {
    q: "Why does redemption require 100% of the units, not just what I hold?",
    a: "The physical bottle is one indivisible object. Partial redemption isn't physically possible, so the contract doesn't offer a partial path — you either hold the whole outstanding supply of that bottle's units, or you don't.",
  },
  {
    q: "Why is the bottle image the same across multiple listings?",
    a: "Because the image belongs to the bottle (the token ID), not to any individual unit or listing. Different sellers listing units of the same bottle are all selling fractions of the identical physical item.",
  },
  {
    q: "Can I lose my units without redeeming?",
    a: "No — units are only burned via requestRedemption(), which only succeeds once you hold 100% of a bottle's outstanding units. Selling or transferring units moves them to someone else; it doesn't burn them.",
  },
  {
    q: "Is $VELL the same as a Vault Unit?",
    a: "No. Vault Units are per-bottle, ERC-1155, and represent a physical claim. $VELL is a single, separate token that governs the protocol and unlocks fee discounts and priority access — it has no claim on any bottle.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        FAQ
      </h1>

      <div className="mt-8 flex flex-col divide-y divide-line border-y border-line">
        {FAQS.map((item) => (
          <div key={item.q} className="py-5">
            <h2 className="font-display text-base font-normal text-ink">{item.q}</h2>
            <p className="mt-2 text-base leading-relaxed text-ink-dim">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
