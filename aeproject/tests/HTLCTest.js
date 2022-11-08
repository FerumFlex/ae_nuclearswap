// const { assert } = require('chai');
// const { utils, wallets } = require('@aeternity/aeproject');
// var crypto = require('crypto');

// const HTLC_SOURCE = './contracts/HTLC.aes';
// const TOKEN_SOURCE = './contracts/FungibleTokenFull.aes';
// const ETH_ADDRESS = '0x523684cFEdA2d2c0B294d1B52e31c1dB38f5fe75';

// function delay(ms) {
//   return new Promise( resolve => setTimeout(resolve, ms) );
// }

// describe('HTLC', () => {
//   let aeSdk;
//   let htlc_contract;
//   let token_contract;
//   let token_address;
//   let htlc_address;
//   const original_amount = 1000000000;
//   const address = wallets[0].publicKey;
//   const another_address = wallets[1].publicKey;

//   before(async () => {
//     aeSdk = await utils.getSdk();

//     const fileSystem = utils.getFilesystem(HTLC_SOURCE);
//     const source = utils.getContractContent(HTLC_SOURCE);
//     htlc_contract = await aeSdk.getContractInstance({ source, fileSystem });
//     await htlc_contract.deploy();

//     const token_fileSystem = utils.getFilesystem(TOKEN_SOURCE);
//     const token_source = utils.getContractContent(TOKEN_SOURCE);
//     token_contract = await aeSdk.getContractInstance({ source: token_source, fileSystem: token_fileSystem });
//     await token_contract.deploy(["USDT", 6, "USDT", original_amount]);
//     token_address = token_contract.deployInfo.address;
//     htlc_address = "ak" + htlc_contract.deployInfo.address.substr(2);

//     // create a snapshot of the blockchain state
//     await utils.createSnapshot(aeSdk);
//   });

//   // after each test roll back to initial state
//   afterEach(async () => {
//     await utils.rollbackSnapshot(aeSdk);
//   });

//   it('test fund -> widthdraw', async () => {
//     const wait_time = 2 * 1000;
//     const unix = Math.round(+new Date()) + wait_time;
//     const amount = 100000;
//     const password = "testing";
//     const secret_hash = crypto.createHash('sha256').update(password).digest('hex');

//     // allow
//     let result = await token_contract.methods.create_allowance(htlc_address, amount);
//     assert.equal(result.result.returnType, "ok");

//     result = await htlc_contract.methods.fund(token_address, secret_hash, another_address, ETH_ADDRESS, unix, amount);
//     assert.equal(result.result.returnType, "ok");
//     let lock_contract_id = result.decodedResult;

//     // check withdraw(success)
//     let accounts = utils.getDefaultAccounts();
//     result = await htlc_contract.methods.withdraw(lock_contract_id, password, {onAccount: accounts[1]});
//     assert.equal(result.result.returnType, "ok");

//     // check balances
//     result = await token_contract.methods.balances();
//     assert.equal(result.decodedResult.get(address), original_amount - amount);
//     assert.equal(result.decodedResult.get(another_address), amount);
//     assert.equal(result.decodedResult.get(htlc_address), 0);
//   });

//   it('test fund -> refund', async () => {
//     const wait_time = 2 * 1000;
//     const unix = Math.round(+new Date()) + wait_time;
//     const amount = 100000;
//     const password = "testing";
//     const secret_hash = crypto.createHash('sha256').update(password).digest('hex');

//     // allow
//     let result = await token_contract.methods.create_allowance(htlc_address, amount);
//     assert.equal(result.result.returnType, "ok");

//     result = await htlc_contract.methods.fund(token_address, secret_hash, another_address, ETH_ADDRESS, unix, amount);
//     assert.equal(result.result.returnType, "ok");
//     let lock_contract_id = result.decodedResult;

//     // check balances
//     result = await token_contract.methods.balances();
//     assert.equal(result.decodedResult.get(address), original_amount - amount);
//     assert.equal(result.decodedResult.get(htlc_address), amount);

//     // let lock_contract_id = Buffer.from(result.decodedResult).toString("hex");
//     // let lock_contract_id_hex = Uint8Array.from(Buffer.from(lock_contract_id, 'hex'));

//     // do we have this htlc_contract
//     result = await htlc_contract.methods.have_locked_contract(lock_contract_id);
//     assert.equal(result.result.returnType, "ok");
//     assert.equal(result.decodedResult, true)

//     // check get_locked_contract
//     result = await htlc_contract.methods.get_locked_contract(lock_contract_id);
//     assert.equal(result.result.returnType, "ok");
//     let lock_contract = result.decodedResult;
//     assert.equal(lock_contract.token, token_address);
//     assert.equal(lock_contract.recipient, another_address);
//     assert.equal(lock_contract.sender, address);
//     assert.equal(lock_contract.endtime, unix);
//     assert.equal(lock_contract.amount, amount);
//     assert.equal(lock_contract.withdrawn, false);
//     assert.equal(lock_contract.refunded, false);
//     assert.equal(lock_contract.preimage, "");

//     // try to withdraw(error)
//     try {
//       await htlc_contract.methods.withdraw(lock_contract_id, password);
//       assert.equal(false);
//     } catch(error) {
//       assert.equal(error.message, 'Invocation failed: "withdrawable: not recipient"');
//     }

//     // try to refund(error)
//     try {
//       await htlc_contract.methods.refund(lock_contract_id);
//       assert.equal(false);
//     } catch(error) {
//       assert.equal(error.message, 'Invocation failed: "refundable: endtime not yet passed"');
//     }

//     // wait and repeat
//     await delay(wait_time);

//     // create some transaction to mine new block and update Chain.timestamp
//     const transfer_amount = 10;
//     result = await token_contract.methods.transfer(another_address, transfer_amount);
//     assert.equal(result.result.returnType, "ok");

//     // check balance for address(should be less)
//     result = await token_contract.methods.balance(address);
//     assert.equal(result.result.returnType, "ok");
//     assert.equal(result.decodedResult, original_amount - amount - transfer_amount);

//     // check refund(success)
//     result = await htlc_contract.methods.refund(lock_contract_id);
//     assert.equal(result.result.returnType, "ok");

//     // check balance for address
//     result = await token_contract.methods.balance(address);
//     assert.equal(result.result.returnType, "ok");
//     assert.equal(result.decodedResult, original_amount - transfer_amount);

//     // check refund true
//     result = await htlc_contract.methods.get_locked_contract(lock_contract_id);
//     assert.equal(result.result.returnType, "ok");
//     lock_contract = result.decodedResult;
//     assert.equal(lock_contract.refunded, true);
//   });
// });
