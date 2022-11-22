import { createServer, IncomingMessage, ServerResponse } from 'http';

const http = require("http");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ethGate = require('./contracts/gate.json');

const Web3 = require('web3');


const dotenv = require('dotenv')
dotenv.config();


const ETH_MNEMONIC : string = process.env["ETH_MNEMONIC"] || "";
const ETH_NETWOKR_ID : string = process.env["ETH_NETWORK_ID"] || "";
const INFURA_ACCESS_TOKEN : string = process.env["INFURA_ACCESS_TOKEN"] || "";
const providerUrl : string = process.env["PROVIDER_URL"] || "";
const PORT = process.env["PORT"] || "8080";

let ethProvider = new HDWalletProvider({
  mnemonic: ETH_MNEMONIC,
  providerOrUrl: providerUrl
});
const ETH_SELF_ADDRESS = ethProvider.addresses[0];

const web3 = new Web3(providerUrl);
const web3Signer = new Web3(ethProvider);
const gateContract = new web3.eth.Contract(ethGate.abi, ethGate.networks[ETH_NETWOKR_ID].address);
const gateContractSigner = new web3Signer.eth.Contract(ethGate.abi, ethGate.networks[ETH_NETWOKR_ID].address);


const main = async () => {
  console.log(`Started eth ${ETH_SELF_ADDRESS}`);

  let options = {
    filter: {
        value: [],
    },
    fromBlock: 0
  };

  gateContract.events.FundEvent(options)
          .on('data', onFundEvent)
          .on('changed', (changed: any) => console.log(`Changed: ${changed}`))
          .on('error', (err: any) => console.log(`Err: ${err}`))
          .on('connected', (str: any) => console.log(`Connected: ${str}`))
}

async function onFundEvent(event: any) {
  const swapId = event.returnValues.swapId;

  const swap = await gateContract.methods.getSwap(swapId).call();
  const blockNumber = await web3.eth.getBlockNumber();
  const block = await web3.eth.getBlock(blockNumber);
  const timestamp = block["timestamp"] * 1000;

  if (swap.withdrawn && swap.signature) {
    console.log(`🔵 ${swapId} is finished`);
  } else if (swap.refunded) {
    console.log(`🔴 ${swapId} is refunded`)
  } else if (swap.endtime < timestamp) {
    console.log(`🔴 ${swapId} is expired`);
  } else {
    console.log(`🔵 ${swapId} is pending`);
    singSwap(swapId);
  }
}

async function getSignature(web3: any, account: string, swapId: string) : Promise<string> {
  let message = swapId;
  let hash = await web3.eth.personal.sign(message, account);
  return hash;
}

async function singSwap(swapId: string) {
  const account = ETH_SELF_ADDRESS;
  const signature = await getSignature(web3Signer, account, swapId);
  const result = await gateContractSigner.methods.sign(swapId, signature).send({from: account});
  console.log(`🔵 ${swapId} was signed ${result.transactionHash}`)
}

const server = createServer((request: IncomingMessage, response: ServerResponse) => {
  switch (request.url) {
    case '/health': {
      let status;
      if (web3.eth.net.isListening) {
        status = true;
      } else {
        status = false;
      }
      response.end(JSON.stringify({
        "status": status ? "ok" : "error"
      }));
      response.statusCode = status ? 200 : 500;
      break;
    }
    default: {
      response.statusCode = 404;
      response.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

main();


