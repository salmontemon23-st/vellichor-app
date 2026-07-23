// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title VellichorAuthenticityRegistry
/// @notice Records a human authentication attestation for a bottle before it is minted
///         into VellichorVault.
/// @dev Deliberately NOT connected on-chain to VellichorVault — redeploying
///      VellichorVault to add that dependency would orphan its existing live listing
///      history. "Authenticated before minted" is enforced as a workflow/UI rule in
///      the internal admin tool (checking isAttested(bottleId) before enabling
///      listBottle()), not as a contract-level requirement.
///
///      bottleId here is whatever staged/draft ID the admin tool is tracking for a
///      bottle at intake time, since the bottle doesn't exist in VellichorVault yet
///      at the point authentication happens. The admin tool is responsible for
///      passing that same ID to VellichorVault.listBottle() afterward so the
///      attestation and the real on-chain bottle line up — this contract has no way
///      to verify that coordination itself.
contract VellichorAuthenticityRegistry is AccessControl {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Attestation {
        string notes;
        address attestedBy;
        uint256 timestamp;
    }

    mapping(uint256 => Attestation) public attestations;

    /// @notice Whether a bottleId has a recorded attestation. This is the exact check
    ///         the admin tool gates Step 3 (mint) on.
    mapping(uint256 => bool) public isAttested;

    event AttestationRecorded(uint256 indexed bottleId, address indexed attestedBy, uint256 timestamp);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AUDITOR_ROLE, admin);
    }

    /// @notice Record an authentication attestation for a bottle.
    function recordAttestation(uint256 bottleId, string calldata notes) external onlyRole(AUDITOR_ROLE) {
        attestations[bottleId] = Attestation({ notes: notes, attestedBy: msg.sender, timestamp: block.timestamp });
        isAttested[bottleId] = true;
        emit AttestationRecorded(bottleId, msg.sender, block.timestamp);
    }
}
