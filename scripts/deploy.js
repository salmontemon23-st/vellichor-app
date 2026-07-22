const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys VellichorVault and VellichorMarket to Robinhood Chain testnet, using
// the REAL testnet TSLA Stock Token as paymentToken (NOT MockTSLA — that's
// local-simulation only, see contracts/mocks/MockTSLA.sol).
//
// Required env vars (set in .env, never hardcode):
//   ROBINHOOD_TESTNET_RPC_URL
//   ROBINHOOD_TESTNET_CHAIN_ID
//   DEPLOYER_PRIVATE_KEY
//   TSLA_TESTNET_TOKEN_ADDRESS   — real TSLA Stock Token address from Robinhood Chain docs/faucet
//   TREASURY_ADDRESS             — optional, defaults to the deployer address
//
// Run with: npx hardhat run scripts/deploy.js --network robinhoodTestnet
async function main() {
  const tslaAddress = process.env.TSLA_TESTNET_TOKEN_ADDRESS;
  if (!tslaAddress) {
    throw new Error(
      "TSLA_TESTNET_TOKEN_ADDRESS is not set. Get the real testnet TSLA Stock Token address " +
        "from Robinhood Chain's official docs/faucet and add it to .env before deploying."
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  const treasury = process.env.TREASURY_ADDRESS || deployer.address;

  console.log("=== Deploying to", hre.network.name, "===");
  console.log("Deployer:", deployer.address);
  console.log("Treasury:", treasury);
  console.log("Payment token (TSLA testnet):", tslaAddress);

  const VellichorVault = await hre.ethers.getContractFactory("VellichorVault");
  const vault = await VellichorVault.deploy(tslaAddress, treasury);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("\nVellichorVault deployed at:", vaultAddress);

  const VellichorMarket = await hre.ethers.getContractFactory("VellichorMarket");
  const market = await VellichorMarket.deploy(vaultAddress, tslaAddress, treasury);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("VellichorMarket deployed at:", marketAddress);

  const deployment = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    treasury,
    paymentToken: tslaAddress,
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
