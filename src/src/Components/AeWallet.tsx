import React from "react";
import { Button } from '@mantine/core';
import { useStore } from "../store";


export const AeWallet = () => {
  const {aeWallet} = useStore();

  const onConnect = () => {
  };

  return (
    <span>
      {aeWallet.address ?
        aeWallet.address :
        <Button variant="light" compact onClick={onConnect}>Connect</Button>
      }
    </span>
  )
}
