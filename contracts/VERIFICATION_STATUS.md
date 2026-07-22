# Bottle Verification (Authenticity + Environmental) — Status: Live on Mainnet, Not Audited

This directory contains human authentication attestation and environmental monitoring
for vaulted bottles. **The contracts are deployed on Robinhood Chain mainnet and the
admin UI exists**, but this has not been through a security review — read this before
assuming it's battle-tested.

## What exists

| Contract | Status |
|---|---|
| `VellichorAuthenticityRegistry.sol` | Deployed on Robinhood Chain mainnet (chainId 4663) at `0x9e2bCBBbe77c25222dFda49D514B511E190c9cd3`. AUDITOR_ROLE and Ownable owner both set to the team treasury address. Tested locally first (`scripts/simulate-verification.js`) before deployment. Records a human attestation (`recordAttestation()`) per staged bottleId; `isAttested(bottleId)` is the check the admin tool gates minting on. |
| `VellichorEnvironmentalOracle.sol` | Deployed on Robinhood Chain mainnet at `0x832c71a94202FD9Dee51ff512861Be92672DcD6c`. Records a history of manually-entered temperature/humidity readings per bottleId (`recordReading()`), owner-only. |

Deployed via `scripts/deploy-verification-mainnet.js`; addresses saved to
`deployments/robinhoodMainnet.verification.json`. `vellichor-app/.env.local` is wired
to these addresses (`NEXT_PUBLIC_AUTHENTICITY_REGISTRY_ADDRESS`,
`NEXT_PUBLIC_ENVIRONMENTAL_ORACLE_ADDRESS`).

## Admin UI — exists, not yet end-to-end tested with a real wallet
`vellichor-app/app/admin/list-bottle` is a 3-step intake wizard (Details →
Authentication → Mint), gated by an on-chain check (`AUDITOR_ROLE` on the registry, or
`owner()` on `VellichorVault`) — not just an unlinked route. It has been verified to
render and gate correctly (unconnected wallet sees "Connect a wallet to continue", no
console errors), but the actual attestation → mint transaction flow has not yet been
exercised against mainnet with a real, authorized wallet.

**The old `ListBottleForm.tsx` mint form on the public `/vault` page is still live and
still bypasses this entirely** — it calls `VellichorVault.listBottle()` directly with
no authentication step. That was left in place while the registry didn't exist yet, to
avoid breaking the only way to mint bottles. Now that the registry is deployed, this is
worth revisiting: keep both, or retire the old form so the gate can't be bypassed.

## What's still deliberate / not done
- **Not connected on-chain to `VellichorVault.sol`.** There is no smart contract rule that blocks `listBottle()` from being called without a prior attestation existing — this is enforced by the admin UI, not the contracts. Adding a contract-level dependency would require modifying and redeploying `VellichorVault.sol`, which is already live on mainnet with real listing history — redeploying would orphan that state.
- **No physical tag hardware.** `physicalTagHash` in `VellichorAuthenticityRegistry` accepts `bytes32(0)` today — no NFC/RFID hardware exists to produce a real value. The field is a placeholder for when that hardware exists.
- **Not audited.** Per this project's own standing rule, these need a security review before real bottle authentication depends on them being unbreakable — they're live, but that's not the same bar as audited.

## The staged-ID coordination
Both contracts key their data by a `bottleId` that has no on-chain relationship to
`VellichorVault` — `VellichorVault.listBottle()` assigns IDs itself via an internal
auto-incrementing counter (`nextBottleId`) and doesn't accept one as a parameter. An
admin tool would need to read `nextBottleId` *before* minting, use that value as the
"draft ID" for attestation, then call `listBottle()` and trust it gets that exact ID.
`scripts/simulate-verification.js` proves this lines up correctly in a single-actor
local simulation — it does **not** prove it's race-condition-free against two admins
minting at the same time. That's an acceptable risk for a small, trusted internal team
(per the intake workflow's own reasoning), not something to harden further right now.

## Why this exists in the repo at all, if it's not live
Same reasoning as `COLLATERAL_STATUS.md`: proves the verification/oracle groundwork is
backed by real, tested code, without prematurely wiring it into the live mint flow
before the admin UI, wallet-role gating, and a security review actually exist.
