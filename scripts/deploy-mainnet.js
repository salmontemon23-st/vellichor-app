const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys VellichorVault and VellichorMarket to Robinhood Chain MAINNET,
// using the real USDG token as paymentToken. Real money — this is
// deliberately a separate script from scripts/deploy.js (testnet/TSLA), not
// a --network flag away from accidentally reusing testnet assumptions.
//
// Required env vars (set in .env, never hardcode):
//   ROBINHOOD_MAINNET_RPC_URL
//   ROBINHOOD_MAINNET_CHAIN_ID     — 4663, confirmed against official docs
//   MAINNET_DEPLOYER_PRIVATE_KEY   — separate key from the testnet deployer
//   USDG_MAINNET_ADDRESS           — 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168,
//                                     confirmed against docs.robinhood.com/chain/contracts
//                                     and a live decimals()/symbol() call
//   MAINNET_TREASURY_ADDRESS       — should be a multisig, not a single EOA
//
// Run with: npx hardhat run scripts/deploy-mainnet.js --network robinhoodMainnet
async function main() {
  const usdgAddress = process.env.USDG_MAINNET_ADDRESS;
  if (!usdgAddress) {
    throw new Error(
      "USDG_MAINNET_ADDRESS is not set. Confirmed official address: " +
        "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168 (docs.robinhood.com/chain/contracts) — " +
        "set it explicitly in .env rather than assuming."
    );
  }

  const treasury = process.env.MAINNET_TREASURY_ADDRESS;
  if (!treasury) {
    throw new Error(
      "MAINNET_TREASURY_ADDRESS is not set. This should be a multisig wallet you've already " +
        "set up — see vellichor-mainnet-migration-prompt.md Task 2. Deploying with a single " +
        "EOA as treasury for real USDG proceeds is not recommended."
    );
  }

  const [deployer] = await hre.ethers.getSigners();

  console.log("=== Deploying to", hre.network.name, "(MAINNET — real funds) ===");
  console.log("Deployer:", deployer.address);
  console.log("Treasury:", treasury);
  console.log("Payment token (USDG):", usdgAddress);

  const VellichorVault = await hre.ethers.getContractFactory("VellichorVault");
  const vault = await VellichorVault.deploy(usdgAddress, treasury);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("\nVellichorVault deployed at:", vaultAddress);

  const VellichorMarket = await hre.ethers.getContractFactory("VellichorMarket");
  const market = await VellichorMarket.deploy(vaultAddress, usdgAddress, treasury);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("VellichorMarket deployed at:", marketAddress);

  const deployment = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    treasury,
    paymentToken: usdgAddress,
    vellichorVault: vaultAddress,
    vellichorMarket: marketAddress,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nSaved deployment addresses to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
