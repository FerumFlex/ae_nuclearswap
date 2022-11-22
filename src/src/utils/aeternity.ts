import { AeSdkAepp, BrowserWindowMessageConnection, walletDetector, Node, SUBSCRIPTION_TYPES } from "@aeternity/aepp-sdk";
import AeWallet from "../store/AeWallet";

const TESTNET_NODE_URL = 'https://testnet.aeternity.io';
const MAINNET_NODE_URL = 'https://mainnet.aeternity.io';
const COMPILER_URL = 'https://compiler.aepps.com';


export const initSdk = async(aeWallet : AeWallet) => {
  if (aeWallet.aeSdk) {
    return aeWallet.aeSdk
  }
  console.log(4444);

  let aeSdk = new AeSdkAepp({
    name: 'Simple æpp',
    nodes: [
      { name: 'testnet', instance: new Node(TESTNET_NODE_URL) },
      { name: 'mainnet', instance: new Node(MAINNET_NODE_URL) },
    ],
    compilerUrl: COMPILER_URL,
    onNetworkChange: async ({ networkId }) => {
      const [{ name }] = (await aeSdk.getNodesInPool()).filter((node) => node.nodeNetworkId === networkId);
      aeSdk.selectNode(name);
    },
    onAddressChange: ({ current }) => console.log(current),
    onDisconnect: () => console.log('Aepp is disconnected')
  });
  aeWallet.setSdk(aeSdk);

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