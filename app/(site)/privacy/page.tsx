import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Vellichor",
  description: "Privacy Policy for Vellichor's Fractional Vault platform.",
};

export default function PrivacyPage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          Privacy Policy
        </h1>

        <div className="mt-6 rounded-xl border border-line bg-panel-2 p-4 text-sm text-ink-dim">
          This is a starting draft only, written to be directionally correct with Vellichor&apos;s
          whitepaper (Section 8, Legal &amp; Compliance). It is not a substitute for a Privacy
          Policy prepared by qualified legal counsel in each relevant jurisdiction, and should not
          be published or relied upon until reviewed by a lawyer.
        </div>

        <div className="mt-12 grid gap-10">
          <section>
            <h2 className="font-display text-xl font-normal text-ink">Data we collect</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Your wallet address and on-chain activity, which is public by nature. Only at
              redemption do we collect identity verification information and a shipping address.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">Purpose</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              We use this data to operate the Market, Vault, and Portfolio, to comply with KYC
              and alcohol-shipping law, and to communicate about orders or redemptions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">Third parties</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              We share data only as needed to complete a redemption: with an identity-verification
              provider, our vault/custody operator, and a logistics partner for shipping.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">
              No sale of data, and retention
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              We do not sell personal data. We retain it only for as long as needed for
              compliance and service delivery.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
