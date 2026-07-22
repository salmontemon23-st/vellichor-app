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
        string certificateURI;
        bytes32 physicalTagHash;
        string notes;
        address attestedBy;
        uint256 timestamp;
    }

    mapping(uint256 => Attestation) public attestations;

    /// @notice Whether a bottleId has a recorded attestation. This is the exact check
    ///         the admin tool gates Step 3 (mint) on.
    mapping(uint256 => bool) public isAttested;

    event AttestationRecorded(
        uint256 indexed bottleId,
        string certificateURI,
        bytes32 physicalTagHash,
        address indexed attestedBy,
        uint256 timestamp
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AUDITOR_ROLE, admin);
    }

    /// @notice Record an authentication attestation for a bottle. `physicalTagHash` may
    ///         be bytes32(0) — no NFC/RFID hardware exists yet; this field is a
    ///         placeholder for when that hardware exists, not a required input today.
    function recordAttestation(
        uint256 bottleId,
        string calldata certificateURI,
        bytes32 physicalTagHash,
        string calldata notes
    ) external onlyRole(AUDITOR_ROLE) {
        require(bytes(certificateURI).length > 0, "certificate URI required");
        attestations[bottleId] = Attestation({
            certificateURI: certificateURI,
            physicalTagHash: physicalTagHash,
            notes: notes,
            attestedBy: msg.sender,
            timestamp: block.timestamp
        });
        isAttested[bottleId] = true;
        emit AttestationRecorded(bottleId, certificateURI, physicalTagHash, msg.sender, block.timestamp);
    }
}
