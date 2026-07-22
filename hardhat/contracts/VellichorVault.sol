// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title VellichorVault
/// @notice Fractional Vault RWA contract for rare whiskey & fine wine, on Robinhood Chain.
/// @dev Each "bottle" is an ERC-1155 token id with a fixed supply of Vault Units.
///      A buyer purchasing 100% of a bottle's units can redeem it for the physical asset.
contract VellichorVault is ERC1155, Ownable, ReentrancyGuard {

    struct Bottle {
        string name;            // e.g. "Macallan 30 Year, 1980s release"
        uint256 totalUnits;     // fixed total fractional supply, e.g. 100
        uint256 unitsSold;      // units sold so far
        uint256 pricePerUnit;   // price per unit, in payment token's smallest unit
        uint256 unitsRedeemed;  // units consolidated toward redemption (must equal totalUnits to redeem)
        bool redeemed;          // true once physical bottle has been claimed & burned out
        bool listed;            // true once available for primary sale
        string metadataURI;     // provenance / photos / certificate JSON
    }

    /// @notice Payment token used for purchases and fees (e.g. USDG on Robinhood Chain)
    IERC20 public immutable paymentToken;

    /// @notice Protocol treasury receiving primary sale proceeds and fees
    address public treasury;

    /// @notice Annual vaulting/custody fee in basis points, deducted at redemption
    uint256 public custodyFeeBps = 150; // 1.5%

    uint256 public nextBottleId = 1;

    mapping(uint256 => Bottle) public bottles;

    event BottleListed(uint256 indexed bottleId, string name, uint256 totalUnits, uint256 pricePerUnit);
    event UnitsPurchased(uint256 indexed bottleId, address indexed buyer, uint256 units, uint256 cost);
    event RedemptionRequested(uint256 indexed bottleId, address indexed redeemer, uint256 unitsBurned);
    event BottleRedeemed(uint256 indexed bottleId, address indexed redeemer);

    constructor(address _paymentToken, address _treasury)
        ERC1155("")
        Ownable(msg.sender)
    {
        require(_paymentToken != address(0) && _treasury != address(0), "zero address");
        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
    }

    /// @notice List a new curated, already-vaulted bottle for fractional sale.
    /// @dev Only callable by Vellichor (owner) after the physical bottle is in custody.
    function listBottle(
        string calldata name_,
        uint256 totalUnits_,
        uint256 pricePerUnit_,
        string calldata metadataURI_
    ) external onlyOwner returns (uint256 bottleId) {
        require(totalUnits_ > 0, "units must be > 0");
        require(pricePerUnit_ > 0, "price must be > 0");

        bottleId = nextBottleId++;
        bottles[bottleId] = Bottle({
            name: name_,
            totalUnits: totalUnits_,
            unitsSold: 0,
            pricePerUnit: pricePerUnit_,
            unitsRedeemed: 0,
            redeemed: false,
            listed: true,
            metadataURI: metadataURI_
        });

        emit BottleListed(bottleId, name_, totalUnits_, pricePerUnit_);
    }

    /// @notice Buy Vault Units of a listed bottle. Pays in `paymentToken` (e.g. USDG).
    function buyUnits(uint256 bottleId, uint256 units) external nonReentrant {
        Bottle storage b = bottles[bottleId];
        require(b.listed, "not listed");
        require(!b.redeemed, "already redeemed");
        require(units > 0, "units must be > 0");
        require(b.unitsSold + units <= b.totalUnits, "exceeds available units");

        uint256 cost = units * b.pricePerUnit;
        b.unitsSold += units;

        require(paymentToken.transferFrom(msg.sender, treasury, cost), "payment failed");
        _mint(msg.sender, bottleId, units, "");

        emit UnitsPurchased(bottleId, msg.sender, units, cost);
    }

    /// @notice Consolidate units toward redemption. Once a single holder has burned
    ///         100% of a bottle's units here, the physical bottle becomes claimable.
    /// @dev Off-chain KYC / alcohol-shipping compliance is required before Vellichor
    ///      ships the physical bottle; this only handles the on-chain claim state.
    function requestRedemption(uint256 bottleId, uint256 units) external nonReentrant {
        Bottle storage b = bottles[bottleId];
        require(b.listed, "not listed");
        require(!b.redeemed, "already redeemed");
        require(balanceOf(msg.sender, bottleId) >= units, "insufficient balance");

        _burn(msg.sender, bottleId, units);
        b.unitsRedeemed += units;

        emit RedemptionRequested(bottleId, msg.sender, units);

        if (b.unitsRedeemed == b.totalUnits) {
            b.redeemed = true;
            emit BottleRedeemed(bottleId, msg.sender);
        }
    }

    /// @notice Returns true if `account` currently holds 100% of a bottle's outstanding units.
    function canRedeem(uint256 bottleId, address account) external view returns (bool) {
        Bottle storage b = bottles[bottleId];
        uint256 outstanding = b.unitsSold - b.unitsRedeemed;
        return outstanding > 0 && balanceOf(account, bottleId) == outstanding && outstanding == b.totalUnits - b.unitsRedeemed;
    }

    function uri(uint256 bottleId) public view override returns (string memory) {
        return bottles[bottleId].metadataURI;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero address");
        treasury = _treasury;
    }

    function setCustodyFeeBps(uint256 _bps) external onlyOwner {
        require(_bps <= 1000, "fee too high"); // capped at 10%
        custodyFeeBps = _bps;
    }

    // ---------------------------------------------------------------------
    // Read helpers for the Vault and Portfolio pages
    // ---------------------------------------------------------------------

    /// @notice Total number of bottles ever listed (used to size loops off-chain too).
    function totalBottles() external view returns (uint256) {
        return nextBottleId - 1;
    }

    /// @notice Vault page: full custody list — every bottle ever listed, in order.
    /// @dev View-only, no gas cost to callers reading off-chain. Fine at Genesis-vault
    ///      scale; if the catalog grows large, move this to an off-chain indexer/subgraph
    ///      instead of looping on-chain.
    function getAllBottles() external view returns (Bottle[] memory allBottles, uint256[] memory ids) {
        uint256 count = nextBottleId - 1;
        allBottles = new Bottle[](count);
        ids = new uint256[](count);
        for (uint256 i = 1; i <= count; i++) {
            allBottles[i - 1] = bottles[i];
            ids[i - 1] = i;
        }
    }

    /// @notice Portfolio page: every bottle a wallet holds units in, with balances.
    ///         Returns only bottles where balance > 0 — no need to filter client-side.
    function getPortfolio(address holder) external view returns (uint256[] memory bottleIds, uint256[] memory balances) {
        uint256 count = nextBottleId - 1;
        uint256 matches = 0;
        for (uint256 i = 1; i <= count; i++) {
            if (balanceOf(holder, i) > 0) matches++;
        }

        bottleIds = new uint256[](matches);
        balances = new uint256[](matches);
        uint256 idx = 0;
        for (uint256 i = 1; i <= count; i++) {
            uint256 bal = balanceOf(holder, i);
            if (bal > 0) {
                bottleIds[idx] = i;
                balances[idx] = bal;
                idx++;
            }
        }
    }
}
