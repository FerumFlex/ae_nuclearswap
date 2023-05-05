import { Config, Goerli, Mainnet, Localhost } from '@usedapp/core';

const REACT_APP_INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const BLOCKCHAIN_ENV = process.env.REACT_BLOCKCHAIN_ENV;

let chainID;
let urls;
if (BLOCKCHAIN_ENV === "mainnet") {
  chainID = Mainnet.chainId;
  urls = {
    [Mainnet.chainId]: "https://mainnet.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID
  };
} else {
  chainID = Goerli.chainId;
  urls = {
    [Goerli.chainId]: "https://goerli.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID,
    [Localhost.chainId]: 'http://localhost:8545'
  }
}

export const config: Config = {
  readOnlyChainId: chainID,
  readOnlyUrls: urls,
  refresh: 'everyBlock',
};
