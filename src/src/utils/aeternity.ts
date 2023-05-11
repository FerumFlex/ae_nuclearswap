import { AeSdkAepp, BrowserWindowMessageConnection, walletDetector, Node, SUBSCRIPTION_TYPES } from "@aeternity/aepp-sdk";
import AeWallet from "../store/AeWallet";

const AE_NETWORK = process.env.REACT_APP_AE_NETWORK;
const TESTNET_NODE_URL = 'https://testnet.aeternity.io';
const MAINNET_NODE_URL = 'https://mainnet.aeternity.io';

let nodes: any;
if (AE_NETWORK === "ae_uat") {
  nodes = [
    { name: 'testnet', instance: new Node(TESTNET_NODE_URL) },
  ];
} else {
  nodes = [
    { name: 'mainnet', instance: new Node(MAINNET_NODE_URL) },
  ];
}

export const initSdk = async(aeWallet : AeWallet) => {
  if (aeWallet.aeSdk) {
    return aeWallet.aeSdk
  }

  let aeSdk = new AeSdkAepp({
    name: 'Aerenity',
    nodes: nodes,
    onAddressChange: ({ current }) => console.log(current),
    onDisconnect: () => console.log('Aepp is disconnected')
  });
  await aeWallet.setSdk(aeSdk);

  let [address, networkId] = await scanForWallet(aeSdk);
  await aeWallet.setParams(address, networkId);

  return aeSdk;
}

export const scanForWallet = async (aeSdk: AeSdkAepp) : Promise<[string, string]> => {
  return new Promise((resolve) => {
      const handleWallets = async ({ wallets, newWallet}: {wallets: any, newWallet? : any | undefined}) => {
      newWallet = newWallet || Object.values(wallets)[0];
      stopScan();

      const conn = await aeSdk.connectToWallet(newWallet.getConnection());
      const { address: { current } } = await aeSdk.subscribeAddress(SUBSCRIPTION_TYPES.subscribe, 'connected')
      let address = Object.keys(current)[0];
      resolve([address, conn.networkId]);
    }

    const scannerConnection = new BrowserWindowMessageConnection();
    const stopScan = walletDetector(scannerConnection, handleWallets);
  })
}