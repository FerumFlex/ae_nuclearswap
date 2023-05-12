const { AeSdk, MemoryAccount, Node } = require("@aeternity/aepp-sdk");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ethGate = require("./contracts/gate.json");
const axios = require("axios");
var Buffer = require('buffer').Buffer;

const Web3 = require("web3");

const dotenv = require("dotenv");
dotenv.config();

const ETH_MNEMONIC: string = process.env["ETH_MNEMONIC"] || "";
const ETH_NETWOKR_ID: string = process.env["ETH_NETWORK_ID"] || "";
const INFURA_ACCESS_TOKEN: string = process.env["INFURA_ACCESS_TOKEN"] || "";
const providerUrl: string = process.env["PROVIDER_URL"] || "";
const AE_SECRET_KEY = process.env["AE_SECRET_KEY"];
const AE_ADDRESS = process.env["AE_ADDRESS"];
const AE_NETWORK = process.env["AE_NETWORK"];

let aeGate: any;
let aeToken: any;
let networkName: any;
if (AE_NETWORK == "ae_uat") {
  networkName = "testnet";
  aeGate = require("./contracts/ae_gate_ae_uat.json");
  aeToken = require("./contracts/ae_token_ae_uat.json");
} else {
  networkName = "mainnet";
  aeGate = require("./contracts/ae_gate_ae_mainnet.json");
  aeToken = require("./contracts/ae_token_ae_mainnet.json");
}

let ethProvider = new HDWalletProvider({
  mnemonic: ETH_MNEMONIC,
  providerOrUrl: providerUrl,
});
const ETH_SELF_ADDRESS = ethProvider.addresses[0];

const web3 = new Web3(providerUrl);
const web3Signer = new Web3(ethProvider);

let NODE_URL: string;
if (AE_NETWORK === "ae_uat") {
  NODE_URL = "https://testnet.aeternity.io";
} else {
  NODE_URL = "https://mainnet.aeternity.io";
}
const COMPILER_URL = "https://compiler.aepps.com"; // required for contract interactions
const senderAccount = new MemoryAccount(AE_SECRET_KEY);
let HEX_RUNNED : string[] = [];

const main = async () => {
  const nodeInstance = new Node(NODE_URL)
  const aeSdk = new AeSdk({
    compilerUrl: COMPILER_URL,
    nodes: [{ name: networkName, instance: nodeInstance }],
    accounts: [senderAccount]
  })
  const gateContract = await aeSdk.initializeContract({ aci: aeGate["aci"], address: aeGate["address"] });

  console.log(`Started ae ${AE_ADDRESS}`);
  await processContracts(gateContract);
  setInterval(async () => {
    await processContracts(gateContract);
  }, 15000);
}

const singSwap = async (gateContract : any, swapId: string) => {
  const account = ETH_SELF_ADDRESS;
  const signature = await getSignature(web3Signer, account, swapId)
  const correctSignature = ethSignatureToAe(signature);
  let res = await gateContract.sign(swapId, correctSignature);
  console.log(`🔵 ${swapId} was signed ${res.hash}`)
}

async function getSignature(web3: any, account: string, swapId: string) : Promise<any> {
  let message = swapId;
  let hash = await web3.eth.personal.sign(message, account, {});
  return hash;
}

function ethSignatureToAe(signature: string) : any {
  let sigBytes = Buffer.from(signature.substr(2), "hex");
  let v = sigBytes.slice(-1);
  let convertedSignature = Buffer.concat([v, sigBytes.slice(0, -1)]);
  return convertedSignature;
}

const filterContracts = (contracts: any[]) : any[] => {
  const result : any[] = [];

  contracts.forEach((contract, swapId) => {
    if (contract.fromToken !== aeToken["address"]) {
      return;
    }

    if (contract.withdrawn) {
      return;
    }

    if (contract.signature) {
      return;
    }

    if (contract.refunded) {
      return;
    }

    if (contract.endtime < new Date()) {
      return
    }

    contract.swapId = swapId;
    result.push(contract);
  });

  return result;
}

const processLockContract = async (contracts: any[], gateContract: any) => {
  for (let contract of contracts) {
    let swapId = "0x" + Buffer.from(contract.swapId).toString("hex");
    if (HEX_RUNNED.indexOf(swapId) !== -1) {
      continue;
    }
    HEX_RUNNED.push(swapId);

    console.log(`Contract ${contract} ${swapId}`);
    try {
      await singSwap(gateContract, swapId);
    } catch (err) {
      console.log(err);
    }
  }
}

const processContracts = async (gateContract: any) => {
  console.log("Processing contracts");

  const result = await gateContract.swaps();
  const filteredContracts = filterContracts(result.decodedResult);

  await processLockContract(filteredContracts, gateContract)
}

main();
