// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev TEMPORARY testnet stand-in for the payment asset, used only because USDG
///      is not currently available on Robinhood Chain testnet. This mocks a
///      tokenized TSLA Stock Token so the buy/sell and vaulting flow can be tested
///      end-to-end. Two things to fix before this goes anywhere near mainnet:
///        1. On real Robinhood Chain testnet, swap this out for the actual TSLA
///           Stock Token contract address (don't deploy this mock there either —
///           use the real token so prices/behavior match production).
///        2. Before mainnet, VellichorVault / VellichorMarket should be redeployed
///           with USDG (or another stablecoin) as paymentToken, not a volatile
///           stock token — Vault Unit prices are meant to be quoted in stable
///           terms, not in a fluctuating equity token.
contract MockTSLA is ERC20 {
    constructor() ERC20("Mock TSLA Stock Token", "mTSLA") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 18; // standard ERC-20 precision; confirm against the real TSLA Stock Token before testnet use
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
