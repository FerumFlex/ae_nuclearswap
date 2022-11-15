import { BigNumber } from "bignumber.js";

export type WalletInfo = {
  name: string,
  symbol: string
};

export interface IWallet {
  getAddress() : string | undefined
  getUsdtBalance() : bigint | undefined
  getPrecision() : number
  getusdtBalanceFormat() : BigNumber | undefined
  getNetworkId() : number | undefined
  getInfo() : WalletInfo
}
