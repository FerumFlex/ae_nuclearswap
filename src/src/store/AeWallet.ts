import { AeSdkAepp } from "@aeternity/aepp-sdk";
import { IWallet, WalletInfo } from "./Wallet";
import { makeObservable, action, observable } from "mobx"
import aeTokenUat from '../contracts/ae_token_ae_uat.json';
import aeGateUat from '../contracts/ae_gate_ae_uat.json';
// import aeTokenMainnet from '../contracts/ae_token_ae_mainnet.json';
// import aeGateMainnet from '../contracts/ae_gate_ae_mainnet.json';

const AE_NETWORK = process.env.REACT_APP_AE_NETWORK;

export default class AeWallet extends IWallet{

  aeSdk : AeSdkAepp | null = null;

  usdtContract : any | null = null;
  gateContract : any | null = null;

  constructor() {
    super();
    makeObservable(this, {
      aeSdk: observable,
      usdtContract: observable,
      gateContract: observable,
      setSdk: action,
      setParams: action,
      setBalance: action
    });
  }

  async setSdk(_aeSdk : AeSdkAepp) {
    if (this.aeSdk) {
      return
    }

    this.aeSdk = _aeSdk;
  }

  async setParams(_address: string, _networkId: string) {
    if (!this.aeSdk) {
      return;
    }

    this.address = _address;
    this.networkId = _networkId;

    this.usdtContract = await this.aeSdk.getContractInstance({ aci: this.aeToken.aci, bytecode: this.aeToken.bytecode, contractAddress: this.aeToken.address});
    this.gateContract = await this.aeSdk.getContractInstance({ aci: this.aeGate.aci, bytecode: this.aeGate.bytecode, contractAddress: this.aeGate.address});

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

  get info() : WalletInfo {
    return {
      "name": this.networkId === "ae_mainnet" ? "AE Mainnet" : "AE Testnet",
      "symbol": "AE"
    }
  }

  get explorerAddressLink() : string | undefined {
    return this.address && this.networkId ? `https://explorer.testnet.aeternity.io/account/${this.address}` : undefined;
  }

  get aeToken() : any {
    if (AE_NETWORK === "ae_mainnet") {
      throw Error("No mainnet");
    } else {
      return aeTokenUat;
    }
  }

  get aeGate() : any {
    if (AE_NETWORK === "ae_mainnet") {
      throw Error("No mainnet");
    } else {
      return aeGateUat;
    }
  }
}
