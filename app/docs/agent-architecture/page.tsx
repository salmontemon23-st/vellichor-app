import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Architecture — Vellichor Docs",
  description: "The buyer-scoped permission boundary for AI agents acting on DeFi collateral positions — skeleton only, not live.",
};

export default function AgentArchitecturePage() {
  return (
    <div>
      <span className="eyebrow">Reference</span>
      <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
        AI Agent Architecture
      </h1>

      <div className="mt-5 rounded-xl border border-line bg-panel-2 p-5">
        <p className="text-sm leading-relaxed text-ink-dim">
          <strong className="text-ink">Skeleton only, not live.</strong> The permission contract
          described below is written and tested locally, not audited, not connected to any
          collateral contract, and not exposed anywhere in the app.
        </p>
      </div>

      <p className="mt-6 text-base leading-relaxed text-ink-dim">
        Vellichor&apos;s AI agent concept operates on the <strong className="text-ink">buyer&apos;s</strong>{" "}
        side of a collateral position, not Vellichor&apos;s. When a Vault Unit holder uses their
        units as DeFi collateral, they can grant an agent a scoped, revocable permission over that
        specific position — nothing more. Two permission levels exist:{" "}
        <strong className="text-ink">Monitor Only</strong>, where the agent watches the position
        and can alert the holder, and <strong className="text-ink">Repay Up To Limit</strong>,
        where the agent can execute a capped repayment on the holder&apos;s behalf to help avoid
        liquidation.
      </p>

      <h2 className="mt-8 font-display text-lg font-normal text-ink">
        The boundary is structural, not a policy promise
      </h2>
      <p className="mt-3 text-base leading-relaxed text-ink-dim">
        <code className="font-data text-sm not-italic">VellichorAgentPermission.sol</code> only
        allows a position&apos;s owner to grant permission over their own position, to one named
        agent address, with an explicit cap. There&apos;s no code path for an agent to touch
        Vellichor&apos;s treasury or call any team-controlled function on{" "}
        <code className="font-data text-sm not-italic">VellichorVault.sol</code>,{" "}
        <code className="font-data text-sm not-italic">VellichorMarket.sol</code>, or{" "}
        <code className="font-data text-sm not-italic">VellichorGovernance.sol</code>. Revocation
        is immediate and controlled solely by the buyer who granted it.
      </p>

      <p className="mt-4 text-base leading-relaxed text-ink-dim">
        This permission layer is built and tested (
        <code className="font-data text-sm not-italic">contracts/VellichorAgentPermission.sol</code>,{" "}
        <code className="font-data text-sm not-italic">scripts/simulate-agent-permission.js</code>
        ). It sits on top of the DeFi collateral infrastructure (
        <code className="font-data text-sm not-italic">VellichorVaultUnitWrapper.sol</code>,{" "}
        <code className="font-data text-sm not-italic">VellichorVaultUnitOracle.sol</code>). The
        agent itself — the off-chain logic that actually reads this permission and acts on it — is
        the next piece to build, and hasn&apos;t been started.
      </p>

      <p className="mt-4 text-base leading-relaxed text-ink-dim">
        Still open: whether the agent, once built, should be alert-only or allowed to execute{" "}
        <code className="font-data text-sm not-italic">RepayUpToLimit</code> at all. See{" "}
        <code className="font-data text-sm not-italic">contracts/AGENT_STATUS.md</code> in the
        repo for the full honest breakdown.
      </p>
    </div>
  );
}
