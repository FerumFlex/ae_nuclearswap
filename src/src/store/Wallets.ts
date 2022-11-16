import { makeAutoObservable } from "mobx"

import { IWallet } from "./Wallet"

export default class Wallets {
  wallets: IWallet[];
  fromWallet: IWallet;
  toWallet: IWallet;

  constructor(_wallets: IWallet[]) {
    if (_wallets.length > 2) {
      throw Error("Should be 2 wallets or more");
    }
    this.wallets = _wallets;
    this.fromWallet = _wallets[0];
    this.toWallet = _wallets[1];
    makeAutoObservable(this)
  }

  setFromWallet(_fromWallet: IWallet) {
    if (this.wallets.indexOf(_fromWallet) === -1) {
      throw Error("Not registered wallet");
    }

    this.fromWallet = _fromWallet;
    if (this.fromWallet === this.toWallet) {
      for (let wallet of this.wallets) {
        if (wallet !== this.fromWallet) {
          this.toWallet = wallet;
          break
        }
      }
    }
  }

  setToWallet(_toWallet: IWallet) {
    if (this.wallets.indexOf(_toWallet) === -1) {
      throw Error("Not registered wallet");
    }

    this.toWallet = _toWallet;
    if (this.fromWallet === this.toWallet) {
      for (let wallet of this.wallets) {
        if (wallet !== this.toWallet) {
          this.fromWallet = wallet;
          break
        }
      }
    }
  }

  exchangeWallets() {
    let tmp = this.fromWallet;
    this.fromWallet = this.toWallet;
    this.toWallet = tmp;
  }

  getWalletBySymbol(symbol: string) : IWallet | undefined {
    for (let wallet of this.wallets) {
      if (wallet.info.symbol !== symbol) {
        return wallet;
      }
    }
  }
}