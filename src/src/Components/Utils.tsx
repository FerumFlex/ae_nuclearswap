import { useState } from "react";
import { Anchor, Stack, Paper, Button } from "@mantine/core"
import { showNotification } from '@mantine/notifications';
import { useStore } from '../store';
import { ethers } from "ethers";
import usdtToken from '../contracts/USDT.json';
import { useEthers } from '@usedapp/core'
import { IconCheck, IconX } from '@tabler/icons';
import { getContract, getMainnetUsdtContract } from '../utils/utils';

const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK;


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
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } finally {
      setAeFaucetLoading(false);
    }
  };

  const doEthFaucetUsdt = async () => {
    setEthFauceUsdttLoading(true);
    try {
      // @ts-ignore

      const amount = ethers.utils.parseUnits("1000.0", ethWallet.precision);
      console.log("chainid", chainId)
      try {
        let usdtContractWithSigner;
        if (ETH_NETWORK === "arbitrum") {
          usdtContractWithSigner = getMainnetUsdtContract(library);
        } else {
          usdtContractWithSigner = getContract(library, chainId, usdtToken);
        }
        if (! usdtContractWithSigner) {
          showNotification({
            title: 'Error',
            color: 'red',
            message: 'Contract is not uploaded for this network',
            icon: <IconX size={16} />,
          })
          return;
        }

        await usdtContractWithSigner.mint(ethWallet.address, amount);

        showNotification({
          title: 'Success',
          color: 'teal',
          message: 'Minted 1000 USDT on eth',
          icon: <IconCheck size={16} />,
        })
      } catch(Error) {
        console.log(Error);
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
