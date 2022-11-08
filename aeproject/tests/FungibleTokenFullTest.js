// const { assert } = require('chai');
// const { utils } = require('@aeternity/aeproject');

// const TOKEN_SOURCE = './contracts/FungibleTokenFull.aes';

// describe('FungibleTokenFull', () => {
//   let aeSdk;
//   let contract;
//   let original_amount = 1000000000;

//   before(async () => {
//     aeSdk = await utils.getSdk();

//     // a filesystem object must be passed to the compiler if the contract uses custom includes
//     const fileSystem = utils.getFilesystem(TOKEN_SOURCE);

//     // get content of contract
//     const source = utils.getContractContent(TOKEN_SOURCE);

//     // initialize the contract instance
//     contract = await aeSdk.getContractInstance({ source, fileSystem });
//     await contract.deploy(["USDT", 6, "USDT", original_amount]);

//     // create a snapshot of the blockchain state
//     await utils.createSnapshot(aeSdk);
//   });

//   // after each test roll back to initial state
//   afterEach(async () => {
//     await utils.rollbackSnapshot(aeSdk);
//   });

//   it('get owner balance', async () => {
//     const address = await utils.getDefaultAccounts()[0].address();
//     const result = await contract.methods.balance(address);
//     assert.equal(result.decodedResult, original_amount)
//   });

//   it('transfer', async () => {
//     const address = await utils.getDefaultAccounts()[0].address();
//     const another_address = await utils.getDefaultAccounts()[1].address();
//     const amount = 50000;

//     let result = await contract.methods.transfer(another_address, amount);
//     assert.equal(result.result.returnType, "ok");

//     result = await contract.methods.balances();
//     assert.equal(result.result.returnType, "ok");
//     assert.equal(result.decodedResult.get(address), original_amount - amount)
//     assert.equal(result.decodedResult.get(another_address), amount)
//   });

//   it('allowance -> transfer', async () => {
//     const address = await utils.getDefaultAccounts()[0].address();
//     const another_address = await utils.getDefaultAccounts()[1].address();
//     const amount = 50000;

//     let result = await contract.methods.create_allowance(another_address, amount);
//     assert.equal(result.result.returnType, "ok");

//     let accounts = utils.getDefaultAccounts();
//     result = await contract.methods.transfer_allowance(address, another_address, amount, {onAccount: accounts[1]});
//     assert.equal(result.result.returnType, "ok");

//     result = await contract.methods.balances();
//     assert.equal(result.result.returnType, "ok");
//     assert.equal(result.decodedResult.get(address), original_amount - amount)
//     assert.equal(result.decodedResult.get(another_address), amount)
//   });
// });
