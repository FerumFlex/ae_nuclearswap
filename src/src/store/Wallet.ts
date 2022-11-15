export type WalletInfo = {
  name: string,
  symbol: string
};

export interface IWallet {
  getAddress() : string | undefined
  getUsdtBalance() : bigint | undefined
  getusdtBalanceFormat() : bigint | undefined
  getNetworkId() : number | undefined
  getInfo() : WalletInfo
}
