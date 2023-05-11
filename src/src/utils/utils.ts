import { ethers } from "ethers";


export const ARBITRUM_USDT_ADDRESS: string = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";

function pad(n: string, width: number, z = "0") {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function hexdump(buf: ArrayBuffer) {
  let view = new Uint8Array(buf);
  let hex = Array.from(view).map((v) => pad(v.toString(16), 2));
  return hex.join(" ");
}

export function makeid(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function getContractAddress(chainId : number | undefined, contractJson : any) {
  let chainIdStr : string = chainId ? chainId.toString() : "";
  // @ts-ignore
  let contractAddress = chainIdStr && contractJson.networks[chainIdStr] ? contractJson.networks[chainIdStr].address : "";
  return contractAddress;
}

export function getContract(provider : any, chainId : number | undefined, contractJson : any) {
  const contractAddress = getContractAddress(chainId, contractJson);
  if (!contractAddress) {
    return null;
  }
  const signer = provider?.getSigner();
  const usdtContract = new ethers.Contract(contractAddress, contractJson.abi, provider);
  const usdtContractWithSigner = usdtContract.connect(signer);
  return usdtContractWithSigner;
}

export function getMainnetUsdtContract(provider : any) {
  const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",
    "function allowance(address _owner, address _spender) view returns (uint)",
    "function approve(address spender, uint amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

  const signer = provider?.getSigner();
  const usdtContract = new ethers.Contract(ARBITRUM_USDT_ADDRESS, abi, provider);
  const usdtContractWithSigner = usdtContract.connect(signer);
  return usdtContractWithSigner;
}
