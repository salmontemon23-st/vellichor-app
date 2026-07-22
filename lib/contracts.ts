import type { Abi } from "viem";
import vellichorVaultAbi from "./abi/VellichorVault.json";
import vellichorMarketAbi from "./abi/VellichorMarket.json";
import vellichorGovernanceAbi from "./abi/VellichorGovernance.json";
import mockVellAbi from "./abi/MockVELL.json";
import vellichorAuthenticityRegistryAbi from "./abi/VellichorAuthenticityRegistry.json";
import vellichorEnvironmentalOracleAbi from "./abi/VellichorEnvironmentalOracle.json";

/**
 * Real Robinhood Chain mainnet contract addresses, deployed via
 * vellichor-hardhat/scripts/deploy-mainnet.js. There is no mock fallback —
 * reads/writes against these addresses hit the real, live mainnet deployment.
 */
export const VELLICHOR_VAULT_ADDRESS = process.env.NEXT_PUBLIC_VELLICHOR_VAULT_ADDRESS as
  | `0x${string}`
  | undefined;

export const VELLICHOR_MARKET_ADDRESS = process.env.NEXT_PUBLIC_VELLICHOR_MARKET_ADDRESS as
  | `0x${string}`
  | undefined;

export const PAYMENT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS as
  | `0x${string}`
  | undefined;

export const PAYMENT_TOKEN_SYMBOL = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_SYMBOL || "USDG";
// USDG uses 6 decimals (confirmed via a live decimals() call against the
// real mainnet contract) — not the 18 an ERC-20 default might suggest.
export const PAYMENT_TOKEN_DECIMALS = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS
  ? Number(process.env.NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS)
  : 6;

export const VELLICHOR_VAULT_ABI = vellichorVaultAbi as Abi;
export const VELLICHOR_MARKET_ABI = vellichorMarketAbi as Abi;
export const VELLICHOR_GOVERNANCE_ABI = vellichorGovernanceAbi as Abi;
export const MOCK_VELL_ABI = mockVellAbi as Abi;
export const VELLICHOR_AUTHENTICITY_REGISTRY_ABI = vellichorAuthenticityRegistryAbi as Abi;
export const VELLICHOR_ENVIRONMENTAL_ORACLE_ABI = vellichorEnvironmentalOracleAbi as Abi;

/**
 * VellichorAuthenticityRegistry + VellichorEnvironmentalOracle — written and tested
 * locally (see vellichor-hardhat/contracts/VERIFICATION_STATUS.md) but NOT yet
 * deployed to any real network. These addresses are unset until that deployment
 * happens; the internal admin intake tool renders a "not configured" state until then.
 */
export const VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_AUTHENTICITY_REGISTRY_ADDRESS as `0x${string}` | undefined;

export const VELLICHOR_ENVIRONMENTAL_ORACLE_ADDRESS = process.env
  .NEXT_PUBLIC_ENVIRONMENTAL_ORACLE_ADDRESS as `0x${string}` | undefined;

export const verificationConfigured = !!VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS;

/**
 * VellichorGovernance + MockVELL — deployed independently of Vault/Market
 * (see vellichor-hardhat/deployments/robinhoodTestnet.governance.json).
 * MockVELL is a testnet-only stand-in with a public faucet(); real $VELL
 * launches separately via Virtuals Genesis Launch, at which point a fresh
 * VellichorGovernance should be deployed pointing at the real token instead.
 */
export const VELLICHOR_GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_VELLICHOR_GOVERNANCE_ADDRESS as
  | `0x${string}`
  | undefined;

export const MOCK_VELL_ADDRESS = process.env.NEXT_PUBLIC_MOCK_VELL_ADDRESS as `0x${string}` | undefined;

export const governanceConfigured = !!VELLICHOR_GOVERNANCE_ADDRESS && !!MOCK_VELL_ADDRESS;

// Minimal ERC-20 ABI — only what's needed for balance display, allowance
// checks, and the approve() write ahead of buyUnits()/buyListing().
export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const satisfies Abi;

/** True once all three contract addresses are configured via env vars. */
export const contractsConfigured =
  !!VELLICHOR_VAULT_ADDRESS && !!VELLICHOR_MARKET_ADDRESS && !!PAYMENT_TOKEN_ADDRESS;

// Bottle IDs to hide from the UI (e.g. a bottle listed with a broken
// metadataURI that can never be fixed on-chain, since the Vault contract has
// no update function) — still exist on-chain and remain redeemable/tradable
// by whoever holds their units. Empty on this fresh mainnet deployment; the
// testnet-specific set (bottles #1/#2) didn't carry over.
export const HIDDEN_BOTTLE_IDS = new Set<bigint>([]);

// On-chain Bottle struct as returned by VellichorVault.bottles(id) /
// getAllBottles(). Distinct from the legacy fixture `Bottle` type in
// lib/types.ts, which carried demo-only descriptive fields.
export interface OnChainBottle {
  bottleId: bigint;
  name: string;
  totalUnits: bigint;
  unitsSold: bigint;
  pricePerUnit: bigint;
  unitsRedeemed: bigint;
  redeemed: boolean;
  listed: boolean;
  metadataURI: string;
}

export interface OnChainListing {
  listingId: bigint;
  seller: `0x${string}`;
  bottleId: bigint;
  unitsForSale: bigint;
  pricePerUnit: bigint;
  active: boolean;
}

// On-chain Proposal struct as returned by VellichorGovernance.proposals(id).
export interface OnChainProposal {
  proposalId: bigint;
  metadataURI: string;
  startTime: bigint;
  endTime: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  markedExecuted: boolean;
}

// Matches VellichorGovernance.sol's `enum VoteType { Against, For, Abstain }`.
export const VOTE_TYPE = { Against: 0, For: 1, Abstain: 2 } as const;
export type VoteTypeKey = keyof typeof VOTE_TYPE;
