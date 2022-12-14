const GATE = artifacts.require("Gate");
const USDT = artifacts.require("USDT");

const TO_TOKENS = {
  "development": "ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C",
  "goerli": "ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C",
  "goerli-fork": "ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C",
}

module.exports = async function (deployer, network) {
  await deployer.deploy(GATE, "0x9a63911a6495d76b36a94025c16847e4e6236b7a");
  let usdtInstance = await USDT.deployed();
  let gateInstance = await GATE.deployed();
  await gateInstance.addBridge(usdtInstance.address, "ak_" + TO_TOKENS[network].substr(3))
};
