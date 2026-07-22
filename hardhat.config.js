require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      // local simulation network — this is what we use to test the flow
      // before touching Robinhood Chain testnet
    },
    // Fill this in with real values before deploying to Robinhood Chain testnet.
    // Get the RPC URL from Robinhood Chain's official developer docs, and never
    // commit a real private key to source control — use an env var instead.
    robinhoodTestnet: {
      url: process.env.ROBINHOOD_TESTNET_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: process.env.ROBINHOOD_TESTNET_CHAIN_ID
        ? Number(process.env.ROBINHOOD_TESTNET_CHAIN_ID)
        : undefined,
    },
    // Real money. Deliberately kept separate from robinhoodTestnet above —
    // never point a mainnet deploy script at the testnet block or vice versa.
    // Chain ID 4663 and the public RPC URL are confirmed against Robinhood
    // Chain's official docs (docs.robinhood.com/chain/connecting) and a live
    // eth_chainId call, not assumed. Uses its own MAINNET_DEPLOYER_PRIVATE_KEY —
    // never reuse the testnet deployer key here.
    robinhoodMainnet: {
      url: process.env.ROBINHOOD_MAINNET_RPC_URL || "",
      accounts: process.env.MAINNET_DEPLOYER_PRIVATE_KEY ? [process.env.MAINNET_DEPLOYER_PRIVATE_KEY] : [],
      chainId: process.env.ROBINHOOD_MAINNET_CHAIN_ID
        ? Number(process.env.ROBINHOOD_MAINNET_CHAIN_ID)
        : 4663,
    },
  },
};
