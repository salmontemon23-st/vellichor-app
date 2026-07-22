import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance Notice — Vellichor",
  description: "Jurisdiction and eligibility notice for Vellichor's Fractional Vault Units.",
};

export default function CompliancePage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          Compliance Notice
        </h1>

        <div className="mt-6 rounded-xl border border-line bg-panel-2 p-4 text-sm text-ink-dim">
          This is a starting draft only, written to be directionally correct with Vellichor&apos;s
          whitepaper (Section 8, Legal &amp; Compliance). It is not a substitute for a Compliance
          Notice prepared by qualified legal counsel in each relevant jurisdiction, and should not
          be published or relied upon until reviewed by a lawyer.
        </div>

        <div className="mt-12 grid gap-10">
          <section>
            <h2 className="font-display text-xl font-normal text-ink">Securities treatment</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Vault Units may be treated as securities in some jurisdictions; availability may be
              restricted accordingly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">
              Redemption restrictions
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Physical redemption is unavailable in jurisdictions that prohibit or restrict
              alcohol import, or where Vellichor lacks the required shipping license.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">Your responsibility</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              You are responsible for confirming that acquiring, holding, or redeeming Vault
              Units is lawful in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-normal text-ink">Regional restrictions</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-dim">
              Vellichor reserves the right to restrict access by region as regulatory
              requirements evolve.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
