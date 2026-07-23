const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Redeploys VellichorAuthenticityRegistry only (simplified interface — dropped
// certificateURI/physicalTagHash, recordAttestation is now just bottleId + notes).
// VellichorEnvironmentalOracle is unchanged and NOT redeployed here.
async function main() {
  const admin = process.env.MAINNET_TREASURY_ADDRESS;
  if (!admin) throw new Error("MAINNET_TREASURY_ADDRESS is not set.");

  const [deployer] = await hre.ethers.getSigners();
  console.log("=== Redeploying VellichorAuthenticityRegistry to", hre.network.name, "(MAINNET) ===");
  console.log("Deployer:", deployer.address);
  console.log("Admin/owner (AUDITOR_ROLE):", admin);

  const Registry = await hre.ethers.getContractFactory("VellichorAuthenticityRegistry");
  const registry = await Registry.deploy(admin);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("\nVellichorAuthenticityRegistry deployed at:", registryAddress);

  const outPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.verification.json`);
  const existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
  const updated = {
    ...existing,
    vellichorAuthenticityRegistry: registryAddress,
    vellichorAuthenticityRegistryRedeployedAt: new Date().toISOString(),
    vellichorAuthenticityRegistryNote: "Simplified recordAttestation(bottleId, notes) — dropped certificateURI/physicalTagHash.",
  };
  fs.writeFileSync(outPath, JSON.stringify(updated, null, 2) + "\n");
  console.log(`Updated ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
