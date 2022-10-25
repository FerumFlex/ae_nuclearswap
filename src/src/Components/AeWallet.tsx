import React from "react";
import { useStore } from "../store";


export const AeWallet = () => {
  const {aeWallet} = useStore()
  return (
    <span>AE: {aeWallet.address}</span>
  )
}
