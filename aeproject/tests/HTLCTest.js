const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');

const HTLC_SOURCE = './contracts/HTLC.aes';

describe('HTLC', () => {
  let aeSdk;
  let contract;

  before(async () => {
    aeSdk = await utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(HTLC_SOURCE);

    // get content of contract
    const source = utils.getContractContent(HTLC_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, fileSystem });
    await contract.deploy();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it('HTLC', async () => {
    const address = await utils.getDefaultAccounts()[0].address();
    // const result = await contract.methods.balance(address);
    // assert.equal(result.decodedResult, 1000000000)
  });
});
