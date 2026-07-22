import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redemption — Vellichor Docs",
  description: "How redemption works, and why shipping data stays off-chain.",
};

const STEPS = [
  "A wallet consolidates 100% of a bottle's units (via primary purchase, secondary purchase, or both).",
  "The on-chain requestRedemption() call burns those units and marks the bottle redeemed — this step only proves ownership, it does not trigger shipment.",
  "Immediately after, the holder is directed to an off-chain redemption fulfillment flow — a form (not a smart contract) collecting shipping address and identity verification (KYC), required for alcohol shipping compliance.",
  "This pending state persists in the holder's Portfolio until fulfillment completes (submitted → verified → shipped → delivered) — it does not disappear if the form isn't finished in one sitting.",
];

const KYC_ITEMS = [
  "Legal name and government ID",
  "A liveness/selfie check",
  "Date of birth (age verification against the destination jurisdiction's legal drinking age)",
  "Shipping address",
  "Wallet-ownership verification (typically a signed message)",
  "Standard sanctions/AML screening against international watchlists",
];

export default function RedemptionPage() {
  return (
    <div>
      <span className="eyebrow">Product</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Redemption
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-dim">
        Redemption requires exactly <strong className="text-ink">100% of a bottle&apos;s
        outstanding Vault Units</strong> — there is no partial redemption path, by design.
      </p>

      <ol className="mt-8 flex flex-col gap-5">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-2 font-data text-sm font-medium text-gold">
              {i + 1}
            </span>
            <p className="text-base leading-relaxed text-ink-dim">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-xl border border-line bg-panel-2 p-6">
        <h2 className="font-display text-base font-normal text-ink">
          Why the shipping address isn&apos;t on-chain
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          Blockchain data is public and permanent. Recording a home address on-chain would let
          anyone see which wallet is about to receive a high-value bottle at a specific address —
          a real safety risk, not just a privacy preference.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-normal text-ink">What KYC collects</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {KYC_ITEMS.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-ink-dim">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
