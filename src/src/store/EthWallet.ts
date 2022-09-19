import { makeAutoObservable } from "mobx"


export default class EthWallet {
  address : string = "";

  constructor() {
    makeAutoObservable(this)
  }

  setAddress(_address: string) {
    this.address = _address;
  }
}