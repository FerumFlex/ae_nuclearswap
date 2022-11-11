const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');
const TOKEN_SOURCE = './contracts/FungibleTokenFull.aes';
const GATE_SOURCE = './contracts/Gate.aes';
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const testUtils = require("./utils");

require('dotenv').config();

function createProvider() {
  const mnemonic = process.env["MNEMONIC"];
  let provider = new HDWalletProvider(mnemonic, 'http://127.0.0.1:7545');
  return provider;
}

function createWeb3(provider) {
  const web3 = new Web3(provider);
  return web3;
}

describe('Gate', () => {
  let aeSdk;
  let contractToken;
  let contractGate;
  let mainAddress;
  let secondAddress;
  let provider;
  let web3;
  let accounts;
  let oracle;
  let fakeOracle;

  before(async () => {
    provider = createProvider()
    web3 = createWeb3(provider);
    accounts = await web3.eth.getAccounts();
    oracle = accounts[1].toLowerCase();
    fakeOracle = accounts[2].toLowerCase();

    aeSdk = await utils.getSdk();

    const fileSystemToken = utils.getFilesystem(TOKEN_SOURCE);
    const sourceToken = utils.getContractContent(TOKEN_SOURCE);
    contractToken = await aeSdk.getContractInstance({ source: sourceToken, fileSystem: fileSystemToken });
    await contractToken.deploy(["USDT", 6, "USDT"]);

    const fileSystemGate = utils.getFilesystem(GATE_SOURCE);
    const sourceGate = utils.getContractContent(GATE_SOURCE);
    contractGate = await aeSdk.getContractInstance({ source: sourceGate, fileSystem: fileSystemGate });
    await contractGate.deploy([Buffer.from(oracle.substr(2), "hex")]);

    await contractToken.methods.set_owner("ak_" + contractGate.deployInfo.address.substr(3));

    mainAddress = await utils.getDefaultAccounts()[0].address();
    secondAddress = await utils.getDefaultAccounts()[1].address();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
    provider.engine.stop();
  });

  it("get initial balance", async () => {
    const result = await contractToken.methods.balance(mainAddress);
    assert.equal(result.decodedResult, undefined)
  });

  it("claim -> success", async() => {
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.deployInfo.address.substr(3);
    let sender = accounts[0];
    let recipient = secondAddress;
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce);
    let signature = await testUtils.getSignature(web3, oracle, swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);

    // chekk hshes are equal
    let hash = await web3.eth.accounts.hashMessage(swapId);
    let hashCalcResult = await contractGate.methods.get_unsigned_msg(swapId);
    let hashCalc = "0x" + Buffer.from(hashCalcResult.decodedResult).toString('hex');
    assert.equal(hash, hashCalc);

    let result = await contractGate.methods.claim(
      swapId,
      Buffer.from(fromToken.substr(2), "hex"),
      toToken,
      Buffer.from(sender.substr(2), "hex"),
      recipient,
      amount,
      nonce,
      convertedSignature,
    );
    assert.equal(result.result.returnType, "ok");

    result = await contractToken.methods.balance(secondAddress);
    assert.equal(result.decodedResult, amount);
  });

  it("claim -> fail wrong signer", async() => {
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.deployInfo.address.substr(3);
    let sender = accounts[0];
    let recipient = secondAddress;
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce);
    let signature = await testUtils.getSignature(web3, fakeOracle, swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);

    try {
      await contractGate.methods.claim(
        swapId,
        Buffer.from(fromToken.substr(2), "hex"),
        toToken,
        Buffer.from(sender.substr(2), "hex"),
        recipient,
        amount,
        nonce,
        convertedSignature,
      );
      assert.equal(1 == 0, "Should raise an excaption");
    } catch(error) {
      assert.equal(error.message, 'Invocation failed: "Signature is not valid"');
    }
  });

  it("claim -> fail wrong swapId", async() => {
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.deployInfo.address.substr(3);
    let sender = accounts[0];
    let recipient = mainAddress;
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount - 1, nonce);
    let signature = await testUtils.getSignature(web3, accounts[2].toLowerCase(), swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);

    try {
      await contractGate.methods.claim(
        swapId,
        Buffer.from(fromToken.substr(2), "hex"),
        toToken,
        Buffer.from(sender.substr(2), "hex"),
        recipient,
        amount,
        nonce,
        convertedSignature,
      );
      assert.equal(1 == 0, "Should raise an excaption");
    } catch(error) {
      assert.equal(error.message, 'Invocation failed: "Swap_id is not valid"');
    }
  });
});
