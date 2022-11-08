const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');
const TOKEN_SOURCE = './contracts/FungibleTokenFull.aes';
const GATE_SOURCE = './contracts/Gate.aes';
const crypto = require('crypto');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest();
}

describe('Gate', () => {
  let aeSdk;
  let contractToken;
  let contractGate;
  let original_amount = 1000000000;
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
    abi.encodePacked(
      fromToken,
      sha256(abi.encodePacked(toToken)),
      _msgSender(),
      sha256(abi.encodePacked(recipient)),
      sha256(abi.encodePacked(Strings.toString(amount))),
      sha256(abi.encodePacked(Strings.toString(nonce)))
    )
    let swapId = "0x362114583cfc48ae1df74ece23b84619777fc5765e434fbb85938ba294e72c90";
    let fromToken = "0xf8d334489c97Ca647120d5a260F391585018ebee";
    let toToken = "ak_" + contractToken.deployInfo.address.substr(3);
    let sender = "0x9a63911A6495D76b36a94025c16847E4E6236b7A";
    let recipient = "ak_ZdF4zFqkaUjM5QqkefgvWS9PhRyyMFgdhMy9dgZFAqU9Ayp53";
    let amount = 10000000;
    let nonce = 1;
    let signature = "d83d302b109eb123bc64912d0a970eb8d61af172b583f7c7a16cfae8f0ab12a461d7bdb653cae0c5a743104866962b01be0e3259b0dae7579e4b0a5cf25f25281b";

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
    // console.log(contractGate.deployInfo.address);
    // let hex = Buffer.from(result.decodedResult).toString('hex');
    // console.log(hex);
  });
});