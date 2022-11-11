const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');
const TOKEN_SOURCE = './contracts/FungibleTokenFull.aes';
const GATE_SOURCE = './contracts/Gate.aes';
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const testUtils = require("./utils");

require('dotenv').config();

function createWeb3() {
  const mnemonic = process.env["MNEMONIC"];
  let provider = new HDWalletProvider(mnemonic, 'http://127.0.0.1:7545');
  const web3 = new Web3(provider);
  return web3;
}

describe('Gate', () => {
  let aeSdk;
  let contractToken;
  let contractGate;
  let mainAddress;
  let secondAddress;

  before(async () => {
    aeSdk = await utils.getSdk();

    const fileSystemToken = utils.getFilesystem(TOKEN_SOURCE);
    const sourceToken = utils.getContractContent(TOKEN_SOURCE);
    contractToken = await aeSdk.getContractInstance({ source: sourceToken, fileSystem: fileSystemToken });
    await contractToken.deploy(["USDT", 6, "USDT"]);

    const fileSystemGate = utils.getFilesystem(GATE_SOURCE);
    const sourceGate = utils.getContractContent(GATE_SOURCE);
    contractGate = await aeSdk.getContractInstance({ source: sourceGate, fileSystem: fileSystemGate });
    await contractGate.deploy();

    await contractToken.methods.set_owner("ak_" + contractGate.deployInfo.address.substr(3));

    mainAddress = await utils.getDefaultAccounts()[0].address();
    secondAddress = await utils.getDefaultAccounts()[1].address();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  // it('get initial balance', async () => {
  //   const result = await contractToken.methods.balance(mainAddress);
  //   assert.equal(result.decodedResult, original_amount)
  // });

  it("claim -> success", async() => {
    const web3 = createWeb3();
    const accounts = await web3.eth.getAccounts();

    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.deployInfo.address.substr(3);
    let sender = accounts[0];
    let oracle = accounts[1];
    let recipient = "ak_ZdF4zFqkaUjM5QqkefgvWS9PhRyyMFgdhMy9dgZFAqU9Ayp53";
    let amount = 10000000;
    let nonce = 1;

    const swapId = testUtils.getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce);
    const signature = await testUtils.getSignature(web3, oracle, swapId);

    let result = await contractGate.methods.claim(
      swapId,
      Buffer.from(fromToken.substr(2), "hex"),
      toToken,
      Buffer.from(sender.substr(2), "hex"),
      recipient,
      amount,
      nonce,
      signature,
    );
    console.log(result);
    console.log(contractGate.deployInfo.address);
    let hex = Buffer.from(result.decodedResult).toString('hex');
    console.log(hex);
  });
});