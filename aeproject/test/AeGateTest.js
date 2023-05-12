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
  let provider = new HDWalletProvider(mnemonic, 'http://127.0.0.1:8545');
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
  let nonce = 0;
  let amount = 10000000;
  const wait_time = 2000;
  let fee = 0;

  before(async () => {
    provider = createProvider()
    web3 = createWeb3(provider);
    accounts = await web3.eth.getAccounts();
    oracle = accounts[1].toLowerCase();
    fakeOracle = accounts[2].toLowerCase();

    aeSdk = await utils.getSdk();

    const fileSystemToken = utils.getFilesystem(TOKEN_SOURCE);
    const sourceToken = utils.getContractContent(TOKEN_SOURCE);
    contractToken = await aeSdk.initializeContract({ sourceCode: sourceToken, fileSystem: fileSystemToken });
    await contractToken.init("USDT", 6, "USDT");

    const fileSystemGate = utils.getFilesystem(GATE_SOURCE);
    const sourceGate = utils.getContractContent(GATE_SOURCE);
    contractGate = await aeSdk.initializeContract({ sourceCode: sourceGate, fileSystem: fileSystemGate });
    await contractGate.init(Buffer.from(oracle.substr(2), "hex"));
    fee = (await contractGate.get_fee()).decodedResult;

    mainAddress = await utils.getDefaultAccounts()[0].address;
    secondAddress = await utils.getDefaultAccounts()[1].address;

    await contractToken.mint(mainAddress, amount * 100);
    await contractToken.set_owner("ak_" + contractGate.$options.address.substr(3));

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
    provider.engine.stop();
  });

  it("claim -> success -> claim(x)", async() => {
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.$options.address.substr(3);
    let sender = accounts[0];
    let recipient = secondAddress;
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce);
    let signature = await testUtils.getSignature(web3, oracle, swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);

    // chekk hshes are equal
    let hash = await web3.eth.accounts.hashMessage(swapId);
    let hashCalcResult = await contractGate.get_unsigned_msg(swapId);
    let hashCalc = "0x" + Buffer.from(hashCalcResult.decodedResult).toString('hex');
    assert.equal(hash, hashCalc);

    let result = await contractGate.claim(
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

    result = await contractToken.balance(secondAddress);
    assert.equal(result.decodedResult, amount);

    // claim second time
    try {
      await contractGate.claim(
        swapId,
        Buffer.from(fromToken.substr(2), "hex"),
        toToken,
        Buffer.from(sender.substr(2), "hex"),
        recipient,
        amount,
        nonce,
        convertedSignature,
      );
      assert.equal(1, 0, "Should not get there");
    } catch(error) {
      assert.equal(error.message, 'Invocation failed: "Swap should not be used"');
    }
  });

  it("claim -> fail wrong signer(x)", async() => {
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.$options.address.substr(3);
    let sender = accounts[0];
    let recipient = secondAddress;
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce);
    let signature = await testUtils.getSignature(web3, fakeOracle, swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);

    try {
      await contractGate.claim(
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

  it("claim -> fail wrong swapId(x)", async() => {
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.$options.address.substr(3);
    let sender = accounts[0];
    let recipient = mainAddress;
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount - 1, nonce);
    let signature = await testUtils.getSignature(web3, accounts[2].toLowerCase(), swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);

    try {
      await contractGate.claim(
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

  it("fund -> sign -> cancel(x)", async() => {
    let fromToken = contractToken.$options.address;
    let toToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let recipient = "0x13cd6b3B1e9ccC18dC47E41785A613CA9725ccBC";
    let amount = 10000000n;
    let nonce = 1;
    let initialBalance = (await contractToken.balance(mainAddress)).decodedResult;

    let result = await contractGate.add_bridge(fromToken, toToken);
    assert.equal(result.result.returnType, 'ok');

    result = await contractToken.create_allowance("ak_" + contractGate.$options.address.substr(3), amount * 10n);
    assert.equal(result.result.returnType, 'ok');

    const unix = (+new Date() + wait_time);
    result = await contractGate.fund(fromToken, toToken, recipient, amount, ++nonce, unix, {amount: fee});
    assert.equal(result.result.returnType, 'ok');
    assert.equal(result.decodedEvents[0].name, 'FundEvent');

    const swapId = "0x" + Buffer.from(result.decodedResult).toString("hex");

    let balance = (await contractToken.balance(mainAddress)).decodedResult;
    assert.equal(balance + amount, initialBalance, "Should withdraw some funds");

    let contractBalance = (await contractToken.balance("ak_" + contractGate.$options.address.substr(3))).decodedResult;
    assert.equal(contractBalance, amount, "Contract should have funds");

    let signature = await testUtils.getSignature(web3, oracle, swapId);
    let convertedSignature = testUtils.ethSignatureToAe(signature);
    result = await contractGate.sign(swapId, convertedSignature);
    assert.equal(result.result.returnType, 'ok');
    assert.equal(result.decodedEvents[0].name, 'SwapSigned');

    contractBalance = (await contractToken.balance("ak_" + contractGate.$options.address.substr(3))).decodedResult;
    assert.equal(contractBalance, 0n, "Should burn amount");

    try {
      await contractGate.fund_cancel(swapId);
      assert.equal(1, 0, "Should not get there");
    } catch(error) {
      assert.equal(error.message, 'Invocation failed: "refundable: already withdrawn"');
    }
  });

  it("fund -> cancel -> sign(x)", async() => {
    let fromToken = contractToken.$options.address;
    let toToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let recipient = "0x13cd6b3B1e9ccC18dC47E41785A613CA9725ccBC";
    let amount = 10000000n;
    let nonce = 1;
    let initialBalance = (await contractToken.balance(mainAddress)).decodedResult;

    let result = await contractGate.add_bridge(fromToken, toToken);
    assert.equal(result.result.returnType, 'ok');

    result = await contractToken.create_allowance("ak_" + contractGate.$options.address.substr(3), amount * 10n);
    assert.equal(result.result.returnType, 'ok');

    const unix = (+new Date() + wait_time);
    result = await contractGate.fund(fromToken, toToken, recipient, amount, ++nonce, unix, {amount: fee});

    const swapId = "0x" + Buffer.from(result.decodedResult).toString("hex");

    let balance = (await contractToken.balance(mainAddress)).decodedResult;
    assert.equal(balance + amount, initialBalance, "Should withdraw some funds");

    let contractBalance = (await contractToken.balance("ak_" + contractGate.$options.address.substr(3))).decodedResult;
    assert.equal(contractBalance, amount, "Contract should have funds");

    try {
      await contractGate.fund_cancel(swapId);
      assert.equal(1, 0, "Should not get there");
    } catch(error) {
      assert.equal(error.message, 'Invocation failed: "refundable: endtime not yet passed"');
    }

    await testUtils.delay(wait_time);

    // just mine transaction to increase timer
    result = await contractToken.change_allowance("ak_" + contractGate.$options.address.substr(3), amount * 10n);
    assert.equal(result.result.returnType, 'ok');

    result = await contractGate.fund_cancel(swapId);
    assert.equal(result.result.returnType, 'ok');

    balance = (await contractToken.balance(mainAddress)).decodedResult;
    assert.equal(balance, initialBalance, "Should matches balance as with revert changes");

    try {
      let signature = await testUtils.getSignature(web3, oracle, swapId);
      let convertedSignature = testUtils.ethSignatureToAe(signature);
      await contractGate.sign(swapId, convertedSignature);
    } catch(error) {
      assert.equal(error.message, 'Invocation failed: "withdrawable: already refunded"');
    }
  });

  it("set fee -> get fee -> set fee(x)(wrong acc)", async() => {
    let newFee = 20_000_000_000_000_000;
    let fee = (await contractGate.get_fee()).decodedResult;
    assert.notEqual(fee, newFee);

    let result = await contractGate.set_fee(newFee);
    assert.equal(result.result.returnType, 'ok');

    fee = (await contractGate.get_fee()).decodedResult;
    assert.equal(fee, newFee);

    try {
      let accounts = utils.getDefaultAccounts();
      await contractGate.set_fee(newFee, {onAccount: accounts[1]});
      assert.equal(1, 0, "Should not get there");
    } catch (error) {
      assert.equal(error.message, `Invocation failed: "ONLY_OWNER_CALL_ALLOWED"`);
    }
  });
});
