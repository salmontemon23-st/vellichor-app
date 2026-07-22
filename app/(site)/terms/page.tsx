import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Vellichor",
  description: "Terms of Service for Vellichor's Fractional Vault Units.",
};

export default function TermsPage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          Terms of Service
        </h1>

        <div className="mt-6 rounded-xl border border-line bg-panel-2 p-4 text-sm text-ink-dim">
          This is a starting draft only, written to be directionally correct with Vellichor&apos;s
          whitepaper (Section 8, Legal &amp; Compliance). It is not a substitute for Terms of
          Service prepared by qualified legal counsel in each relevant jurisdiction, and should
          not be published or relied upon until reviewed by a lawyer.
        </div>

        <div className="mt-12 grid gap-10">
          <section>
            <h2 className="font-display text-xl font-normal text-ink">1. Vault Units</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              A Vault Unit is a fractional beneficial interest in a specific, named physical
              bottle held in custody by Vellichor&apos;s designated legal entity. Vault Units are
              not equity, debt, or a share of Vellichor itself.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">
              2. Using the Market and Portfolio
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Use of the Market and Portfolio requires a connected wallet. Purchases are final
              except as otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">3. Redemption</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Redemption of a physical bottle requires 100% unit consolidation, identity
              verification (KYC), and compliance with destination-country alcohol import rules.
              Vellichor may decline or delay redemption where legally required.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">
              4. No Investment Advice
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Nothing on this site or in the app is a recommendation to buy or sell.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">5. Eligibility</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Users must meet the minimum legal drinking age in their jurisdiction and must not
              be located in a restricted jurisdiction — see the{" "}
              <a href="/compliance" className="text-amber-deep hover:underline">
                Compliance Notice
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
