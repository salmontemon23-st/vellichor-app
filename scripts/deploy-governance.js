const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys MockVELL + VellichorGovernance to Robinhood Chain testnet, then runs
// the create-proposal / cast-vote / quorum-check / markExecuted flow as real
// testnet transactions (mirrors scripts/simulate-governance.js).
//
// Independent of VellichorVault/VellichorMarket — does not touch the already-
// live deployment in deployments/robinhoodTestnet.json in any way, so results
// are saved to a separate file.
//
// Testnet only ships one funded signer (DEPLOYER_PRIVATE_KEY), unlike the
// local simulation's four Hardhat test accounts — so this casts a single vote
// from the deployer's own MockVELL balance rather than simulating multiple
// voters. That's still enough to prove real transactions work end-to-end;
// quorum correctly won't be reached with one voter, same as the local sim.
//
// Run with: npx hardhat run scripts/deploy-governance.js --network robinhoodTestnet
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("=== Deploying to", hre.network.name, "===");
  console.log("Deployer:", deployer.address);

  const MockVELL = await hre.ethers.getContractFactory("MockVELL");
  const vell = await MockVELL.deploy();
  await vell.waitForDeployment();
  const vellAddress = await vell.getAddress();
  console.log("\nMockVELL deployed at:", vellAddress);
  console.log("NOTE: testnet-only stand-in. Real $VELL launches separately via Virtuals Genesis Launch.");

  const VellichorGovernance = await hre.ethers.getContractFactory("VellichorGovernance");
  const governance = await VellichorGovernance.deploy(vellAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("VellichorGovernance deployed at:", governanceAddress);

  console.log("\n=== Creating proposal ===");
  const createTx = await governance.createProposal(
    "ipfs://placeholder-proposal-metadata/acquire-bottle-2.json"
  );
  await createTx.wait();
  const proposalId = 1;
  console.log(`Proposal #${proposalId} created (tx: ${createTx.hash})`);

  console.log("\n=== Casting vote (deployer, from MockVELL constructor balance) ===");
  const voteTx = await governance.castVote(proposalId, 1); // For
  await voteTx.wait();
  console.log(`Vote cast FOR (tx: ${voteTx.hash})`);

  const proposal = await governance.proposals(proposalId);
  console.log("\n=== Results ===");
  console.log(`For: ${hre.ethers.formatUnits(proposal.forVotes, 18)} $VELL`);
  console.log(`Against: ${hre.ethers.formatUnits(proposal.againstVotes, 18)} $VELL`);
  console.log(`Abstain: ${hre.ethers.formatUnits(proposal.abstainVotes, 18)} $VELL`);

  const reachedQuorum = await governance.hasReachedQuorum(proposalId);
  console.log(`Reached quorum (4% of 1B supply): ${reachedQuorum} (expected false — single voter)`);

  const deployment = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    mockVell: vellAddress,
    vellichorGovernance: governanceAddress,
    note: "Independent of VellichorVault/VellichorMarket. Testnet-only MockVELL — redeploy against real $VELL once it launches via Virtuals.",
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.governance.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nSaved deployment addresses to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
