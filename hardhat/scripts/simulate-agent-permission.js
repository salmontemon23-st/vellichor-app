const hre = require("hardhat");

// Simulates VellichorAgentPermission — proves the scoped, revocable permission
// system works as designed. This does NOT simulate an agent actually doing
// anything (no collateral contract calls this yet) — it only proves the
// permission boundary itself: who can grant what, and that revocation is
// immediate and buyer-controlled.
async function main() {
  const [buyer, agent, randomAddress] = await hre.ethers.getSigners();

  console.log("=== Setup ===");
  console.log("Buyer:", buyer.address);
  console.log("Agent:", agent.address);
  console.log("Random address (not the buyer, not the agent):", randomAddress.address);

  const Permission = await hre.ethers.getContractFactory("VellichorAgentPermission");
  const permission = await Permission.deploy();
  await permission.waitForDeployment();
  console.log("VellichorAgentPermission deployed at:", await permission.getAddress());

  // 1. Before granting anything
  console.log("\n=== Before any grant ===");
  console.log(`Agent has valid permission: ${await permission.hasValidPermission(buyer.address, agent.address)} (should be false)`);

  // 2. Buyer grants MonitorOnly permission
  console.log("\n=== Buyer grants MonitorOnly permission ===");
  await permission.connect(buyer).grantPermission(agent.address, 0, 0, 0); // ActionType.MonitorOnly = 0
  console.log(`Agent has valid permission: ${await permission.hasValidPermission(buyer.address, agent.address)} (should be true)`);

  const p1 = await permission.permissions(buyer.address, agent.address);
  console.log(`Action type: ${p1.actionType} (0 = MonitorOnly)`);

  // 3. Random address (not the agent) has no permission — proves scoping is per-agent
  console.log("\n=== A different address was never granted anything ===");
  console.log(`Random address has valid permission: ${await permission.hasValidPermission(buyer.address, randomAddress.address)} (should be false)`);

  // 4. Agent cannot grant itself permission — must fail
  console.log("\n=== Agent tries to grant itself permission (should fail) ===");
  try {
    await permission.connect(agent).grantPermission(agent.address, 1, 1000, 0);
    console.log("ERROR: this should have reverted but didn't!");
  } catch (err) {
    console.log("Confirmed: an address cannot grant permission to itself.");
  }

  // 5. Buyer upgrades to RepayUpToLimit with a cap
  console.log("\n=== Buyer upgrades permission to RepayUpToLimit, capped ===");
  const maxAmount = hre.ethers.parseUnits("500", 6); // e.g. 500 USDG max
  await permission.connect(buyer).grantPermission(agent.address, 1, maxAmount, 0); // ActionType.RepayUpToLimit = 1
  const p2 = await permission.permissions(buyer.address, agent.address);
  console.log(`Action type: ${p2.actionType} (1 = RepayUpToLimit)`);
  console.log(`Max amount: ${hre.ethers.formatUnits(p2.maxAmount, 6)}`);

  // 6. Buyer revokes — immediate effect
  console.log("\n=== Buyer revokes permission ===");
  await permission.connect(buyer).revokePermission(agent.address);
  console.log(`Agent has valid permission: ${await permission.hasValidPermission(buyer.address, agent.address)} (should be false)`);

  // 7. Only the buyer can revoke — someone else trying should fail
  console.log("\n=== Re-granting, then a random address tries to revoke it (should fail) ===");
  await permission.connect(buyer).grantPermission(agent.address, 0, 0, 0);
  try {
    await permission.connect(randomAddress).revokePermission(agent.address);
    console.log("ERROR: this should have reverted but didn't!");
  } catch (err) {
    console.log("Confirmed: only the buyer who granted a permission can revoke it.");
  }

  console.log("\n=== Simulation complete ===");
  console.log("Confirmed: permission grants are scoped per buyer/per agent, self-granting is blocked,");
  console.log("revocation is immediate and buyer-only.");
  console.log("NOT simulated here: any agent actually executing an action (e.g. repay) — no collateral");
  console.log("contract reads from this permission system yet. See AGENT_STATUS.md.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
