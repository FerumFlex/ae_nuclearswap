const GATE = artifacts.require("Gate");
const USDT = artifacts.require("USDT");

const AE_TOKEN_ADDRESS = process.env["AE_TOKEN_ADDRESS"];
const ORACLE_ADDRESS = process.env["ORACLE_ADDRESS"];

module.exports = async function (deployer, network) {
  await deployer.deploy(GATE, ORACLE_ADDRESS);
  let usdtInstance = await USDT.deployed();
  let gateInstance = await GATE.deployed();
  await gateInstance.addBridge(usdtInstance.address, "ak_" + AE_TOKEN_ADDRESS.substr(3))
};
