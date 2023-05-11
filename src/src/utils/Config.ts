import { Config, Goerli, Mainnet, Localhost, ArbitrumGoerli, Arbitrum } from '@usedapp/core';

const REACT_APP_INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK;

let chainID;
let urls;
if (ETH_NETWORK === "mainnet") {
  chainID = Mainnet.chainId;
  urls = {
    [Mainnet.chainId]: "https://mainnet.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID
  };
} else if (ETH_NETWORK === "goerli") {
  chainID = Goerli.chainId;
  urls = {
    [Goerli.chainId]: "https://goerli.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID,
  }
} else if (ETH_NETWORK === "development") {
  chainID = Localhost.chainId;
  urls = {
    [Localhost.chainId]: 'http://localhost:8545'
  }
} else if (ETH_NETWORK === "arbitrum_goerli") {
  chainID = ArbitrumGoerli.chainId;
  urls = {
    [ArbitrumGoerli.chainId]: "https://arbitrum-goerli.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID,
  }
} else if (ETH_NETWORK === "arbitrum") {
  chainID = Arbitrum.chainId;
  urls = {
    [Arbitrum.chainId]: "https://arbitrum-mainnet.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID,
  }
} else {
  throw Error(`Wrong network ${ETH_NETWORK}`);
}

export const config: Config = {
  readOnlyChainId: chainID,
  readOnlyUrls: urls,
  refresh: 'everyBlock',
};
