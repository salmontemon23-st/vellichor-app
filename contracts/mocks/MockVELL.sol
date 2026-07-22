// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Local stand-in for $VELL, used ONLY for testing VellichorGovernance before
///      the real $VELL token exists (it launches separately via Virtuals Protocol
///      Genesis Launch — see vellichor-vell-token.md). Once $VELL is actually live,
///      VellichorGovernance should be deployed pointing at the real $VELL address,
///      not this mock. Do not deploy this mock to testnet or mainnet.
contract MockVELL is ERC20 {
    constructor() ERC20("Mock Vellichor Token", "mVELL") {
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals()); // matches the real $VELL's planned 1B supply
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
