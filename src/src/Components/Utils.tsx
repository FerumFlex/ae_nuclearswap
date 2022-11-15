import { useState } from "react";
import { Anchor, Stack, Paper, Button } from "@mantine/core"
import { showNotification } from '@mantine/notifications';
import { useStore } from '../store';


export function Utils() {
  const {aeWallet} = useStore();
  const [aeFaucetLoading, setAeFaucetLoading] = useState(false);
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

  const doEthFaucetUsdt = async () => {
    setEthFauceUsdttLoading(true);
    try {

    } finally {
      setEthFauceUsdttLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <h2>Ae explorer</h2>
        <Anchor target="_blank" href={`https://explorer.testnet.aeternity.io/account/${aeWallet.address}`}>Open explorer</Anchor>
        <h2>Aeternity Faucet</h2>
        <Button loading={aeFaucetLoading} onClick={doEternityFaucet}>Get Aeternity</Button>
        <h2>Goerli faucet</h2>
        <Anchor target="_blank" href="https://goerlifaucet.com/">Eth goerli Faucet</Anchor>
        <h2>Goerli USDT faucet</h2>
        <Button loading={ethFauceUsdttLoading} onClick={doEthFaucetUsdt}>Get goerli USDT</Button>
      </Paper>
    </Stack>
  )
}
