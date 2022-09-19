import { useEffect, useState } from "react";
import { Anchor, Stack, Paper, Button } from "@mantine/core"
import { showNotification } from '@mantine/notifications';
import aeToken from '../contracts/ae_token.json';

export function Utils({aeSdk} : {aeSdk: any}) {
  const [aeFaucetLoading, setAeFaucetLoading] = useState(false);
  const [aeFauceUsdttLoading, setAeFaucetUsdtLoading] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (aeSdk) {
        const _address = await aeSdk.address();
        setAddress(_address);
      }
    })();
  }, [aeSdk]);

  const doEternityFaucet = async () => {
    setAeFaucetLoading(true);
    try {
      const address = await aeSdk.address();
      await fetch(`https://faucet.aepps.com/account/${address}`, {
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
    setAeFaucetUsdtLoading(true);

    try {
      const address = await aeSdk.address();

      const aeTokenContract = await aeSdk.getContractInstance({ aci: aeToken.aci, bytecode: aeToken.bytecode, contractAddress: aeToken.address});
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
        <Anchor target="_blank" href={`https://explorer.testnet.aeternity.io/account/${address}`}>Open explorer</Anchor>
        <h2>Aeternity Faucet</h2>
        <Button loading={aeFaucetLoading} onClick={doEternityFaucet}>Get Aeternity</Button>
        <h2>Aeternity USDT faucet</h2>
        <Button loading={aeFauceUsdttLoading} onClick={doEternityFaucetUsdt}>Get Aeternity USDT</Button>
        <h2>Rinkeyby faucet</h2>
        <Anchor target="_blank" href="https://rinkebyfaucet.com/">Eth rinkeyby Faucet</Anchor>
      </Paper>
    </Stack>
  )
}
