# Bottle Verification (Authenticity + Environmental) — Status: Live on Mainnet, Not Audited

This directory contains human authentication attestation and environmental monitoring
for vaulted bottles. **The contracts are deployed on Robinhood Chain mainnet and the
admin UI exists**, but this has not been through a security review — read this before
assuming it's battle-tested.

## What exists

| Contract | Status |
|---|---|
| `VellichorAuthenticityRegistry.sol` | Deployed on Robinhood Chain mainnet (chainId 4663) at `0x4937021499Ed825926f65d3b6C580d6b1e720828` (redeployed — see below; the original `0x9e2bCBBbe77c25222dFda49D514B511E190c9cd3` is orphaned, no real attestation was ever recorded on it). AUDITOR_ROLE and Ownable owner both set to the team treasury address. `recordAttestation(bottleId, notes)` — `isAttested(bottleId)` is the check the admin tool gates minting on. |
| `VellichorEnvironmentalOracle.sol` | Deployed on Robinhood Chain mainnet at `0x832c71a94202FD9Dee51ff512861Be92672DcD6c`. Records a history of manually-entered temperature/humidity readings per bottleId (`recordReading()`), owner-only. |

Deployed via `scripts/deploy-verification-mainnet.js`; addresses saved to
`deployments/robinhoodMainnet.verification.json`. `vellichor-app/.env.local` is wired
to these addresses (`NEXT_PUBLIC_AUTHENTICITY_REGISTRY_ADDRESS`,
`NEXT_PUBLIC_ENVIRONMENTAL_ORACLE_ADDRESS`).

**Redeploy note**: the registry originally required `certificateURI` (non-empty) and
accepted an optional `physicalTagHash`. Both were dropped per request —
`recordAttestation()` is now just `(bottleId, notes)`. Redeployed via
`scripts/redeploy-registry-mainnet.js` rather than upgraded in place (no proxy pattern),
since nothing had been recorded on the original deployment yet.

## Admin UI — the one wallet that can complete the full flow
`vellichor-app/app/admin/list-bottle` is a 3-step intake wizard (Details →
Authentication → Mint), gated by an on-chain check (`AUDITOR_ROLE` on the registry, or
`owner()` on `VellichorVault`).

**Use the treasury wallet (`0x3F8b972874683710120ad5122116b2574814bD06`) to connect.**
`VellichorVault` was originally deployed with the deployer address as owner, while
`AuthenticityRegistry`/`EnvironmentalOracle` were deployed with treasury as
admin/owner — two different addresses, so no single wallet could complete Step 2 and
Step 3 in the same session (Step 2 transactions reverted for the deployer wallet, which
is what surfaced this). Fixed by transferring `VellichorVault` ownership from deployer
to treasury via `scripts/transfer-vault-ownership.js` — see
`deployments/robinhoodMainnet.json` for the transfer record. Treasury now holds all
three: Vault `owner()`, Registry `AUDITOR_ROLE`, and EnvironmentalOracle `owner()`.

The old `ListBottleForm.tsx` mint form (previously on the public `/vault` page, called
`VellichorVault.listBottle()` directly with no authentication step) has been removed.
`/admin/list-bottle` is now the only way to mint a bottle through the app.

## What's still deliberate / not done
- **Not connected on-chain to `VellichorVault.sol`.** There is no smart contract rule that blocks `listBottle()` from being called without a prior attestation existing — this is enforced by the admin UI, not the contracts. Adding a contract-level dependency would require modifying and redeploying `VellichorVault.sol`, which is already live on mainnet with real listing history — redeploying would orphan that state.
- **No certificate URI or physical tag hash fields anymore.** Both were dropped from `recordAttestation()` — attestation is now just a notes field plus who-attested/when, recorded on-chain. If certificate documentation or NFC/RFID tagging is wanted later, that's a fresh contract change, not a re-add of the old fields.
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
