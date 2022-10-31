import { Config, Goerli } from '@usedapp/core';
import { getDefaultProvider } from 'ethers';


export const networks = [
  {
    value: "ethereum_test",
    label: "Ethereum (goerli)",
  },
  {
    value: "aethertiny_test",
    label: "AE Testnet",
  },
];

export const bot_addr = "ak_4z2k6qMcDuaTkcd2CvrRWyZe8xFQ1RntyWKbDf6nH19PSdwxm";

export const config: Config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]: getDefaultProvider('goerli'),
  },
};
