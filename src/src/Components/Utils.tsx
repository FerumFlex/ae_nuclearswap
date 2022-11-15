import { useState } from "react";
import { Anchor, Stack, Paper, Button } from "@mantine/core"
import { showNotification } from '@mantine/notifications';
import { useStore } from '../store';
import { ethers } from "ethers";
import usdtToken from '../contracts/USDT.json';
import { useEthers } from '@usedapp/core'
import { IconCheck, IconX } from '@tabler/icons';


export function Utils() {
  const {aeWallet, ethWallet} = useStore();
  const { chainId, library } = useEthers();
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
      // @ts-ignore
      const signer = library?.getSigner();
      let chainIdStr : string = chainId ? chainId.toString() : "";
      // @ts-ignore
      let contractAddress = chainIdStr && usdtToken.networks[chainIdStr] ? usdtToken.networks[chainIdStr].address : "";
      if (! contractAddress) {
        showNotification({
          title: 'Error',
          color: 'red',
          message: 'Contract is not uploaded for this network',
          icon: <IconX size={16} />,
        })
        return;
      }
      const usdtContract = new ethers.Contract(contractAddress, usdtToken.abi, library);
      const usdtContractWithSigner = usdtContract.connect(signer);

      const amount = ethers.utils.parseUnits("100.0", ethWallet.getPrecision());
      try {
        await usdtContractWithSigner.mint(ethWallet.address, amount);

        showNotification({
          title: 'Success',
          color: 'teal',
          message: 'Minted 100 USDT on eth',
          icon: <IconCheck size={16} />,
        })
      } catch(Error) {
        showNotification({
          title: 'Success',
          color: 'red',
          message: 'Failed to mint ETH',
          icon: <IconX size={16} />,
        });
      }
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
