# Collateral Feature — Status: Design & Contracts Only, Not Live

This directory contains the early-stage groundwork for using Vault Units as DeFi collateral (see whitepaper Section 5, "DeFi collateral integration," and the Phase 3 roadmap item). **This is not a live feature.** Read this before assuming anything here is production-ready or exposed anywhere in the app.

## What exists

| Contract | Status |
|---|---|
| `VellichorVaultUnitWrapper.sol` | Written, tested locally (`scripts/simulate-collateral.js`). Wraps ERC-1155 Vault Units into a standard ERC-20, 1:1, per bottle. |
| `VellichorVaultUnitOracle.sol` | Written, tested locally. Manually-updated price oracle — **explicitly flagged in its own comments as a stopgap design carrying real manipulation/centralization risk**, not a finished, decentralized solution. |

## Morpho integration research (confirmed, not yet acted on)
- Morpho Blue's real contract address on Robinhood Chain **mainnet** (chainId 4663): `0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010` — confirmed via Morpho's public GraphQL API against real live markets (a $170M+ Steakhouse USDG vault, real recent transactions). This is NOT the canonical cross-chain CREATE2 address (`0xBBBB...EFFCb`, which is an empty EOA on this chain) — Robinhood Chain has its own deployment.
- **Morpho is NOT deployed on Robinhood Chain testnet** (chainId 46630) — Morpho's own API returns `"unsupported chainId"` for it. The prompt's "testnet first" deploy sequence for the Morpho *market* step specifically cannot be followed literally, since there's no testnet Morpho to create a market on. Wrapper/Oracle contracts themselves can still be deployed and exercised on testnet fine — it's only the `createMarket` + borrow/liquidate steps that have nowhere to run except mainnet.
- Real IRM in active use: `0x2BD3d5965B26B51814AC95127B2b80dD6CcC0fa1`.
- Real LLTV values enabled on this chain (Morpho requires LLTV from a pre-enabled set): 62.5%, 77%, 86%, 91.5%, 98%. Vellichor's own LLTV choice is not yet decided — flagged in the integration prompt as a team decision, not Claude Code's to default.
- Morpho's real `IOracle` interface (confirmed against `morpho-org/morpho-blue` tag `v1.0.0`): single `price() external view returns (uint256)`, scaled by `1e(36 + loanTokenDecimals - collateralTokenDecimals)` — NOT "price in the loan token's smallest unit" as originally written. `VellichorVaultUnitOracle.sol` has been corrected to implement this exactly (see the contract's own `SCALING` dev comment); the owner-facing `updatePrice()` still takes a human-readable number, the contract does the 1e36 conversion internally.

## What does NOT exist yet
- No live Morpho market has been created — only the address/interface/parameter research above.
- No frontend, UI, or app flow references this feature anywhere. It is intentionally **not surfaced on the live site** — no "collateralize" button, no borrowing flow, nothing a user can click. If you find UI referencing this, that's a bug, not an intended feature — it shouldn't exist until this whole stack is actually ready.
- Not audited. Per the project's own "before mainnet" checklist, this needs a real security review before any real money touches it — the oracle design in particular is called out as the riskiest single piece of the collateral feature.
- The buyer-scoped AI agent concept that would sit on top of this (see `vellichor-collateral-agent-concept.md`) is unresolved design thinking, not code.

## Why this exists in the repo at all, if it's not live
So that the whitepaper's and roadmap's claims about DeFi collateral integration are backed by real, working code — not just a promise. Anyone checking this repo against what Vellichor says publicly should find honest groundwork, not vaporware, but also should not find a half-finished feature quietly live in production. This directory is proof of the former without risking the latter.
