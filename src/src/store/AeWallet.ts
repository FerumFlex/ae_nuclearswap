import { AeSdkAepp } from "@aeternity/aepp-sdk";
import { makeAutoObservable } from "mobx"
import aeToken from '../contracts/ae_token.json';
import aeHtlc from '../contracts/ae_htlc.json';


export default class AeWallet {
  address : string = "";
  aeSdk : AeSdkAepp | null = null;
  usdtBalance = 0n;
  usdtContract : any | null = null;
  htlcContract : any | null = null;

  constructor() {
    makeAutoObservable(this)
  }

  async setSdk(_aeSdk : AeSdkAepp, _address: string) {
    if (this.aeSdk) {
      return
    }

    this.aeSdk = _aeSdk;
    this.address = _address;
    this.usdtContract = await _aeSdk.getContractInstance({ aci: aeToken.aci, bytecode: aeToken.bytecode, contractAddress: aeToken.address});
    this.htlcContract = await _aeSdk.getContractInstance({ aci: aeHtlc.aci, bytecode: aeHtlc.bytecode, contractAddress: aeHtlc.address});

    await this.updateBalance();
    setInterval(async () => {
      this.updateBalance();
    }, 5000);
  }

  async updateBalance() {
    let result = await this.usdtContract.methods.balance(this.address);
    this.setBalance(result.decodedResult || 0n);
  }

  setBalance(balance: bigint) {
    this.usdtBalance = balance;
  }

  get usdtBalanceFormat() {
    return this.usdtBalance / 1000000n;
  }
}
