import { Config, Goerli, Localhost } from '@usedapp/core';

const REACT_APP_INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;

export const config: Config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]: "https://goerli.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID,
    [Localhost.chainId]: 'http://localhost:8545',
  },
  refresh: 'everyBlock',
};
