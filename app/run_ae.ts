const { AeSdk, MemoryAccount, Node } = require("@aeternity/aepp-sdk");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ethGate = require("./contracts/gate.json");
const aeGate = require("./contracts/ae_gate.json");
const axios = require("axios");

const Web3 = require("web3");

const dotenv = require("dotenv");
dotenv.config();

const ETH_MNEMONIC: string = process.env["ETH_MNEMONIC"] || "";
const ETH_NETWOKR_ID: string = process.env["ETH_NETWORK_ID"] || "";
const INFURA_ACCESS_TOKEN: string = process.env["INFURA_ACCESS_TOKEN"] || "";
const providerUrl: string = process.env["PROVIDER_URL"] || "";
const AE_SECRET_KEY = process.env["AE_SECRET_KEY"];
const AE_ADDRESS = process.env["AE_ADDRESS"];
const AE_EVENT_HASH =
  "AMIODPM6EJSAKUT025Q4B0MA5DCDGGVADRNMBB645OHO4HEIR9SG====";
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
  await procesAe(gateContract);

  setInterval(async () => {
    await procesAe(gateContract);
  }, 30000);
};

const procesAe = async (gateContract: any) => {
  let swapIds = await fetchAeEvents();
  for (let swapId of swapIds) {
    await processSwap(gateContract, swapId);
  }
};

const processSwap = async (gateContract: any, swapId: string) => {
  let swap = (await gateContract.methods.get_swap(swapId)).decodedResult;
  const timestamp = +new Date();

  if (swap.withdrawn && swap.signature) {
    console.log(`🔵 ${swapId} is finished`);
  } else if (swap.refunded) {
    console.log(`🔴 ${swapId} is refunded`)
  } else if (swap.endtime < timestamp) {
    console.log(`🔴 ${swapId} is expired`);
  } else {
    console.log(`🔵 ${swapId} is pending`);
    singSwap(gateContract, swapId);
  }
};

const singSwap = async (gateContract : any, swapId: string) => {
  const account = ETH_SELF_ADDRESS;
  const signature = ethSignatureToAe(await getSignature(web3Signer, account, swapId));
  let res = await gateContract.methods.sign(swapId, signature);
  console.log(`🔵 ${swapId} was signed ${res.hash}`)
}

function intToHex(value : bigint) : string {
  let res = new Uint8Array(32);
  let index = 0;
  while (value > 256n) {
    res[index++] = Number(value % 256n);
    value = value / 256n;
  }
  res[index] = Number(value);
  res.reverse();
  return "0x" + Buffer.from(res).toString("hex");
}

const fetchAeEvents = async () : Promise<string[]> => {
  const res = await axios.get(
    `https://${AE_NETWORK}.aeternity.io/mdw/v2/contracts/logs?direction=backward&contract_id=${aeGate.address}`
  );
  let fundSwapIds : string[] = [];
  res.data.data.forEach((e: any) => {
    if (e.event_hash === AE_EVENT_HASH) {
      let swapId = intToHex(BigInt(e.args[0]));
      fundSwapIds.push(swapId);
    }
  });

  return fundSwapIds;
};

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

main();
