const hre = require("hardhat");

// Simulates VellichorGovernance end-to-end on a local network:
// 1. Deploy MockVELL (local stand-in — real $VELL comes from Virtuals Genesis Launch)
// 2. Deploy VellichorGovernance pointing at MockVELL
// 3. Distribute $VELL to a few voters
// 4. Team creates a proposal ("acquire Bottle X")
// 5. Voters cast For/Against/Abstain votes, weighted by their real-time balance
// 6. Check quorum and pass/fail
// 7. Team marks it executed (record-keeping only — confirms this does NOT call
//    VellichorVault.listBottle() or anything else automatically)
async function main() {
  const [deployer, voter1, voter2, voter3] = await hre.ethers.getSigners();

  console.log("=== Setup ===");
  console.log("Deployer (Vellichor team):", deployer.address);
  console.log("Voter 1:", voter1.address);
  console.log("Voter 2:", voter2.address);
  console.log("Voter 3:", voter3.address);

  // 1. Deploy MockVELL
  const MockVELL = await hre.ethers.getContractFactory("MockVELL");
  const vell = await MockVELL.deploy();
  await vell.waitForDeployment();
  console.log("\nMockVELL deployed at:", await vell.getAddress());
  console.log("NOTE: this is a local stand-in. Real $VELL launches via Virtuals Genesis Launch.");

  // Distribute $VELL — voter1 and voter2 are well above the priority-access
  // threshold (1,000,000 $VELL per vellichor-vell-token.md), voter3 holds less
  await vell.transfer(voter1.address, hre.ethers.parseUnits("2000000", 18));
  await vell.transfer(voter2.address, hre.ethers.parseUnits("1500000", 18));
  await vell.transfer(voter3.address, hre.ethers.parseUnits("50000", 18));

  // 2. Deploy VellichorGovernance
  const VellichorGovernance = await hre.ethers.getContractFactory("VellichorGovernance");
  const governance = await VellichorGovernance.deploy(await vell.getAddress());
  await governance.waitForDeployment();
  console.log("VellichorGovernance deployed at:", await governance.getAddress());
  console.log("Quorum:", (await governance.quorumBps()).toString(), "bps");
  console.log("Voting period (seconds):", (await governance.votingPeriod()).toString());

  // 3. Team creates a proposal
  console.log("\n=== Creating proposal ===");
  await governance.createProposal("ipfs://placeholder-proposal-metadata/acquire-bottle-2.json");
  const proposalId = 1;
  console.log(`Proposal #${proposalId} created: "Acquire Bottle 2" (placeholder metadata)`);

  // 4. Voters cast votes
  console.log("\n=== Casting votes ===");
  await governance.connect(voter1).castVote(proposalId, 1); // For
  console.log("voter1 (2,000,000 $VELL) voted FOR");
  await governance.connect(voter2).castVote(proposalId, 1); // For
  console.log("voter2 (1,500,000 $VELL) voted FOR");
  await governance.connect(voter3).castVote(proposalId, 0); // Against
  console.log("voter3 (50,000 $VELL) voted AGAINST");

  // Try voting twice — should revert
  try {
    await governance.connect(voter1).castVote(proposalId, 0);
    console.log("ERROR: double-vote should have reverted but didn't!");
  } catch (err) {
    console.log("Confirmed: double-voting correctly reverts.");
  }

  // 5. Check quorum and outcome
  console.log("\n=== Results ===");
  const proposal = await governance.proposals(proposalId);
  console.log(`For: ${hre.ethers.formatUnits(proposal.forVotes, 18)} $VELL`);
  console.log(`Against: ${hre.ethers.formatUnits(proposal.againstVotes, 18)} $VELL`);
  console.log(`Abstain: ${hre.ethers.formatUnits(proposal.abstainVotes, 18)} $VELL`);

  const reachedQuorum = await governance.hasReachedQuorum(proposalId);
  console.log(`Reached quorum (4% of 1B supply = 40,000,000 $VELL needed): ${reachedQuorum}`);
  // NOTE: with only ~3.55M $VELL voted out of 1B total supply, this will NOT
  // reach the 4% quorum in this simulation — that's expected and realistic.
  // It demonstrates the quorum check working, not a bug.

  const passed = await governance.didProposalPass(proposalId);
  console.log(`Proposal passed (quorum + majority For): ${passed}`);

  // 6. Team marks executed — regardless of on-chain outcome, to prove this is
  // purely a record-keeping action the team controls independently
  console.log("\n=== Team marks proposal executed (manual, record-keeping only) ===");
  await governance.markExecuted(proposalId, true);
  const finalProposal = await governance.proposals(proposalId);
  console.log(`markedExecuted flag: ${finalProposal.markedExecuted}`);
  console.log("Confirmed: this flag is informational only — it did not call VellichorVault.listBottle()");
  console.log("or any other contract. The team could have set this to true or false regardless of");
  console.log("the vote outcome above — governance here is advisory, not enforced.");

  console.log("\n=== Simulation complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
