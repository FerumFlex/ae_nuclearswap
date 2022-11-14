import { makeAutoObservable } from "mobx"


export default class Wallets {

  constructor() {
    makeAutoObservable(this)
  }
}