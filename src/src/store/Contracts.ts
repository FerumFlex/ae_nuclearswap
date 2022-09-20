import { makeAutoObservable } from "mobx"


export default class Contracts {
  contracts : any[] = [];

  constructor() {
    makeAutoObservable(this)
  }

  addContract(lock_contract_id: any, secret_hash: string, password: string) {
    this.contracts.push({
      id: lock_contract_id,
      secret_hash: secret_hash,
      password: password
    })
  }
}