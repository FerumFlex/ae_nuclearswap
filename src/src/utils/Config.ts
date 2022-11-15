import { Config, Goerli } from '@usedapp/core';

const REACT_APP_INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;

export const bot_addr = "ak_4z2k6qMcDuaTkcd2CvrRWyZe8xFQ1RntyWKbDf6nH19PSdwxm";

export const config: Config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]: "https://goerli.infura.io/v3/" + REACT_APP_INFURA_PROJECT_ID,
  },
};
