const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Lists the Milwaukee's Club bottle on the already-deployed VellichorVault,
// using the metadataURI pinned by scripts/pinMetadataOnly.js. Only calls
// listBottle() — does not touch VellichorMarket or simulate any buy/resell
// flow (that needs additional funded buyer wallets we don't have on testnet).
//
// Run with: npx hardhat run scripts/listBottle.js --network robinhoodTestnet
async function main() {
  const metadataURI = "ipfs://Qmf7CYZuD92nVo7zByszGRfuxdwdjvxRENiK6WZUt67RmL";

  const deploymentPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const [deployer] = await hre.ethers.getSigners();
  console.log("=== Listing on", hre.network.name, "===");
  console.log("Deployer:", deployer.address);
  console.log("VellichorVault:", deployment.vellichorVault);
  console.log("metadataURI:", metadataURI);

  const vault = await hre.ethers.getContractAt("VellichorVault", deployment.vellichorVault);

  const pricePerUnit = hre.ethers.parseUnits("0.1", 18);
  const totalUnits = 3;

  const listTx = await vault.listBottle(
    "Milwaukee's Club 30th Anniversary - American Style Whiskey",
    totalUnits,
    pricePerUnit,
    metadataURI
  );
  console.log("\nTx submitted:", listTx.hash);
  await listTx.wait();

  const bottleId = (await vault.nextBottleId()) - 1n;
  console.log(`Bottle listed: id=${bottleId}, totalUnits=${totalUnits}, pricePerUnit=0.1 TSLA`);

  const bottle = await vault.bottles(bottleId);
  console.log("\n=== On-chain confirmation ===");
  console.log(`Name: ${bottle.name}`);
  console.log(`Total units: ${bottle.totalUnits}`);
  console.log(`Price per unit: ${hre.ethers.formatUnits(bottle.pricePerUnit, 18)} TSLA`);
  console.log(`metadataURI: ${bottle.metadataURI}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
