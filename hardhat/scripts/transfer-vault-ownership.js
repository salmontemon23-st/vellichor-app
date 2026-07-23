const hre = require("hardhat");

// Transfers VellichorVault ownership from the deployer to the team treasury
// wallet — fixes a real inconsistency where the Vault owner (needed for
// listBottle/Step 3) and the AuthenticityRegistry/EnvironmentalOracle admin
// (needed for Step 2) were two different addresses, so no single wallet could
// complete the /admin/list-bottle flow end to end.
async function main() {
  const treasury = process.env.MAINNET_TREASURY_ADDRESS;
  if (!treasury) throw new Error("MAINNET_TREASURY_ADDRESS is not set.");

  const vault = await hre.ethers.getContractAt(
    "VellichorVault",
    "0x78a3C6BDfc720E7095b3DD561bADA37D97c09645"
  );

  const before = await vault.owner();
  console.log("Vault owner before:", before);

  const tx = await vault.transferOwnership(treasury);
  console.log("Tx sent:", tx.hash);
  await tx.wait();

  const after = await vault.owner();
  console.log("Vault owner after:", after);
  console.log("Matches treasury:", after.toLowerCase() === treasury.toLowerCase());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
