const GATE = artifacts.require("Gate");

module.exports = function (deployer) {
  deployer.deploy(GATE, "0x9a63911a6495d76b36a94025c16847e4e6236b7a");
};
