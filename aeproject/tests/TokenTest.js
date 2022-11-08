// const { assert } = require('chai');
// const { utils } = require('@aeternity/aeproject');
// const { toAettos } = require('@aeternity/aepp-sdk');
// const TOKEN_SOURCE = './contracts/Token.aes';

// describe('Token', () => {
//   let aeSdk;
//   let contract;

//   before(async () => {
//     aeSdk = await utils.getSdk();

//     // a filesystem object must be passed to the compiler if the contract uses custom includes
//     const fileSystem = utils.getFilesystem(TOKEN_SOURCE);

//     // get content of contract
//     const source = utils.getContractContent(TOKEN_SOURCE);

//     // initialize the contract instance
//     contract = await aeSdk.getContractInstance({ source, fileSystem });
//     await contract.deploy(["cAE", 18, "cAE"]);

//     // create a snapshot of the blockchain state
//     await utils.createSnapshot(aeSdk);
//   });

//   // after each test roll back to initial state
//   afterEach(async () => {
//     await utils.rollbackSnapshot(aeSdk);
//   });

//   it('Should allow mint', async () => {
//     const address = await utils.getDefaultAccounts()[0].address();

//     let result = await contract.methods.balance(address);
//     assert.equal(result.decodedResult || 0, 0);

//     let amount = toAettos(1);
//     result = await contract.methods.mint({ amount: amount })

//     result = await contract.methods.balance(address);
//     assert.equal(result.decodedResult, amount);
//   });
// });
