import React from "react";
import AeWallet from "./AeWallet";
import EthWallet from "./EthWallet";

export const AeWalletContext = React.createContext(new AeWallet());
export const EthWalletContext = React.createContext(new EthWallet());
