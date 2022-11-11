const utils = require("./utils");
const GATE = artifacts.require("Gate");
const USDT = artifacts.require("USDT");


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
    let result = await gateInstance.fund(usdtInstance.address, aeTokenAddress, aeAddress, amount, ++nonce);

    let swapId = result.receipt.logs[0].args.swapId;

    let signature = await utils.getSignature(web3, accounts[2], swapId);

    result = await gateInstance.sign(swapId, signature);
    assert.equal(result.receipt.name, 'RuntimeError');
  });

});