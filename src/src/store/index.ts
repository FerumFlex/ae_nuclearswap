import { createContext, useContext } from "react";
import AeWallet from "./AeWallet";
import EthWallet from "./EthWallet";
import Contracts from "./Contracts";

const store = {
  aeWallet: new AeWallet(),
  ethWallet: new EthWallet(),
  contracts: new Contracts()
};

export const StoreContext = createContext(store);

export const useStore = () => {
  return useContext<typeof store>(StoreContext);
};

export default store;
