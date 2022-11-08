const GATE = artifacts.require("Gate");
const USDT = artifacts.require("USDT");
const crypto = require('crypto');


function delay(ms) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

function sha256hash(str_or_buffer) {
  return "0x" + sha256(str_or_buffer).digest("hex");
}

function sha256(str_or_buffer) {
  return crypto.createHash('sha256').update(str_or_buffer);
}

function encodePacked(web3, ...args) {
  return Buffer.from(
    web3.utils.encodePacked(...args).substr(2),
    "hex"
  )
}

function getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce) {
  let result = sha256hash(
    encodePacked(
      web3,
      {value: fromToken, type: "address"},
      {value: sha256hash(encodePacked(web3, {value: toToken, type: "string"})), type: "bytes32"},
      {value: sender, type: "address"},
      {value: sha256hash(encodePacked(web3, {value: recipient, type: "string"})), type: "bytes32"},
      {value: sha256hash(encodePacked(web3, {value: amount.toString(), type: "string"})), type: "bytes32"},
      {value: sha256hash(encodePacked(web3, {value: nonce.toString(), type: "string"})), type: "bytes32"}
    )
  );
  return result;
}

async function getSignature(web3, account, swapId) {
  let message = swapId;
  let hash = await web3.eth.personal.sign(message, account);
  return hash;
}

contract("GATE", (accounts) => {
  let usdtInstance;
  let balanceOriginal;
  let gateInstance;
  const amount = web3.utils.toBN(10 * 10 ** 6);
  const aeTokenAddress = "ak_2FYNeoVoxz2jCvaautM12HtuhXoRbA3ZtjfCtX98AaqpAK4rzM";
  const aeAddress = "ak_ZdF4zFqkaUjM5QqkefgvWS9PhRyyMFgdhMy9dgZFAqU9Ayp53";
  let nonce = 0;

  beforeEach(async () => {
    gateInstance = await GATE.deployed();
    usdtInstance = await USDT.deployed();

    await usdtInstance.approve(gateInstance.address, amount);
    balanceOriginal = await usdtInstance.balanceOf(accounts[0]);

    await gateInstance.setOracle(accounts[1]);
  });

  it("should allow gate oracle", async() => {
    const oracle = await gateInstance.getOracle();
    assert.equal(oracle, accounts[1]);
  });

  it("fund -> sign account", async() => {
    let result = await gateInstance.fund(usdtInstance.address, aeTokenAddress, aeAddress, amount, ++nonce);
    console.log("Contract params", [
      usdtInstance.address,
      aeTokenAddress,
      accounts[0],
      aeAddress,
      amount,
      nonce,
    ]);

    // get swap id
    let swapId = result.receipt.logs[0].args.swapId;

    // compare calc swapid and result swap id
    let calcSwapId = getSwapId(
      web3,
      usdtInstance.address,
      aeTokenAddress,
      accounts[0],
      aeAddress,
      amount,
      nonce,
    )
    console.log(`swapId ${swapId}`);
    console.log(`calc swapId ${calcSwapId}`);
    assert.equal(swapId, calcSwapId);

    // sign
    let signature = await getSignature(web3, accounts[1], swapId);
    console.log(`signature ${signature}`);
    result = await gateInstance.sign(swapId, signature);
    // let signer = await web3.eth.personal.ecRecover(message, hash);
    assert.equal(result.logs[0].event, 'SwapSigned');
  });

  it("fund -> wrong sign account", async() => {
    let result = await gateInstance.fund(usdtInstance.address, aeTokenAddress, aeAddress, amount, ++nonce);

    let swapId = result.receipt.logs[0].args.swapId;

    let signature = await getSignature(web3, accounts[2], swapId);

    result = await gateInstance.sign(swapId, signature);
    assert.equal(result.receipt.name, 'RuntimeError');
  });

});