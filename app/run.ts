const { AeSdk, MemoryAccount, Node } = require('@aeternity/aepp-sdk');
const aeToken = require('./contracts/ae_token.json');
const aeHtlc = require('./contracts/ae_htlc.json');
const ethToken = require('./contracts/USDT.json');
const ethHtlc = require('./contracts/HTLC_ERC20.json');

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const contract = require("@truffle/contract");

const dotenv = require('dotenv')

dotenv.config();
const SECRET_KEY = process.env["SECRET_KEY"];
const ADDRESS = process.env["ADDRESS"];
const MNEMONIC = process.env["MNEMONIC"];
const INFURA_ACCESS_TOKEN = process.env["INFURA_ACCESS_TOKEN"];
const NETWOKR_ID = 5;
const TOKEN_ADDRESS = "0x276f88594C58A6132bEAa9787cFeAa498BC0F153";
const HTLC_ADDRESS = "0x8B40585912E2375D1d7CF2c23bA736736DeE794D";
let provider = new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${INFURA_ACCESS_TOKEN}`);
const SELF_ADDRESS = provider.addresses[0];



const NODE_URL = 'https://testnet.aeternity.io'
const COMPILER_URL = 'https://compiler.aepps.com' // required for contract interactions
const senderAccount = new MemoryAccount({
  keypair: {
    publicKey: ADDRESS,
    secretKey: SECRET_KEY
  }
});



const main = async () => {
  const nodeInstance = new Node(NODE_URL)
  const aeSdk = new AeSdk({
    compilerUrl: COMPILER_URL,
    nodes: [{ name: 'testnet', instance: nodeInstance }],
    accounts: [senderAccount],
  })

  const token_contract = await aeSdk.getContractInstance({ aci: aeToken["aci"], contractAddress: aeToken["address"] });
  const htlc_contract = await aeSdk.getContractInstance({ aci: aeHtlc["aci"], contractAddress: aeHtlc["address"] });

  console.log(SELF_ADDRESS)

  const EthTokenContract = contract(ethToken);
  EthTokenContract.setProvider(provider);
  EthTokenContract.hasNetwork(NETWOKR_ID);
  EthTokenContract.defaults({
    from: SELF_ADDRESS,
    gas: 4500000,
    gasPrice: 10000000000
  });

  const EthHtlcContract = contract(ethHtlc);
  EthHtlcContract.setProvider(provider);
  EthHtlcContract.hasNetwork(NETWOKR_ID);
  EthHtlcContract.defaults({
    from: SELF_ADDRESS,
    gas: 4500000,
    gasPrice: 10000000000
  });

  const eth_token_contract = await EthTokenContract.at(TOKEN_ADDRESS);
  const eth_htlc_contract = await EthHtlcContract.at(HTLC_ADDRESS);

  // console.log()
  // try {
  //   // let result = await eth_token_contract.mint.call(address, 10000000000);
  //   let result = await eth_token_contract.mint("0x8B40585912E2375D1d7CF2c23bA736736DeE794D", 10000000000);
  //   console.log("Result", result);
  //   provider.engine.stop();
  // } catch (err) {
  //   console.log("Error", err);
  //   return;
  // }

  await processContracts(htlc_contract, token_contract, eth_htlc_contract, eth_token_contract);
  setInterval(async () => {
    await processContracts(htlc_contract, token_contract, eth_htlc_contract, eth_token_contract);
  }, 30000);

  // provider.engine.stop();
}

const filterContracts = (contracts: any[]) : any[] => {
  const result : any[] = [];

  contracts.forEach((contract) => {
    if (contract.token !== aeToken["address"]) {
      return;
    }

    if (contract.withdrawd) {
      return;
    }

    if (contract.refunded) {
      return;
    }

    if (contract.endtime < new Date()) {
      return
    }

    result.push(contract);
  });

  return result;
}

const processLockContract = async (contracts: any[], htlc_token_contract: any) => {
  let result;
  for (let contract of contracts) {
    result = await htlc_token_contract.fund(TOKEN_ADDRESS, contract.secret_hash, contract.eth_address, SELF_ADDRESS, contract.endtime, contract.amount);
    console.log(result);
  }
}

const processContracts = async (htlc_contract: any, token_contract: any, htlc_token_contract : any, eth_token_contract : any) => {
  console.log("Processing contracts");

  const result = await htlc_contract.methods.locked_contracts();
  const filteredContracts = filterContracts(result.decodedResult);

  await processLockContract(filteredContracts, htlc_token_contract)
}

main();