import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oracles & Verification — Vellichor Docs",
  description: "How authenticity attestation and environmental monitoring actually work today — and what's automated vs. human-entered.",
};

export default function OraclesAndVerificationPage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        Oracles &amp; Verification
      </h1>

      <p className="mt-5 text-base leading-relaxed text-ink-dim">
        Vellichor deliberately doesn&apos;t use a price-feed oracle for core buy/sell — prices are
        set directly (by the team at listing, by sellers on resale), not computed from an external
        index. This avoids a manipulable price dependency, especially while secondary liquidity is
        thin.
      </p>

      <p className="mt-4 text-base leading-relaxed text-ink-dim">
        Two other pieces of the &quot;digital twin&quot; model — formalized authenticity
        attestation and environmental monitoring — have real, working contracts in the repo
        (<code className="font-data text-sm not-italic">VellichorAuthenticityRegistry.sol</code>,{" "}
        <code className="font-data text-sm not-italic">VellichorEnvironmentalOracle.sol</code>),
        and are live on Robinhood Chain mainnet with a gated internal admin UI at{" "}
        <code className="font-data text-sm not-italic">/admin/list-bottle</code>. Neither is
        connected on-chain to <code className="font-data text-sm not-italic">VellichorVault.sol</code> —
        &quot;authenticated before minted&quot; is enforced as a UI-level rule in that admin tool,
        not a contract-level requirement.
      </p>

      <div className="mt-5 rounded-xl border border-line bg-panel-2 p-5">
        <p className="text-sm leading-relaxed text-ink-dim">
          <strong className="text-ink">Both are, today, entirely human-entered.</strong> A person
          on Vellichor&apos;s curation team inspects the bottle or reads a thermometer/hygrometer,
          then submits that data through the internal admin tool, which calls{" "}
          <code className="font-data text-xs not-italic">recordAttestation()</code> or{" "}
          <code className="font-data text-xs not-italic">recordReading()</code> on-chain. Neither
          contract currently receives data from any automated source — the &quot;oracle&quot; in
          both names describes the on-chain interface, not an automated feed.
        </p>
      </div>

      <h2 className="mt-8 font-display text-lg font-normal text-ink">
        Two different long-term paths
      </h2>
      <ul className="mt-4 flex flex-col gap-4">
        <li>
          <p className="text-base font-medium text-ink">Environmental readings</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-dim">
            Can realistically become automated once real IoT sensors are installed in storage
            facilities — the sensor would call{" "}
            <code className="font-data text-xs not-italic">recordReading()</code> directly,
            replacing the manual entry step entirely.
          </p>
        </li>
        <li>
          <p className="text-base font-medium text-ink">Authenticity attestation</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-dim">
            Likely to stay human-driven permanently, not just until some future hardware ships.
            Verifying provenance, purchase history, and condition is a judgment call — it isn&apos;t
            the kind of thing a sensor reads.
          </p>
        </li>
      </ul>

      <p className="mt-6 text-base leading-relaxed text-ink-dim">
        What is real today, independent of either contract above: Vellichor&apos;s curation
        process itself — verified provenance and condition assessment before a bottle is vaulted —
        functioning as that same human-driven authentication step, even before it was formalized
        as an on-chain attestation.
      </p>
    </div>
  );
}
