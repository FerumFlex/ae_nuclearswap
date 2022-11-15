import { BigNumber } from "bignumber.js";
import { makeAutoObservable } from "mobx"
import { IWallet, WalletInfo } from "./Wallet";

export default class EthWallet implements IWallet {
  address : string | undefined;
  networkId: number | undefined;
  usdtBalance: bigint | undefined = 0n;

  constructor() {
    makeAutoObservable(this)
  }

  setInfo(_address: string, _networkId: number | undefined, _usdtBalance: bigint | undefined) {
    this.address = _address;
    this.networkId = _networkId;
    this.usdtBalance = _usdtBalance;
  }

  getusdtBalanceFormat() : BigNumber | undefined {
    return this.usdtBalance ? new BigNumber(this.usdtBalance.toString()).dividedBy(10 ** this.getPrecision()) : undefined;
  }

  getAddress(): string | undefined {
    return this.address;
  }

  getUsdtBalance(): bigint | undefined{
    return this.usdtBalance;
  }

  getNetworkId(): number | undefined {
    return this.networkId;
  }

  getPrecision() : number {
    return 6;
  }

  getInfo() : WalletInfo {
    return {
      "name": "Ethereum Goerli",
      "symbol": "ETH"
    }
  }

}
