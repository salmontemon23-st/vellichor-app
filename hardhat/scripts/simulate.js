const hre = require("hardhat");

// Simulates, end-to-end, on a local network:
// 1. Deploy mock TSLA (temporary testnet payment asset — USDG testnet unavailable),
//    VellichorVault, VellichorMarket
// 2. Vellichor lists 1 bottle split into 3 Vault Units
// 3. A buyer purchases all 3 units (primary sale)
// 4. That buyer lists all 3 units for resale on the secondary market
// 5. A second buyer purchases them on the secondary market
// 6. Exercise the new Vault/Market/Portfolio read functions
async function main() {
  const [deployer, buyer1, buyer2] = await hre.ethers.getSigners();

  console.log("=== Setup ===");
  console.log("Deployer (Vellichor):", deployer.address);
  console.log("Buyer 1:", buyer1.address);
  console.log("Buyer 2:", buyer2.address);

  // 1. Deploy mock TSLA (temporary payment asset for testnet)
  const MockTSLA = await hre.ethers.getContractFactory("MockTSLA");
  const tsla = await MockTSLA.deploy();
  await tsla.waitForDeployment();
  console.log("\nMockTSLA deployed at:", await tsla.getAddress());
  console.log("NOTE: TSLA is a temporary testnet stand-in. Swap to USDG once available.");

  // Give both buyers spending money (mimics them already holding TSLA)
  await tsla.faucet(buyer1.address, hre.ethers.parseUnits("10000", 18));
  await tsla.faucet(buyer2.address, hre.ethers.parseUnits("10000", 18));

  // 2. Deploy VellichorVault
  const VellichorVault = await hre.ethers.getContractFactory("VellichorVault");
  const vault = await VellichorVault.deploy(await tsla.getAddress(), deployer.address);
  await vault.waitForDeployment();
  console.log("VellichorVault deployed at:", await vault.getAddress());

  // 3. Deploy VellichorMarket
  const VellichorMarket = await hre.ethers.getContractFactory("VellichorMarket");
  const market = await VellichorMarket.deploy(await vault.getAddress(), await tsla.getAddress(), deployer.address);
  await market.waitForDeployment();
  console.log("VellichorMarket deployed at:", await market.getAddress());

  // 4. List the bottle: Milwaukee's Club 30th Anniversary, split into 3 units, 1 TSLA/unit
  console.log("\n=== Listing the bottle ===");
  const pricePerUnit = hre.ethers.parseUnits("1", 18); // 1 mTSLA per unit
  const totalUnits = 3;
  await vault.listBottle(
    "Milwaukee's Club 30th Anniversary - American Style Whiskey",
    totalUnits,
    pricePerUnit,
    "ipfs://REPLACE_WITH_UPLOADED_IMAGE_CID/bottle-1.json"
  );
  const bottleId = 1;
  console.log(`Bottle listed: id=${bottleId}, totalUnits=${totalUnits}, pricePerUnit=1 mTSLA (total value: 3 mTSLA)`);

  // 5. Buyer 1 buys ALL 3 units (primary sale)
  console.log("\n=== Primary sale: buyer1 buys all 3 units ===");
  const totalCost = pricePerUnit * BigInt(totalUnits);
  await tsla.connect(buyer1).approve(await vault.getAddress(), totalCost);
  await vault.connect(buyer1).buyUnits(bottleId, totalUnits);
  console.log(`buyer1 now holds ${await vault.balanceOf(buyer1.address, bottleId)} / ${totalUnits} units (100%)`);

  // 6. buyer1 lists all 3 units for resale on the secondary market
  console.log("\n=== Secondary market: buyer1 lists all 3 units for resale ===");
  await vault.connect(buyer1).setApprovalForAll(await market.getAddress(), true);
  const resalePricePerUnit = hre.ethers.parseUnits("1.1", 18); // marked up slightly
  await market.connect(buyer1).listForSale(bottleId, totalUnits, resalePricePerUnit);
  const listingId = 1;
  console.log(`Listing created: listingId=${listingId}, units=${totalUnits}, pricePerUnit=1.1 mTSLA`);

  // 7. buyer2 buys all 3 units from the secondary listing
  console.log("\n=== buyer2 buys the full listing on the secondary market ===");
  const subtotal = resalePricePerUnit * BigInt(totalUnits);
  const fee = (subtotal * (await market.marketFeeBps())) / 10000n;
  await tsla.connect(buyer2).approve(await market.getAddress(), subtotal + fee);
  await market.connect(buyer2).buyListing(listingId, totalUnits);
  console.log(`buyer2 now holds ${await vault.balanceOf(buyer2.address, bottleId)} / ${totalUnits} units (100%)`);
  console.log(`buyer1 received ${hre.ethers.formatUnits(subtotal, 18)} mTSLA from the resale`);
  console.log(`Vellichor treasury received ${hre.ethers.formatUnits(fee, 18)} mTSLA marketplace fee`);

  // 8. Redemption check
  console.log("\n=== Redemption check ===");
  console.log(`buyer2 can redeem the physical bottle: ${await vault.canRedeem(bottleId, buyer2.address)}`);

  // 9. Exercise the new Vault page read function
  console.log("\n=== Vault page: getAllBottles() ===");
  const [allBottles, bottleIds] = await vault.getAllBottles();
  allBottles.forEach((b, i) => {
    console.log(`  Bottle #${bottleIds[i]}: "${b.name}" — ${b.unitsSold}/${b.totalUnits} units sold, redeemed=${b.redeemed}`);
  });

  // 10. Exercise the new Portfolio page read functions
  console.log("\n=== Portfolio page: getPortfolio(buyer2) ===");
  const [portfolioBottleIds, portfolioBalances] = await vault.getPortfolio(buyer2.address);
  portfolioBottleIds.forEach((id, i) => {
    console.log(`  buyer2 holds ${portfolioBalances[i]} unit(s) of bottle #${id}`);
  });

  console.log("\n=== Market page: getActiveListings() ===");
  const [activeListings] = await market.getActiveListings();
  console.log(`  Active listings remaining: ${activeListings.length} (expect 0 — buyer2 bought the whole listing)`);

  console.log("\n=== Simulation complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
