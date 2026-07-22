const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys VellichorAuthenticityRegistry and VellichorEnvironmentalOracle to
// Robinhood Chain MAINNET. Real money — separate script from any testnet path,
// same discipline as deploy-mainnet.js (Vault/Market).
//
// Required env vars (set in .env, never hardcode):
//   ROBINHOOD_MAINNET_RPC_URL
//   ROBINHOOD_MAINNET_CHAIN_ID
//   MAINNET_DEPLOYER_PRIVATE_KEY
//   MAINNET_TREASURY_ADDRESS   — reused as the admin/owner of both new contracts,
//                                since this is the same team-controlled address
//                                already trusted with Vault/Market treasury duties.
//
// Run with: npx hardhat run scripts/deploy-verification-mainnet.js --network robinhoodMainnet
async function main() {
  const admin = process.env.MAINNET_TREASURY_ADDRESS;
  if (!admin) {
    throw new Error("MAINNET_TREASURY_ADDRESS is not set.");
  }

  const [deployer] = await hre.ethers.getSigners();

  console.log("=== Deploying to", hre.network.name, "(MAINNET — real funds) ===");
  console.log("Deployer:", deployer.address);
  console.log("Admin/owner (AUDITOR_ROLE + Ownable owner):", admin);

  const Registry = await hre.ethers.getContractFactory("VellichorAuthenticityRegistry");
  const registry = await Registry.deploy(admin);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("\nVellichorAuthenticityRegistry deployed at:", registryAddress);

  const EnvOracle = await hre.ethers.getContractFactory("VellichorEnvironmentalOracle");
  const envOracle = await EnvOracle.deploy(admin);
  await envOracle.waitForDeployment();
  const envOracleAddress = await envOracle.getAddress();
  console.log("VellichorEnvironmentalOracle deployed at:", envOracleAddress);

  const deployment = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    admin,
    vellichorAuthenticityRegistry: registryAddress,
    vellichorEnvironmentalOracle: envOracleAddress,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.verification.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nSaved deployment addresses to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
