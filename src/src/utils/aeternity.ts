import { AeSdk, MemoryAccount, AeSdkAepp, BrowserWindowMessageConnection, walletDetector, Node, SUBSCRIPTION_TYPES } from "@aeternity/aepp-sdk";
import { generateKeyPair } from '@aeternity/aepp-sdk'

const TESTNET_NODE_URL = 'https://testnet.aeternity.io';
const MAINNET_NODE_URL = 'https://mainnet.aeternity.io';
const COMPILER_URL = 'https://compiler.aepps.com';

const senderAccount = new MemoryAccount({
  keypair: generateKeyPair()
});


// export const scanForWallet = async (aeSdk: AeSdk) => {
//   return new Promise((resolve, reject) => {
//     if (!aeSdk) reject("Failed! SDK is not initialized");
//     const handleNewWallet = async ({ wallets, newWallet } : any) => {
//       const wallet = newWallet || Object.values(wallets)[0]
//       stopScan();
//       await aeSdk.connectToWallet(await wallet.getConnection());
//       await aeSdk.subscribeAddress(
//         // @ts-ignore
//         SUBSCRIPTION_TYPES.subscribe,
//         "current"
//       );
//       resolve(wallet);
//     };
//     const scannerConnection = new BrowserWindowMessageConnection();
//     const stopScan = walletDetector(
//       scannerConnection,
//       handleNewWallet
//     )
//   });
// };

export const initSdk = async() => {
  const aeSdk = new AeSdk({
    name: "aeapp-demo",
    nodes: [
      { name: 'testnet', instance: new Node(TESTNET_NODE_URL) }
    ],
    compilerUrl: COMPILER_URL,
    onAddressChange: (p: any) => console.info("OnAddressChange", p),
    onDisconnect: (p: any) => console.info("onDisconnect", p),
    onNetworkChange: (p: any) => console.info("onNetworkChange", p)
  });
  await aeSdk.addAccount(senderAccount, { select: true });

  return aeSdk;
}