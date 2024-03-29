import { useState } from 'react';
import { createStyles, Text, Paper, Stack, Select, Group, Center, Button } from '@mantine/core';
import { IconExchange } from '@tabler/icons';
import { useStore } from '../store';
import { observer } from "mobx-react-lite";
import { showNotification } from '@mantine/notifications';
import { FromBlock } from '../Components/FromBlock';
import { ToBlock } from '../Components/ToBlock';
import Progress from '../Components/Progress';
import { aeToEth, ethToAe } from '../Components/Actions';
import { useEthers } from '@usedapp/core'


const AE_NETWORK = process.env.REACT_APP_AE_NETWORK;
const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK;

const useStyles = createStyles((theme) => ({
  exchangeButton: {
    cursor: 'pointer'
  }
}));

export const ContentPage = observer( () => {
  const {aeWallet, ethWallet, wallets,  } = useStore();
  const networks = [ ...wallets.wallets].map((w) => {
    let info = w.info;
    return {
      value: info.symbol,
      label: info.name,
      wallet: w
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fromValue, setFromValue] = useState<bigint>(10n * 10n ** 6n);
  const [currentAction, setCurrentAction] = useState<number | null>(null);
  const { classes } = useStyles();
  const { chainId, library } = useEthers();

  const verifyNetwork = () => {
    if (!aeWallet.networkId) {
      return "Connect AE wallet";
    }

    if (aeWallet.networkId !== AE_NETWORK) {
      return `AE - Switch to ${AE_NETWORK}`;
    }

    if ((ETH_NETWORK === "goerli") && (ethWallet.networkId !== "5")) {
      return "ETH - Switch to goerli";
    }

    if ((ETH_NETWORK === "development") && (ethWallet.networkId !== "1337")) {
      return "ETH - Switch to development";
    }

    if ((ETH_NETWORK === "arbitrum_goerli") && (ethWallet.networkId !== "421613")) {
      return "ETH - Switch to Arbitrum goerli";
    }

    if ((ETH_NETWORK === "arbitrum") && (ethWallet.networkId !== "42161")) {
      return "ETH - Switch to Arbitrum One";
    }

    if (!aeWallet.address) {
      return "Please connect Superhero wallet";
    }

    if (!ethWallet.address) {
      return "Please connect Metamask wallet";
    }
  };

  const networkCheck = verifyNetwork();

  const doExchange = async () => {
    const res = verifyNetwork();
    if (res) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: res,
      });
      return;
    }

    if (!aeWallet.address) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Please connect Superhero wallet',
      });
      return;
    };

    if (!ethWallet.address) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Please connect Metamask wallet',
      });
      return;
    }

    if (wallets.fromWallet.info.symbol === "AE") {
      aeToEth(library, chainId, aeWallet, ethWallet, fromValue, setIsLoading, setCurrentAction);
    } else if (wallets.fromWallet.info.symbol === "ETH") {
      ethToAe(library, chainId, aeWallet, ethWallet, fromValue, setIsLoading, setCurrentAction);
    }
  };

  const onExchangeFromTo = () => {
    wallets.exchangeWallets();
  };

  const convertedFromValue = Number(fromValue) / (10 ** wallets.fromWallet.precision);

  const onChangeFromSelect = (data: any) => {
    if (data === "AE") {
      wallets.setFromWallet(aeWallet);
    } else {
      wallets.setFromWallet(ethWallet);
    }
  };

  const onChangeToSelect = (data: any) => {
    if (data === "AE") {
      wallets.setToWallet(aeWallet);
    } else {
      wallets.setToWallet(ethWallet);
    }
  };

  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <Group m="xs">
          <Text size={"sm"}><strong>From:</strong></Text>
          <Select
            radius={"lg"}
            data={networks}
            onChange={onChangeFromSelect}
            value={wallets.fromWallet.info.symbol}
          />
        </Group>

        <FromBlock
          fromValue={convertedFromValue}
          precision={wallets.fromWallet.precision}
          setFromValue={setFromValue}
          maxBalance={wallets.fromWallet.usdtBalanceFormat?.toNumber()}
        />

        <Center style={{margin: "15px"}}>
          <IconExchange onClick={onExchangeFromTo} size={48} className={classes.exchangeButton} strokeWidth={2} />
        </Center>

        <Group m="xs">
          <Text size={"sm"}><strong>To:</strong></Text>
          <Select
            radius={"lg"}
            data={networks}
            onChange={onChangeToSelect}
            value={wallets.toWallet.info.symbol}
          />
        </Group>

        <ToBlock
          fromValue={convertedFromValue}
          precision={wallets.toWallet.precision}
          maxBalance={wallets.toWallet.usdtBalanceFormat?.toNumber()}
        />

        <Center style={{paddingTop: "20px"}}>
          <Button
            disabled={!fromValue}
            loading={isLoading}
            color={networkCheck ? "red" : "blue"}
            size={"lg"}
            radius={"md"}
            onClick={doExchange}
          >{networkCheck ? networkCheck : "Exchange"}</Button>
        </Center>

        <Progress currentAction={currentAction} />
      </Paper>
    </Stack>
  );
});