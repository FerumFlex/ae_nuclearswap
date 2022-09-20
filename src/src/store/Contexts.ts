import React from "react";
import AeWallet from "./AeWallet";
import EthWallet from "./EthWallet";
import Contracts from "./Contracts";

export const AeWalletContext = React.createContext(new AeWallet());
export const EthWalletContext = React.createContext(new EthWallet());
export const ContractsContext = React.createContext(new Contracts());
