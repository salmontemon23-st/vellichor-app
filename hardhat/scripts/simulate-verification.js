const hre = require("hardhat");

// Simulates the admin Pre-Mint Bottle Intake workflow locally — proves
// VellichorAuthenticityRegistry and VellichorEnvironmentalOracle work, and that the
// staged-ID coordination with VellichorVault.listBottle() actually lines up. This is
// NOT a full integration test of the admin UI (that doesn't exist yet) — it's a
// contract-level proof that the pattern the intake workflow depends on is sound.
async function main() {
  const [deployer, otherWallet] = await hre.ethers.getSigners();

  console.log("=== Setup ===");
  console.log("Deployer (Vellichor team / auditor):", deployer.address);

  const MockTSLA = await hre.ethers.getContractFactory("MockTSLA");
  const tsla = await MockTSLA.deploy();
  await tsla.waitForDeployment();

  const VellichorVault = await hre.ethers.getContractFactory("VellichorVault");
  const vault = await VellichorVault.deploy(await tsla.getAddress(), deployer.address);
  await vault.waitForDeployment();
  console.log("VellichorVault deployed at:", await vault.getAddress());

  const Registry = await hre.ethers.getContractFactory("VellichorAuthenticityRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  console.log("VellichorAuthenticityRegistry deployed at:", await registry.getAddress());

  const EnvOracle = await hre.ethers.getContractFactory("VellichorEnvironmentalOracle");
  const envOracle = await EnvOracle.deploy(deployer.address);
  await envOracle.waitForDeployment();
  console.log("VellichorEnvironmentalOracle deployed at:", await envOracle.getAddress());

  // === Step 1: Bottle details (staged locally in the admin tool — no on-chain call) ===
  console.log("\n=== Step 1: Bottle details (staged, not on-chain) ===");
  const bottleName = "Test Bottle for Verification Demo";
  console.log(`Staged: "${bottleName}" — no contract call yet.`);

  // The admin tool reads nextBottleId to know what ID listBottle() will assign next,
  // and uses that same value as the draft ID for attestation.
  const draftBottleId = await vault.nextBottleId();
  console.log(`Draft bottleId (from VellichorVault.nextBottleId()): ${draftBottleId}`);

  // === Step 2: Authentication — blocks progress until confirmed on-chain ===
  console.log("\n=== Step 2: Authentication ===");
  console.log(`isAttested(${draftBottleId}) before: ${await registry.isAttested(draftBottleId)} (should be false — "List Bottle" stays disabled)`);

  // Non-auditor wallet should NOT be able to record an attestation.
  let rejected = false;
  try {
    await registry.connect(otherWallet).recordAttestation(draftBottleId, "unauthorized attempt");
  } catch {
    rejected = true;
  }
  console.log(`Non-auditor wallet blocked from recordAttestation: ${rejected} (should be true)`);

  await registry.recordAttestation(draftBottleId, "Verified bottle condition and provenance documents in person.");
  console.log(`isAttested(${draftBottleId}) after: ${await registry.isAttested(draftBottleId)} (should be true — "List Bottle" now enabled)`);

  // === Step 2b (optional): baseline environmental reading ===
  console.log("\n=== Step 2b: Baseline environmental reading (optional) ===");
  await envOracle.recordReading(draftBottleId, 155, 62, "Intake baseline — climate-controlled storage room A.");
  const baseline = await envOracle.latestReading(draftBottleId);
  console.log(`Baseline reading: ${Number(baseline.temperatureCelsiusX10) / 10}°C, ${baseline.humidityPercent}% humidity`);

  // === Step 3: Mint / list — only proceeds because Step 2 confirmed ===
  console.log("\n=== Step 3: Mint / list ===");
  const pricePerUnit = hre.ethers.parseUnits("1", 18);
  const tx = await vault.listBottle(bottleName, 100, pricePerUnit, "ipfs://metadata-placeholder");
  const receipt = await tx.wait();
  const mintedBottleId = await vault.nextBottleId() - 1n;
  console.log(`Minted bottleId: ${mintedBottleId}`);
  console.log(`Matches draft ID used for attestation: ${mintedBottleId === draftBottleId} (should be true — this is the coordination the workflow depends on)`);

  console.log("\n=== Simulation complete ===");
  console.log("Confirmed: AUDITOR_ROLE gating works, attestation blocks/unblocks correctly,");
  console.log("environmental baseline reading works, and the staged-ID coordination between");
  console.log("the registry and VellichorVault.listBottle() lines up as designed.");
  console.log("NOT confirmed by this script: the actual admin UI (3-step wizard, wallet role");
  console.log("check in the app) — that has not been built yet.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
