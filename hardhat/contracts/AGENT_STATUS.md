# Buyer-Scoped AI Agent Permission — Status: Skeleton Only, Not Live

This directory contains the on-chain permission boundary for the buyer-scoped AI
agent concept. **This is not a live feature and does not do anything yet.**

## What exists
`VellichorAgentPermission.sol` — written, tested locally
(`scripts/simulate-agent-permission.js`). Lets a buyer grant a scoped, revocable
permission to an agent address over their own position: `MonitorOnly` (read/alert
only) or `RepayUpToLimit` (capped repay). Confirmed: self-granting is blocked,
revocation is immediate and buyer-only, permission is per-buyer/per-agent (no
global "the agent").

## What does NOT exist
- **No agent.** There is no off-chain logic that reads this permission and acts on
  it — no Virtuals GAME framework integration, nothing running anywhere.
- **Not wired to anything real.** No collateral contract (`VellichorVaultUnitWrapper.sol`,
  Morpho market) calls `hasValidPermission()` or would let an agent actually execute
  a `repay()`. This contract only tracks grants — it doesn't act on them.
- **Not exposed in the app.** No UI to grant/revoke/view permissions anywhere in
  `vellichor-app`.
- **Not audited.**
- **Open design question, unresolved**: whether the agent (once built) should be
  alert-only or allowed to execute `RepayUpToLimit` at all — see
  `vellichor-collateral-agent-concept.md`. Building the off-chain agent is a
  separate future decision, not something to start opportunistically.

## Why this exists in the repo at all, if it's not live
Same reasoning as `COLLATERAL_STATUS.md` / `VERIFICATION_STATUS.md`: proves the
permission-boundary groundwork is real, tested code, not just a roadmap promise —
without prematurely building the actual agent or exposing anything to buyers before
the open design questions are resolved.
