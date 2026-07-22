import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & audits — Vellichor Docs",
  description: "Current audit status for the Vellichor contracts.",
};

export default function SecurityPage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Security &amp; audits
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-dim">
        Neither <code className="font-data text-sm">VellichorVault.sol</code> nor{" "}
        <code className="font-data text-sm">VellichorMarket.sol</code> has been audited yet. This
        section will be updated with audit reports and firm names once that happens — there&apos;s
        nothing to link here today, and this doc won&apos;t pretend otherwise.
      </p>
    </div>
  );
}
