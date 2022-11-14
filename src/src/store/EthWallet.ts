import { makeAutoObservable } from "mobx"


export default class EthWallet {
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
}
