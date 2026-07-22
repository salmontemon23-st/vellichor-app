// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Morpho Blue's real oracle interface, confirmed against
///         github.com/morpho-org/morpho-blue (tag v1.0.0) src/interfaces/IOracle.sol —
///         not assumed. `price()` must return the price of 1 asset of collateral
///         token quoted in 1 asset of loan token, scaled by 1e36, i.e. with
///         `36 + loanTokenDecimals - collateralTokenDecimals` decimals of precision.
///         Confirmed live on Robinhood Chain mainnet (chainId 4663) via Morpho's
///         public GraphQL API (api.morpho.org/graphql) against real markets.
interface IOracle {
    function price() external view returns (uint256);
}

/// @title VellichorVaultUnitOracle
/// @notice Price oracle for a wrapped Vault Unit token, for use in a Morpho isolated
///         lending market. Implements Morpho Blue's real `IOracle` interface.
///
/// @dev IMPORTANT — this is a manually-updated oracle, not a decentralized one.
///      Vault Unit trading volume is thin, especially early on, so there's no
///      reliable automated price feed (no Chainlink feed exists for a single
///      collectible bottle's fractional units). The owner (Vellichor team) updates
///      the price manually, sourced from actual recorded trades on
///      VellichorMarket — NOT an arbitrary number.
///
///      This is a real centralization/manipulation risk, flagged deliberately:
///      whoever controls this oracle can misprice the collateral, which could
///      trigger unfair liquidations or let a position stay dangerously
///      under-collateralized. Before real money flows through a Morpho market using
///      this oracle, this contract needs its own security review — a mispriced
///      oracle is a more direct attack surface than almost anything else in this
///      system. Treat this as a stopgap for early-stage/testnet use, not a
///      permanent design.
///
///      SCALING — Morpho's `price()` is NOT "price in the loan token's smallest
///      unit". It must be scaled by 1e(36 + loanTokenDecimals - collateralTokenDecimals).
///      Getting this wrong doesn't fail loudly: the function signature still matches
///      IOracle exactly, so Morpho accepts whatever number comes back and uses it
///      directly for collateral math — a scaling mistake is a silent mispricing, not
///      a revert. To keep the owner-facing update call human-readable (a real USDG
///      price, not an astronomical fixed-point number that invites transcription
///      errors), `updatePrice` takes the price in the loan token's smallest unit
///      per whole wrapped Vault Unit, and `price()` applies the Morpho scaling
///      internally. Wrapped Vault Units always have 0 decimals (see
///      VellichorVaultUnitWrapper.decimals()), which is why collateralTokenDecimals
///      is a hardcoded constant here rather than a constructor argument.
contract VellichorVaultUnitOracle is IOracle, Ownable {

    /// @notice Wrapped Vault Unit decimals — always 0, see VellichorVaultUnitWrapper.
    uint8 public constant COLLATERAL_DECIMALS = 0;

    /// @notice Decimals of the loan token this market borrows (e.g. USDG = 6 on
    ///         Robinhood Chain mainnet). Set once at deploy time to match the
    ///         specific Morpho market this oracle is wired into.
    uint8 public immutable loanTokenDecimals;

    /// @notice Price of one whole wrapped Vault Unit, in the loan token's smallest
    ///         unit (e.g. for USDG at 6 decimals, 1500 USDG = 1_500_000_000). This is
    ///         the human/audit-friendly number the team updates, sourced from actual
    ///         recent VellichorMarket trades — see `price()` for the Morpho-scaled
    ///         value actually returned to Morpho.
    uint256 public priceInLoanToken;

    /// @notice Timestamp of the last price update — lets integrators/borrowers see
    ///         how stale the price might be before trusting it.
    uint256 public lastUpdated;

    event PriceUpdated(uint256 newPriceInLoanToken, uint256 timestamp);

    constructor(uint256 _initialPriceInLoanToken, uint8 _loanTokenDecimals) Ownable(msg.sender) {
        require(_initialPriceInLoanToken > 0, "price must be > 0");
        loanTokenDecimals = _loanTokenDecimals;
        priceInLoanToken = _initialPriceInLoanToken;
        lastUpdated = block.timestamp;
    }

    /// @notice Update the price. Should be called by the team, sourced from actual
    ///         recent trades on VellichorMarket for this bottle — not an arbitrary
    ///         or convenient number. Pass the price in the loan token's smallest
    ///         unit per whole wrapped Vault Unit (e.g. 1_500_000_000 for 1500 USDG).
    function updatePrice(uint256 _newPriceInLoanToken) external onlyOwner {
        require(_newPriceInLoanToken > 0, "price must be > 0");
        priceInLoanToken = _newPriceInLoanToken;
        lastUpdated = block.timestamp;
        emit PriceUpdated(_newPriceInLoanToken, block.timestamp);
    }

    /// @notice Morpho IOracle interface. Returns priceInLoanToken scaled by
    ///         1e(36 - COLLATERAL_DECIMALS) — see the contract-level SCALING note.
    ///         Since COLLATERAL_DECIMALS is always 0 for wrapped Vault Units, this
    ///         is priceInLoanToken * 1e36.
    function price() external view override returns (uint256) {
        return priceInLoanToken * (10 ** (36 - COLLATERAL_DECIMALS));
    }

    /// @notice How many seconds since the last price update — integrators should
    ///         check this and treat a very stale price with caution.
    function staleness() external view returns (uint256) {
        return block.timestamp - lastUpdated;
    }
}
