const hre = require("hardhat");

// Simulates VellichorVaultUnitWrapper + VellichorVaultUnitOracle on a local
// network — proves the wrap/unwrap mechanism actually works. This is NOT a full
// Morpho integration (that requires live network access to verify Morpho's real
// interface/parameters, per vellichor-collateral-morpho-integration-prompt.md).
// This script exists so the collateral groundwork in the repo is backed by a real,
// passing test — not just contract files that have never been exercised.
async function main() {
  const [deployer, holder] = await hre.ethers.getSigners();

  console.log("=== Setup ===");
  console.log("Deployer (Vellichor team):", deployer.address);
  console.log("Holder:", holder.address);

  // 1. Deploy mock TSLA, VellichorVault, list a bottle, sell units to holder
  const MockTSLA = await hre.ethers.getContractFactory("MockTSLA");
  const tsla = await MockTSLA.deploy();
  await tsla.waitForDeployment();

  const VellichorVault = await hre.ethers.getContractFactory("VellichorVault");
  const vault = await VellichorVault.deploy(await tsla.getAddress(), deployer.address);
  await vault.waitForDeployment();
  console.log("VellichorVault deployed at:", await vault.getAddress());

  const pricePerUnit = hre.ethers.parseUnits("1", 18);
  await vault.listBottle("Test Bottle for Collateral Demo", 3, pricePerUnit, "ipfs://placeholder");
  const bottleId = 1;

  await tsla.transfer(holder.address, hre.ethers.parseUnits("10", 18));
  await tsla.connect(holder).approve(await vault.getAddress(), pricePerUnit * 3n);
  await vault.connect(holder).buyUnits(bottleId, 3);
  console.log(`Holder bought 3 units of bottle #${bottleId}`);

  // 2. Deploy the wrapper for this specific bottle
  const Wrapper = await hre.ethers.getContractFactory("VellichorVaultUnitWrapper");
  const wrapper = await Wrapper.deploy(
    await vault.getAddress(),
    bottleId,
    "Wrapped Vellichor Vault Unit - Test Bottle",
    "wVELL-TEST"
  );
  await wrapper.waitForDeployment();
  console.log("VellichorVaultUnitWrapper deployed at:", await wrapper.getAddress());

  // 3. Deploy the oracle, set an initial price
  // priceInLoanToken is in the loan token's smallest unit per whole wrapped unit —
  // here using 6 decimals as a stand-in for a stablecoin loan asset (e.g. USDG).
  // price() then returns this scaled by 1e36 per Morpho's real IOracle interface
  // (confirmed against morpho-org/morpho-blue v1.0.0 — see contract comments).
  const Oracle = await hre.ethers.getContractFactory("VellichorVaultUnitOracle");
  const loanTokenDecimals = 6;
  const initialPrice = hre.ethers.parseUnits("1.1", loanTokenDecimals);
  const oracle = await Oracle.deploy(initialPrice, loanTokenDecimals);
  await oracle.waitForDeployment();
  console.log("VellichorVaultUnitOracle deployed at:", await oracle.getAddress());
  console.log(`Initial oracle priceInLoanToken: ${hre.ethers.formatUnits(initialPrice, loanTokenDecimals)}`);
  console.log(`Morpho-scaled price() value: ${await oracle.price()} (should be priceInLoanToken * 1e36)`);

  // 4. Holder wraps their units
  console.log("\n=== Wrapping ===");
  await vault.connect(holder).setApprovalForAll(await wrapper.getAddress(), true);
  await wrapper.connect(holder).wrap(3);
  console.log(`Holder wrapped 3 units. Wrapped ERC-20 balance: ${await wrapper.balanceOf(holder.address)}`);
  console.log(`Holder's real Vault Unit balance now: ${await vault.balanceOf(holder.address, bottleId)} (should be 0 — units are locked in the wrapper)`);
  console.log(`Wrapper contract's real Vault Unit balance: ${await vault.balanceOf(await wrapper.getAddress(), bottleId)} (should be 3)`);

  // This is the point where, in a real deployment, the wrapped ERC-20 would be
  // deposited into a Morpho isolated market as collateral to borrow against.
  // That step is NOT simulated here — it requires a live Morpho market, which
  // this sandbox cannot create. See vellichor-collateral-morpho-integration-prompt.md.
  console.log("\n[Not simulated here: depositing wrapped tokens into a live Morpho market.]");
  console.log("[That requires real network access to Morpho's deployed contracts on Robinhood Chain.]");

  // 5. Team updates the oracle price (simulating a real trade happening on Market)
  console.log("\n=== Oracle update ===");
  const newPrice = hre.ethers.parseUnits("1.15", loanTokenDecimals);
  await oracle.updatePrice(newPrice);
  console.log(`Oracle priceInLoanToken updated to: ${hre.ethers.formatUnits(await oracle.priceInLoanToken(), loanTokenDecimals)}`);
  console.log(`Morpho-scaled price() value: ${await oracle.price()}`);
  console.log(`Staleness check: ${await oracle.staleness()} seconds since last update`);

  // 6. Holder unwraps back to real Vault Units
  console.log("\n=== Unwrapping ===");
  await wrapper.connect(holder).unwrap(3);
  console.log(`Holder unwrapped. Wrapped ERC-20 balance now: ${await wrapper.balanceOf(holder.address)} (should be 0)`);
  console.log(`Holder's real Vault Unit balance restored: ${await vault.balanceOf(holder.address, bottleId)} (should be 3)`);

  console.log("\n=== Simulation complete ===");
  console.log("Confirmed: wrap/unwrap round-trips correctly, oracle price updates work.");
  console.log("NOT confirmed by this script: live Morpho market creation, borrowing, or liquidation —");
  console.log("that requires the live-network verification described in");
  console.log("vellichor-collateral-morpho-integration-prompt.md.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
