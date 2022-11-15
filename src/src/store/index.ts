import { createContext, useContext } from "react";
import AeWallet from "./AeWallet";
import EthWallet from "./EthWallet";
import Contracts from "./Contracts";
import Wallets from "./Wallets";

let aeWallet = new AeWallet();
let ethWallet = new EthWallet();

const store = {
  aeWallet: aeWallet,
  ethWallet: ethWallet,
  contracts: new Contracts(),
  wallets: new Wallets([ethWallet, aeWallet])
};

export const StoreContext = createContext(store);

export const useStore = () => {
  return useContext<typeof store>(StoreContext);
};

export default store;
