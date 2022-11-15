import { AeSdkAepp } from "@aeternity/aepp-sdk";
import { makeAutoObservable } from "mobx"
import aeToken from '../contracts/ae_token.json';
import aeGate from '../contracts/ae_gate.json';
import { IWallet, WalletInfo } from "./Wallet";


export default class AeWallet implements IWallet{
  address : string = "";
  usdtBalance = 0n;
  networkId: number | undefined;

  aeSdk : AeSdkAepp | null = null;
  usdtContract : any | null = null;
  gateContract : any | null = null;

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
    this.gateContract = await _aeSdk.getContractInstance({ aci: aeGate.aci, bytecode: aeGate.bytecode, contractAddress: aeGate.address});

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

  getusdtBalanceFormat() : bigint | undefined {
    return this.usdtBalance / 1000000n;
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
      "name": "AE Testnet",
      "symbol": "AE"
    }
  }
}
