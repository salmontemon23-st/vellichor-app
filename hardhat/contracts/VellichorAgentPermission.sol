// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VellichorAgentPermission
/// @notice SKELETON / FRAMEWORK ONLY — not a finished, audited, or live system.
///         Lets a buyer grant a scoped, revocable permission to an AI agent address
///         to act ONLY on their own collateral position, and ONLY within the bounds
///         they set. This is the on-chain half of the "buyer-scoped AI agent" concept
///         (see vellichor-collateral-agent-concept.md) — it does not include the
///         agent itself (off-chain logic, Virtuals GAME framework integration, etc.),
///         just the permission boundary the agent would have to operate within.
///
/// @dev CRITICAL DESIGN BOUNDARY: an agent granted permission here can NEVER touch
///      Vellichor's treasury, NEVER call team/owner-only functions on
///      VellichorVault.sol, VellichorMarket.sol, or VellichorGovernance.sol, and
///      NEVER act on any wallet other than the one that granted it permission. This
///      contract only tracks per-buyer, per-agent, per-action-type permission grants
///      — it does not itself execute anything against VellichorVaultUnitWrapper,
///      the Morpho market, or any collateral position. Wiring this up to actually
///      DO something (e.g. call repay() on a buyer's behalf) is a separate,
///      not-yet-built step — see the open questions in
///      vellichor-collateral-agent-concept.md, especially the unresolved
///      alert-only-vs-execute decision, before building that part.
///
/// @dev STATUS: skeleton only. Not integrated with any collateral contract. Not
///      audited. Not exposed in the app. See AGENT_STATUS.md.
contract VellichorAgentPermission {

    /// @notice What an agent is allowed to do, if a buyer grants it. Deliberately
    ///         narrow and explicit — no open-ended "do anything" permission exists.
    enum ActionType {
        MonitorOnly,           // agent can read the buyer's position and alert them; cannot execute anything
        RepayUpToLimit         // agent can call repay() on the buyer's behalf, capped at maxAmount, until revoked
    }

    struct Permission {
        bool active;
        ActionType actionType;
        uint256 maxAmount;      // meaning depends on actionType; 0 for MonitorOnly
        uint256 grantedAt;
        uint256 expiresAt;      // 0 = no expiry, but buyer can still revoke anytime
    }

    /// @notice buyer => agent address => permission. A buyer can grant different
    ///         agents different scopes; there is no global "the agent" — every
    ///         grant is explicit, per buyer, per agent.
    mapping(address => mapping(address => Permission)) public permissions;

    event PermissionGranted(address indexed buyer, address indexed agent, ActionType actionType, uint256 maxAmount, uint256 expiresAt);
    event PermissionRevoked(address indexed buyer, address indexed agent);

    /// @notice Grant an agent a scoped permission over the caller's own position.
    ///         Only the buyer themselves can call this — an agent cannot grant
    ///         itself permission, and nobody can grant permission on another
    ///         buyer's behalf.
    function grantPermission(
        address agent,
        ActionType actionType,
        uint256 maxAmount,
        uint256 expiresAt
    ) external {
        require(agent != address(0), "zero address");
        require(agent != msg.sender, "cannot grant permission to yourself");

        permissions[msg.sender][agent] = Permission({
            active: true,
            actionType: actionType,
            maxAmount: maxAmount,
            grantedAt: block.timestamp,
            expiresAt: expiresAt
        });

        emit PermissionGranted(msg.sender, agent, actionType, maxAmount, expiresAt);
    }

    /// @notice Revoke a previously granted permission. Only the buyer who granted
    ///         it can revoke it — immediate effect, no delay, no agent override.
    function revokePermission(address agent) external {
        require(permissions[msg.sender][agent].active, "no active permission");
        permissions[msg.sender][agent].active = false;
        emit PermissionRevoked(msg.sender, agent);
    }

    /// @notice Check whether an agent currently holds a valid, unexpired permission
    ///         for a given buyer. Any future contract that lets an agent act on a
    ///         buyer's behalf should check this before allowing anything.
    function hasValidPermission(address buyer, address agent) external view returns (bool) {
        Permission memory p = permissions[buyer][agent];
        if (!p.active) return false;
        if (p.expiresAt != 0 && block.timestamp > p.expiresAt) return false;
        return true;
    }
}
