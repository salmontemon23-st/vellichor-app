// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VellichorMarket
/// @notice Secondary marketplace for Vellichor Vault Units (VellichorVault ERC-1155).
/// @dev Units are escrowed in this contract while listed, and released to the buyer
///      on purchase. All payment happens in the same payment token as primary sale
///      (USDG on Robinhood Chain). Primary sale (Vellichor selling never-before-sold
///      units) is handled separately by VellichorVault.buyUnits(); this contract only
///      handles unit-holder-to-unit-holder resale.
contract VellichorMarket is ERC1155Holder, Ownable, ReentrancyGuard {

    struct Listing {
        address seller;
        uint256 bottleId;
        uint256 unitsForSale;
        uint256 pricePerUnit;   // in paymentToken's smallest unit (e.g. USDG, 6 decimals)
        bool active;
    }

    /// @notice The Vellichor Vault Unit contract (ERC-1155)
    IERC1155 public immutable vault;

    /// @notice Payment token — USDG on Robinhood Chain
    IERC20 public immutable paymentToken;

    /// @notice Protocol treasury receiving marketplace fees
    address public treasury;

    /// @notice Marketplace fee in basis points, charged to the buyer on top of listing price
    uint256 public marketFeeBps = 200; // 2%

    uint256 public nextListingId = 1;

    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed seller, uint256 indexed bottleId, uint256 units, uint256 pricePerUnit);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 units, uint256 totalPaid);
    event ListingCancelled(uint256 indexed listingId);
    event ListingUpdated(uint256 indexed listingId, uint256 newPricePerUnit);

    constructor(address _vault, address _paymentToken, address _treasury) Ownable(msg.sender) {
        require(_vault != address(0) && _paymentToken != address(0) && _treasury != address(0), "zero address");
        vault = IERC1155(_vault);
        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
    }

    /// @notice List Vault Units for resale. Units are escrowed in this contract
    ///         until sold or cancelled — caller must have approved this contract
    ///         as an ERC-1155 operator beforehand (setApprovalForAll on VellichorVault).
    function listForSale(uint256 bottleId, uint256 units, uint256 pricePerUnit) external nonReentrant returns (uint256 listingId) {
        require(units > 0, "units must be > 0");
        require(pricePerUnit > 0, "price must be > 0");
        require(vault.balanceOf(msg.sender, bottleId) >= units, "insufficient balance");

        vault.safeTransferFrom(msg.sender, address(this), bottleId, units, "");

        listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            bottleId: bottleId,
            unitsForSale: units,
            pricePerUnit: pricePerUnit,
            active: true
        });

        emit Listed(listingId, msg.sender, bottleId, units, pricePerUnit);
    }

    /// @notice Buy some or all units from an active listing. Payment in paymentToken (USDG).
    /// @dev The seller cannot buy their own listing — this prevents wash trading
    ///      (a seller creating fake volume/demand by trading with themselves).
    function buyListing(uint256 listingId, uint256 units) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "listing not active");
        require(msg.sender != l.seller, "cannot buy your own listing");
        require(units > 0 && units <= l.unitsForSale, "invalid unit amount");

        uint256 subtotal = units * l.pricePerUnit;
        uint256 fee = (subtotal * marketFeeBps) / 10000;
        uint256 totalPaid = subtotal + fee;

        l.unitsForSale -= units;
        if (l.unitsForSale == 0) {
            l.active = false;
        }

        require(paymentToken.transferFrom(msg.sender, l.seller, subtotal), "payment to seller failed");
        if (fee > 0) {
            require(paymentToken.transferFrom(msg.sender, treasury, fee), "fee payment failed");
        }

        vault.safeTransferFrom(address(this), msg.sender, l.bottleId, units, "");

        emit Purchased(listingId, msg.sender, units, totalPaid);
    }

    /// @notice Cancel a listing and return the escrowed units to the seller.
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "listing not active");
        require(l.seller == msg.sender, "not seller");

        uint256 unitsToReturn = l.unitsForSale;
        l.unitsForSale = 0;
        l.active = false;

        vault.safeTransferFrom(address(this), msg.sender, l.bottleId, unitsToReturn, "");

        emit ListingCancelled(listingId);
    }

    /// @notice Reprice an active listing.
    function updateListingPrice(uint256 listingId, uint256 newPricePerUnit) external {
        Listing storage l = listings[listingId];
        require(l.active, "listing not active");
        require(l.seller == msg.sender, "not seller");
        require(newPricePerUnit > 0, "price must be > 0");

        l.pricePerUnit = newPricePerUnit;
        emit ListingUpdated(listingId, newPricePerUnit);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero address");
        treasury = _treasury;
    }

    function setMarketFeeBps(uint256 _bps) external onlyOwner {
        require(_bps <= 500, "fee too high"); // capped at 5%
        marketFeeBps = _bps;
    }

    // ---------------------------------------------------------------------
    // Read helpers for the Market and Portfolio pages
    // ---------------------------------------------------------------------

    /// @notice Market page: every currently-active secondary listing, across all bottles.
    /// @dev View-only. Fine at Genesis-vault scale; move to an off-chain indexer if the
    ///      number of listings grows large enough that looping gets expensive to call.
    function getActiveListings() external view returns (Listing[] memory activeListings, uint256[] memory ids) {
        uint256 total = nextListingId - 1;
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active) count++;
        }

        activeListings = new Listing[](count);
        ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active) {
                activeListings[idx] = listings[i];
                ids[idx] = i;
                idx++;
            }
        }
    }

    /// @notice Portfolio page: a wallet's own active listings (what they currently have for sale).
    function getListingsBySeller(address seller) external view returns (Listing[] memory sellerListings, uint256[] memory ids) {
        uint256 total = nextListingId - 1;
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active && listings[i].seller == seller) count++;
        }

        sellerListings = new Listing[](count);
        ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active && listings[i].seller == seller) {
                sellerListings[idx] = listings[i];
                ids[idx] = i;
                idx++;
            }
        }
    }
}
