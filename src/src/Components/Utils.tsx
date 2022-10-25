import React, { useState } from "react";
import { Anchor, Stack, Paper, Button } from "@mantine/core"
import { showNotification } from '@mantine/notifications';
import aeToken from '../contracts/ae_token.json';
import { useStore } from '../store';


export function Utils() {
  const {aeWallet} = useStore();
  const [aeFaucetLoading, setAeFaucetLoading] = useState(false);
  const [aeFauceUsdttLoading, setAeFaucetUsdtLoading] = useState(false);
  const [ethFauceUsdttLoading, setEthFauceUsdttLoading] = useState(false);

  const doEternityFaucet = async () => {
    setAeFaucetLoading(true);
    try {
      await fetch(`https://faucet.aepps.com/account/${aeWallet.address}`, {
        method: "POST"
      });
      showNotification({
        title: 'Faucet added',
        message: 'We added 5 aeternity to your wallet',
      })
    } finally {
      setAeFaucetLoading(false);
    }
  };

  const doEternityFaucetUsdt = async () => {
    if (aeWallet.aeSdk === null) {
      return
    }

    setAeFaucetUsdtLoading(true);

    try {
      const address = await aeWallet.aeSdk.address();

      const aeTokenContract = await aeWallet.aeSdk.getContractInstance({ aci: aeToken.aci, bytecode: aeToken.bytecode, contractAddress: aeToken.address});
      await aeTokenContract.methods.mint(address, 100000000);  // 100 USDT * 10^6

      showNotification({
        title: 'Faucet added',
        message: 'We added 100 USDT aeternity to your wallet',
      });
    } finally {
      setAeFaucetUsdtLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <h2>Ae explorer</h2>
        <Anchor target="_blank" href={`https://explorer.testnet.aeternity.io/account/${aeWallet.address}`}>Open explorer</Anchor>
        <h2>Aeternity Faucet</h2>
        <Button loading={aeFaucetLoading} onClick={doEternityFaucet}>Get Aeternity</Button>
        <h2>Aeternity USDT faucet</h2>
        <Button loading={aeFauceUsdttLoading} onClick={doEternityFaucetUsdt}>Get Aeternity USDT</Button>
        <h2>Goerli faucet</h2>
        <Anchor target="_blank" href="https://goerlifaucet.com/">Eth goerli Faucet</Anchor>
      </Paper>
    </Stack>
  )
}
