const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Repeats the buy -> list-for-resale -> buy-on-secondary -> redemption-check flow
// from scripts/simulate.js, but as real transactions against the contracts already
// deployed by scripts/deploy.js on Robinhood Chain testnet.
//
// Prerequisites:
//   1. scripts/deploy.js has been run (deployments/<network>.json exists).
//   2. scripts/uploadToIPFS.js has been run — use the printed metadataURI below.
//   3. The deployer wallet holds enough testnet TSLA to list; buyer wallets need
//      testnet TSLA too (get it from Robinhood Chain's testnet faucet, or transfer
//      from the deployer since MockTSLA's faucet() doesn't exist on the real token).
//
// Required env vars beyond deploy.js's:
//   BOTTLE_METADATA_URI   — ipfs://<CID>/bottle-1.json from Task 1
//   BUYER1_PRIVATE_KEY, BUYER2_PRIVATE_KEY — two additional funded testnet wallets
//
// Run with: npx hardhat run scripts/testnet-flow.js --network robinhoodTestnet
async function main() {
  const metadataURI = process.env.BOTTLE_METADATA_URI;
  if (!metadataURI) {
    throw new Error("BOTTLE_METADATA_URI is not set. Run scripts/uploadToIPFS.js first and set the printed URI in .env.");
  }
  if (!process.env.BUYER1_PRIVATE_KEY || !process.env.BUYER2_PRIVATE_KEY) {
    throw new Error("BUYER1_PRIVATE_KEY and BUYER2_PRIVATE_KEY must be set to two funded testnet wallets.");
  }

  const deploymentPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found at ${deploymentPath}. Run scripts/deploy.js first.`);
  }
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const [deployer] = await hre.ethers.getSigners();
  const buyer1 = new hre.ethers.Wallet(process.env.BUYER1_PRIVATE_KEY, hre.ethers.provider);
  const buyer2 = new hre.ethers.Wallet(process.env.BUYER2_PRIVATE_KEY, hre.ethers.provider);

  console.log("=== Setup ===");
  console.log("Deployer (Vellichor):", deployer.address);
  console.log("Buyer 1:", buyer1.address);
  console.log("Buyer 2:", buyer2.address);

  const tsla = await hre.ethers.getContractAt("IERC20", deployment.paymentToken);
  const vault = await hre.ethers.getContractAt("VellichorVault", deployment.vellichorVault);
  const market = await hre.ethers.getContractAt("VellichorMarket", deployment.vellichorMarket);

  console.log("\n=== Listing the bottle ===");
  const pricePerUnit = hre.ethers.parseUnits("0.1", 18);
  const totalUnits = 3;
  const listTx = await vault.listBottle(
    "Milwaukee's Club 30th Anniversary - American Style Whiskey",
    totalUnits,
    pricePerUnit,
    metadataURI
  );
  await listTx.wait();
  const bottleId = await vault.nextBottleId() - 1n;
  console.log(`Bottle listed: id=${bottleId}, totalUnits=${totalUnits}, metadataURI=${metadataURI}`);

  console.log("\n=== Primary sale: buyer1 buys all 3 units ===");
  const totalCost = pricePerUnit * BigInt(totalUnits);
  await (await tsla.connect(buyer1).approve(deployment.vellichorVault, totalCost)).wait();
  await (await vault.connect(buyer1).buyUnits(bottleId, totalUnits)).wait();
  console.log(`buyer1 now holds ${await vault.balanceOf(buyer1.address, bottleId)} / ${totalUnits} units`);

  console.log("\n=== Secondary market: buyer1 lists all 3 units for resale ===");
  await (await vault.connect(buyer1).setApprovalForAll(deployment.vellichorMarket, true)).wait();
  const resalePricePerUnit = hre.ethers.parseUnits("0.11", 18);
  await (await market.connect(buyer1).listForSale(bottleId, totalUnits, resalePricePerUnit)).wait();
  const listingId = await market.nextListingId() - 1n;
  console.log(`Listing created: listingId=${listingId}, units=${totalUnits}, pricePerUnit=0.11`);

  console.log("\n=== buyer2 buys the full listing on the secondary market ===");
  const subtotal = resalePricePerUnit * BigInt(totalUnits);
  const marketFeeBps = await market.marketFeeBps();
  const fee = (subtotal * marketFeeBps) / 10000n;
  await (await tsla.connect(buyer2).approve(deployment.vellichorMarket, subtotal + fee)).wait();
  await (await market.connect(buyer2).buyListing(listingId, totalUnits)).wait();
  console.log(`buyer2 now holds ${await vault.balanceOf(buyer2.address, bottleId)} / ${totalUnits} units`);

  console.log("\n=== Redemption check ===");
  console.log(`buyer2 can redeem the physical bottle: ${await vault.canRedeem(bottleId, buyer2.address)}`);

  console.log("\n=== Vault page: getAllBottles() ===");
  const [allBottles, bottleIds] = await vault.getAllBottles();
  allBottles.forEach((b, i) => {
    console.log(`  Bottle #${bottleIds[i]}: "${b.name}" — ${b.unitsSold}/${b.totalUnits} units sold, redeemed=${b.redeemed}`);
  });

  console.log("\n=== Portfolio page: getPortfolio(buyer2) ===");
  const [portfolioBottleIds, portfolioBalances] = await vault.getPortfolio(buyer2.address);
  portfolioBottleIds.forEach((id, i) => {
    console.log(`  buyer2 holds ${portfolioBalances[i]} unit(s) of bottle #${id}`);
  });

  console.log("\n=== Market page: getActiveListings() ===");
  const [activeListings] = await market.getActiveListings();
  console.log(`  Active listings remaining: ${activeListings.length} (expect 0)`);

  console.log("\n=== Testnet flow complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
