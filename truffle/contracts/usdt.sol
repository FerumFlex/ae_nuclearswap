// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDT is ERC20 {
    constructor() ERC20("USDT", "USDT") {
        _mint(msg.sender, 10000000000);
    }

    function mint(address account, uint256 amount) public virtual {
        _mint(account, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
