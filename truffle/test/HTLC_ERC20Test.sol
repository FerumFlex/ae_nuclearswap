// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../contracts/htlc_erc20.sol";

// These files are dynamically created at test time
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract HTLC_ERC20Test {

  function testWriteValue() public {
    // HTLC_ERC20 htlc_erc20 = HTLC_ERC20(DeployedAddresses.htlc_erc20());

    // Assert.equal(simpleStorage.read(), 0, "Contract should have 0 stored");
    // simpleStorage.write(1);
    // Assert.equal(simpleStorage.read(), 1, "Contract should have 1 stored");
    // simpleStorage.write(2);
    // Assert.equal(simpleStorage.read(), 2, "Contract should have 2 stored");
  }
}
