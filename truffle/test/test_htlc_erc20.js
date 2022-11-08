// const HTLC_ERC20 = artifacts.require("HTLC_ERC20");
// const USDT = artifacts.require("USDT");
// const crypto = require('crypto');
// const web3 = require('web3');


// const password = "testing";
// const secret_hash = crypto.createHash("sha256").update(password).digest();
// const wait_time = 2000;
// const amount = web3.utils.toBN(10 * 10 ** 6);


// function delay(ms) {
//   return new Promise( resolve => setTimeout(resolve, ms) );
// }

// contract("HTLC_ERC20", (accounts) => {
//   let htlcErc20Instance;
//   let usdtInstance;
//   let balanceOriginal;

//   beforeEach(async () => {
//     htlcErc20Instance = await HTLC_ERC20.deployed();
//     usdtInstance = await USDT.deployed();

//     await usdtInstance.approve(htlcErc20Instance.address, amount);
//     balanceOriginal = await usdtInstance.balanceOf(accounts[0]);
//   });

//   it("should allow refund", async () => {
//     const unix = Math.round((+new Date() + wait_time) / 1000);
//     let result = await htlcErc20Instance.fund(usdtInstance.address, secret_hash, accounts[1], accounts[0], unix, amount);
//     const locked_contract_id = result.logs[0].args.locked_contract_id;

//     result = await htlcErc20Instance.get_fund_contracts(accounts[0]);

//     assert.equal(result.length, 1, "Only one pending contract");
//     assert.equal(result[0], locked_contract_id, "Pending contract should match");

//     let balanceNew = await usdtInstance.balanceOf(accounts[0]);
//     assert.equal(balanceNew.add(amount).toString(), balanceOriginal.toString(), "Balances should match");

//     try {
//       result = await htlcErc20Instance.fund_cancel(locked_contract_id);
//       assert.equal("1", "0", "Should not get there");
//     } catch (ex) {
//       assert.equal(ex.reason, "refundable: endtime not yet passed")
//     }
//     await delay(wait_time);

//     // create some transaction to mine new block and update Chain.timestamp
//     await usdtInstance.transfer(accounts[1], amount);

//     let contract = await htlcErc20Instance.get_locked_contract(locked_contract_id);
//     assert.equal(contract.token, usdtInstance.address, "Should match token");
//     assert.equal(contract.recipient, accounts[1], "Should match recipient");
//     assert.equal(contract.sender, accounts[0], "Should match sender");
//     assert.equal(contract.amount.toString(), amount.toString(), "Should match amount");
//     assert.equal(contract.withdrawn, false, "Should match withdrawn");
//     assert.equal(contract.refunded, false, "Should match refunded");
//     assert.equal(contract.preimage, "", "Preimage should be empty");

//     result = await htlcErc20Instance.fund_cancel(locked_contract_id);

//     contract = await htlcErc20Instance.get_locked_contract(locked_contract_id);
//     assert.equal(contract.withdrawn, false, "Should match withdrawn");
//     assert.equal(contract.refunded, true, "Should match refunded");

//     result = await htlcErc20Instance.get_fund_contracts(accounts[0]);
//     assert.equal(result.length, 0, "None pending contract");

//     balanceNew = await usdtInstance.balanceOf(accounts[0]);
//     assert.equal(balanceNew.add(amount).toString(), balanceOriginal.toString(), "Balances should match");

//     let balanceContract = await htlcErc20Instance.get_token_balance(usdtInstance.address);
//     assert.equal(balanceContract.toString(), "0", "Refund does not increase balanceContract");
//   });
// });

// contract("HTLC_ERC20_withdraw", (accounts) => {
//   let htlcErc20Instance;
//   let usdtInstance;
//   let balanceOriginal;

//   beforeEach(async () => {
//     htlcErc20Instance = await HTLC_ERC20.deployed();
//     usdtInstance = await USDT.deployed();

//     await usdtInstance.approve(htlcErc20Instance.address, amount);
//     balanceOriginal = await usdtInstance.balanceOf(accounts[0]);
//   });

//   it("Should allow withdraw", async () => {
//     const unix = Math.round((+new Date() + wait_time) / 1000);
//     let result = await htlcErc20Instance.fund(usdtInstance.address, secret_hash, accounts[1], accounts[0], unix, amount);
//     const locked_contract_id = result.logs[0].args.locked_contract_id;

//     result = await htlcErc20Instance.get_fund_contracts(accounts[0]);

//     assert.equal(result.length, 1, "Only one pending contract");
//     assert.equal(result[0], locked_contract_id, "Pending contract should match");

//     try {
//       await htlcErc20Instance.fund_confirm(locked_contract_id, password);
//     } catch (ex) {
//       assert.equal(ex.reason, "withdrawable: not recipient")
//     }

//     await htlcErc20Instance.fund_confirm(locked_contract_id, password, {from: accounts[1]});

//     contract = await htlcErc20Instance.get_locked_contract(locked_contract_id);
//     assert.equal(contract.withdrawn, true, "Should be true after withdraw");
//     assert.equal(contract.refunded, false, "Should be false after widthdraw");

//     result = await htlcErc20Instance.get_fund_contracts(accounts[0]);
//     assert.equal(result.length, 0, "None pending contract after withdraw");

//     let balanceSecond = await usdtInstance.balanceOf(accounts[1]);
//     let balanceOne = await usdtInstance.balanceOf(accounts[0]);
//     let balanceContract = await usdtInstance.balanceOf(htlcErc20Instance.address);
//     assert.equal(balanceSecond.toString(), "0", "Withdraw account should have zero");
//     assert.equal(balanceOne.add(balanceContract).toString(), balanceOriginal.toString(), "Sum balances should match");
//     assert.equal(balanceContract.toString(), amount.toString(), "Should be locked amount");

//     balanceContract = await htlcErc20Instance.get_token_balance(usdtInstance.address);
//     assert.equal(balanceContract.toString(), amount.toString(), "Withdraw increases balanceContract");
//   });
// });
