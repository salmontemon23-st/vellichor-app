import { defineChain } from "viem";

/**
 * Robinhood Chain mainnet — public Ethereum L2 on the Arbitrum Orbit stack.
 * Chain ID 4663, confirmed against docs.robinhood.com/chain/connecting and a
 * live eth_chainId call (testnet is the separate 46630).
 *
 * RPC URL / chain id are read from env vars so deployed network parameters
 * never need to be hardcoded/guessed here. Set:
 *   NEXT_PUBLIC_ROBINHOOD_RPC_URL
 *   NEXT_PUBLIC_ROBINHOOD_CHAIN_ID
 *   NEXT_PUBLIC_ROBINHOOD_EXPLORER_URL (optional)
 */
const rpcUrl = process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || "";
const chainId = process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID)
  : 4663;
const explorerUrl = process.env.NEXT_PUBLIC_ROBINHOOD_EXPLORER_URL || "https://robinhoodchain.blockscout.com";

export const robinhoodChain = defineChain({
  id: chainId,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl || "https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: explorerUrl,
    },
  },
  testnet: false,
});
