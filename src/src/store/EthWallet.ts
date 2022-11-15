import { makeAutoObservable } from "mobx"
import { IWallet, WalletInfo } from "./Wallet";

export default class EthWallet implements IWallet {
  address : string = "";
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

  getusdtBalanceFormat() : bigint | undefined {
    return this.usdtBalance ? this.usdtBalance / 1000000n : undefined;
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

  getInfo() : WalletInfo {
    return {
      "name": "Ethereum Goerli",
      "symbol": "ETH"
    }
  }

}
