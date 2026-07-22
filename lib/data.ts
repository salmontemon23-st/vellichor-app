import type { Bottle, PortfolioHolding, Transaction } from "./types";

// All Vault/Market/Portfolio data now comes from live reads against
// VellichorVault.sol / VellichorMarket.sol on Robinhood Chain mainnet (see
// lib/contracts.ts, components/*OnChain*). The fixture arrays below are kept
// empty intentionally — the app reads the real deployment with a clean
// slate, not seed/demo data.
export const bottles: Bottle[] = [];

export const genesisCollection = bottles.filter((b) => b.genesis);

export function getBottle(id: string): Bottle | undefined {
  return bottles.find((b) => b.id === id);
}

export function percentClaimed(bottle: Bottle): number {
  return Math.round((bottle.unitsOutstanding / bottle.totalUnits) * 100);
}

export const demoHoldings: PortfolioHolding[] = [];

export const demoTransactions: Transaction[] = [];
