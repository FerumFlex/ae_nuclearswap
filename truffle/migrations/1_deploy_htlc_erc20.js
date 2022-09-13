const HTLC_ERC20 = artifacts.require("HTLC_ERC20");

module.exports = function (deployer) {
  deployer.deploy(HTLC_ERC20);
};
