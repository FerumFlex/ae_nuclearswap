import { IWallet, WalletInfo } from "./Wallet";
import { getExplorerAddressLink, getChainName } from '@usedapp/core';
import { makeObservable, action } from "mobx"

export default class EthWallet extends IWallet {
  constructor() {
    super();
    makeObservable(this, {
      setInfo: action,
    });
  }

  setInfo(_address: string, _networkId: string | undefined, _usdtBalance: bigint | undefined) {
    this.address = _address;
    this.networkId = _networkId;
    this.usdtBalance = _usdtBalance;
  }

  get info() : WalletInfo {
    return {
      "name": "ETH " + (this.networkId ? getChainName(parseInt(this.networkId)) : ""),
      "symbol": "ETH"
    }
  }

  get explorerAddressLink() : string | undefined{
    return this.address && this.networkId ? getExplorerAddressLink(this.address, parseInt(this.networkId)) : undefined;
  }
}
