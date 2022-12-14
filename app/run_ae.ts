const { AeSdk, MemoryAccount, Node } = require("@aeternity/aepp-sdk");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ethGate = require("./contracts/gate.json");
const aeGate = require("./contracts/ae_gate.json");
const aeToken = require("./contracts/ae_token.json");
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
const AE_NETWORK = process.env["AE_NETWORK"] || "testnet";

let ethProvider = new HDWalletProvider({
  mnemonic: ETH_MNEMONIC,
  providerOrUrl: providerUrl,
});
const ETH_SELF_ADDRESS = ethProvider.addresses[0];

const web3 = new Web3(providerUrl);
const web3Signer = new Web3(ethProvider);
const gateContract = new web3.eth.Contract(
  ethGate.abi,
  ethGate.networks[ETH_NETWOKR_ID].address
);
const gateContractSigner = new web3Signer.eth.Contract(
  ethGate.abi,
  ethGate.networks[ETH_NETWOKR_ID].address
);

const NODE_URL = `https://${AE_NETWORK}.aeternity.io`;
const COMPILER_URL = "https://compiler.aepps.com"; // required for contract interactions
const aeAccount = {
  publicKey: AE_ADDRESS,
  secretKey: AE_SECRET_KEY,
};
const senderAccount = new MemoryAccount({
  keypair: aeAccount,
});
let HEX_RUNNED : string[] = [];

const main = async () => {
  const nodeInstance = new Node(NODE_URL)
  const aeSdk = new AeSdk({
    compilerUrl: COMPILER_URL,
    nodes: [{ name: 'testnet', instance: nodeInstance }],
  })
  aeSdk.addAccount(senderAccount);
  aeSdk.selectAccount(await senderAccount.address());

  const gateContract = await aeSdk.getContractInstance({ aci: aeGate["aci"], contractAddress: aeGate["address"] });

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
  let res = await gateContract.methods.sign(swapId, correctSignature);
  console.log(`???? ${swapId} was signed ${res.hash}`)
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

    if (contract.withdrawd) {
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

  const result = await gateContract.methods.swaps();
  const filteredContracts = filterContracts(result.decodedResult);

  await processLockContract(filteredContracts, gateContract)
}

main();
