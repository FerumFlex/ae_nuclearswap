import { BigNumber } from "bignumber.js";
import { makeObservable, observable, computed } from "mobx"

export type WalletInfo = {
  name: string,
  symbol: string
};

export abstract class IWallet {
  address : string | undefined;
  usdtBalance : bigint | undefined;
  networkId: string | undefined;

  constructor() {
    makeObservable(this, {
      address: observable,
      usdtBalance: observable,
      networkId: observable,
      usdtBalanceFormat: computed,
      precision: computed,
      info: computed,
      explorerAddressLink: computed,
    })
  }

  get usdtBalanceFormat() : BigNumber | undefined {
    return this.usdtBalance ? new BigNumber(this.usdtBalance.toString()).dividedBy(10 ** this.precision) : undefined;
  }

  get precision() : number {
    return 6;
  }

  abstract get info() : WalletInfo
  abstract get explorerAddressLink() : string | undefined
}
