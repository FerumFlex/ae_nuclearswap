const utils = require("./utils");
const GATE = artifacts.require("Gate");
const USDT = artifacts.require("USDT");


contract("GATE", (accounts) => {
  let usdtInstance;
  let gateInstance;
  const amount = web3.utils.toBN(10 * 10 ** 6);
  const aeTokenAddress = "ak_2FYNeoVoxz2jCvaautM12HtuhXoRbA3ZtjfCtX98AaqpAK4rzM";
  const aeAddress = "ak_ZdF4zFqkaUjM5QqkefgvWS9PhRyyMFgdhMy9dgZFAqU9Ayp53";
  let nonce = 0;
  const wait_time = 2000;

  console.log("Accounts:", accounts);

  beforeEach(async () => {
    gateInstance = await GATE.deployed();
    usdtInstance = await USDT.deployed();

    await gateInstance.addBridge(usdtInstance.address, aeTokenAddress)
    await usdtInstance.approve(gateInstance.address, amount);
    balanceOriginal = await usdtInstance.balanceOf(accounts[0]);

    await gateInstance.setOracle(accounts[1]);
  });

  it("get oracle", async() => {
    const oracle = await gateInstance.getOracle();
    assert.equal(oracle, accounts[1]);
  });

  it("fund -> refund", async() => {
    const unix = Math.round((+new Date() + wait_time) / 1000);
    let result = await gateInstance.fund(usdtInstance.address, aeTokenAddress, aeAddress, amount, ++nonce, unix);

    // get swap id
    let swapId = result.receipt.logs[0].args.swapId;

    result = await gateInstance.fundCancel(swapId);
    assert.notEqual(result.receipt.stack.indexOf("refundable: endtime not yet passed"), -1, "refundable: endtime not yet passed");

    await utils.delay(wait_time);

    // create some transaction to mine new block and update Chain.timestamp
    await usdtInstance.transfer(accounts[1], amount);

    result = await gateInstance.fundCancel(swapId);
    assert.equal(result.receipt.status, true);
  });

  it("fund -> sign account", async() => {
    const unix = Math.round((+new Date() + wait_time) / 1000);
    let result = await gateInstance.fund(usdtInstance.address, aeTokenAddress, aeAddress, amount, ++nonce, unix);

    // get swap id
    let swapId = result.receipt.logs[0].args.swapId;

    // compare calc swapid and result swap id
    let calcSwapId = utils.getSwapId(
      web3,
      usdtInstance.address,
      aeTokenAddress,
      accounts[0],
      aeAddress,
      amount,
      nonce,
    )
    assert.equal(swapId, calcSwapId);

    // sign
    let message = swapId;
    let signature = await utils.getSignature(web3, accounts[1], message);
    result = await gateInstance.sign(swapId, signature);
    let signer = await web3.eth.accounts.recover(message, signature);
    assert.equal(signer.toLowerCase(), accounts[1].toLowerCase());
    assert.equal(result.logs[0].event, 'SwapSigned');
  });

  it("fund -> wrong sign account", async() => {
    const unix = Math.round((+new Date() + wait_time) / 1000);
    let result = await gateInstance.fund(usdtInstance.address, aeTokenAddress, aeAddress, amount, ++nonce, unix);

    let swapId = result.receipt.logs[0].args.swapId;

    let signature = await utils.getSignature(web3, accounts[2], swapId);

    result = await gateInstance.sign(swapId, signature);
    assert.equal(result.receipt.name, 'RuntimeError');
  });

  it("fund -> not supported bridge", async() => {
    const unix = Math.round((+new Date() + wait_time) / 1000);
    let result = await gateInstance.fund(usdtInstance.address, aeAddress, aeAddress, amount, ++nonce, unix);
    assert.notEqual(result.receipt.stack.indexOf("revert this bridge does not exists"), -1, "Bridge should not exists");
  });

  it("add bridge -> remove bridge", async() => {
    let bridgeId = await gateInstance.getBridgeId(usdtInstance.address, aeAddress);

    let isExists = await gateInstance.haveBridge(bridgeId);
    assert.equal(isExists, false);

    let result = await gateInstance.addBridge(usdtInstance.address, aeAddress);
    assert.equal(result.receipt.status, true, "Transaction should be success");

    isExists = await gateInstance.haveBridge(bridgeId);
    assert.equal(isExists, true);

    result = await gateInstance.removeBridge(usdtInstance.address, aeAddress);
    assert.equal(result.receipt.status, true, "Transaction should be success");

    isExists = await gateInstance.haveBridge(bridgeId);
    assert.equal(isExists, false);
  });

  it("claim", async() => {
    let fromToken = aeTokenAddress;
    let toToken = usdtInstance.address;
    let sender = aeAddress;
    let recipient = accounts[1];
    let amount = 10000000;
    let nonce = 1;

    let swapId = utils.getSwapIdAe(
      web3,
      fromToken,
      toToken,
      sender,
      recipient,
      amount,
      nonce,
    );

    let balance = await usdtInstance.balanceOf(recipient);
    assert.equal(balance.toString(), "0")

    let result = await usdtInstance.transfer(gateInstance.address, amount);
    assert.equal(result.logs[0].event, 'Transfer');

    balance = await usdtInstance.balanceOf(gateInstance.address);
    assert.equal(balance.toString(), amount.toString());

    let message = swapId;
    let signature = await utils.getSignature(web3, accounts[1], message);
    result = await gateInstance.claim(
      swapId,
      fromToken,
      toToken,
      sender,
      recipient,
      amount,
      nonce,
      signature
    );
    assert.equal(result.logs[0].event, 'SwapClaimed');

    balance = await usdtInstance.balanceOf(recipient);
    assert.equal(balance.toString(), amount.toString())
  });
});