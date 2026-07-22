// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VellichorVaultUnitWrapper
/// @notice Wraps a single bottle's Vault Units (VellichorVault ERC-1155, one specific
///         bottleId) into a standard ERC-20 token, 1:1. This exists because lending
///         markets like Morpho pair ERC-20 collateral with an ERC-20 loan asset —
///         they don't natively support ERC-1155. Deposit real Vault Units, get
///         wrapped ERC-20 tokens usable as collateral; unwrap anytime to get the
///         real Vault Units back.
/// @dev One wrapper contract per bottleId — deploy a new instance for each bottle
///      that should be collateral-eligible, don't try to make one wrapper handle
///      multiple bottles (that would make the ERC-20 represent a mix of different
///      physical bottles, which breaks the "one unit = fraction of one named bottle"
///      guarantee the whole protocol is built on).
contract VellichorVaultUnitWrapper is ERC20, ERC1155Holder, ReentrancyGuard {

    IERC1155 public immutable vault;
    uint256 public immutable bottleId;

    event Wrapped(address indexed account, uint256 units);
    event Unwrapped(address indexed account, uint256 units);

    constructor(
        address _vault,
        uint256 _bottleId,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        require(_vault != address(0), "zero address");
        vault = IERC1155(_vault);
        bottleId = _bottleId;
    }

    /// @notice Deposit real Vault Units for this bottle, receive wrapped ERC-20 1:1.
    ///         Caller must have approved this contract as an ERC-1155 operator first
    ///         (setApprovalForAll on VellichorVault).
    function wrap(uint256 units) external nonReentrant {
        require(units > 0, "units must be > 0");
        vault.safeTransferFrom(msg.sender, address(this), bottleId, units, "");
        _mint(msg.sender, units);
        emit Wrapped(msg.sender, units);
    }

    /// @notice Burn wrapped ERC-20 tokens, get real Vault Units back 1:1.
    function unwrap(uint256 units) external nonReentrant {
        require(units > 0, "units must be > 0");
        require(balanceOf(msg.sender) >= units, "insufficient wrapped balance");
        _burn(msg.sender, units);
        vault.safeTransferFrom(address(this), msg.sender, bottleId, units, "");
        emit Unwrapped(msg.sender, units);
    }

    /// @notice ERC-20 decimals set to 0 — Vault Units are whole-number units,
    ///         no fractional wrapping (a "half a unit" has no meaning here).
    function decimals() public pure override returns (uint8) {
        return 0;
    }
}
