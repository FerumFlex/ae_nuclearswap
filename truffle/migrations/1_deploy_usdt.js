const GATE = artifacts.require("Gate");
const USDT = artifacts.require("USDT");

const AE_TOKEN_ADDRESS = process.env["AE_TOKEN_ADDRESS"] || "ak_2FYNeoVoxz2jCvaautM12HtuhXoRbA3ZtjfCtX98AaqpAK4rzM";
const ORACLE_ADDRESS = process.env["ORACLE_ADDRESS"] || "0x65EadB2007Fe35291feA96D8246D569FEA2628c0";

module.exports = async function (deployer, network) {
  let usdtAddress;
  let oracleAddress;
  if (network === "arbitrum") {
    usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
    oracleAddress = "0x8F918586255bF2CCA9405c3B64227a757efa0579";
  } else {
    oracleAddress = ORACLE_ADDRESS;
    await deployer.deploy(USDT);
    let usdtInstance = await USDT.deployed();
    usdtAddress = usdtInstance.address;
  }
  await deployer.deploy(GATE, oracleAddress);
  let gateInstance = await GATE.deployed();
  await gateInstance.addBridge(usdtAddress, "ak_" + AE_TOKEN_ADDRESS.substr(3))
};
