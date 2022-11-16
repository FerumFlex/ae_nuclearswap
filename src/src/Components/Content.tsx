import { useState } from 'react';
import { createStyles, Text, Paper, Stack, Select, Group, Center, Button } from '@mantine/core';
import { IconExchange } from '@tabler/icons';
import { useStore } from '../store';
import { observer } from "mobx-react-lite";
import { showNotification } from '@mantine/notifications';
import { FromBlock } from './FromBlock';
import { ToBlock } from './ToBlock';
import Progress from './Progress';
import { aeToEth, ethToAe } from './Actions';
import { useEthers } from '@usedapp/core'


const useStyles = createStyles((theme) => ({
  exchangeButton: {
    cursor: 'pointer'
  }
}));

export const Content = observer( () => {
  const {aeWallet, ethWallet, contracts, wallets,  } = useStore();
  const networks = [ ...wallets.wallets].map((w) => {
    let info = w.info;
    return {
      value: info.symbol,
      label: info.name
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fromValue, setFromValue] = useState(10n * 10n ** BigInt(wallets.fromWallet.precision));
  const [currentAction, setCurrentAction] = useState<number | null>(null);
  const { classes } = useStyles();
  const { chainId, library } = useEthers();

  const doExchange = async () => {
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
      aeToEth(aeWallet, ethWallet, contracts, fromValue, setIsLoading, setCurrentAction);
    } else if (wallets.fromWallet.info.symbol === "ETH") {
      ethToAe(library, chainId, aeWallet, ethWallet, contracts, fromValue, setIsLoading, setCurrentAction);
    }
  };

  const onExchangeFromTo = () => {
    wallets.exchangeWallets();
  };

  const convertedFromValue = Number(fromValue) / (10 ** wallets.fromWallet.precision);

  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <Group m="xs">
          <Text size={"sm"}><strong>From:</strong></Text>
          <Select
            radius={"lg"}
            data={networks}
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
            value={wallets.toWallet.info.symbol}
          />
        </Group>

        <ToBlock
          fromValue={convertedFromValue}
          precision={wallets.fromWallet.precision}
        />

        <Center style={{paddingTop: "20px"}}>
          <Button disabled={!fromValue} loading={isLoading} size={"lg"} radius={"md"} onClick={doExchange}>Exchange</Button>
        </Center>

        <Progress currentAction={currentAction} />
      </Paper>
    </Stack>
  );
});