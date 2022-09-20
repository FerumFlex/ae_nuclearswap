import React, { useState } from 'react';
import { Text, Paper, Stack, Select, Group, Center, NumberInput, Button, Timeline } from '@mantine/core';
import { IconExchange, IconCheck } from '@tabler/icons';
import aeToken from '../contracts/ae_token.json';
import aeHtlc from '../contracts/ae_htlc.json';
import ethHtlc from '../contracts/HTLC_ERC20.json';
import { AeWalletContext, EthWalletContext, ContractsContext } from '../store/Contexts';
import { observer } from "mobx-react-lite";
import { showNotification } from '@mantine/notifications';
import { hooks } from '../connectors/metaMask';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

const Buffer = require('buffer').Buffer;
const Web3 = require('web3');

var sha256 = require('js-sha256');

const networks = [
  {
    value: "aethertiny_test",
    label: "AE Test",
  },
  {
    value: "ethereum_test",
    label: "Ethereum Test",
  }
];

const bot_addr = "ak_4z2k6qMcDuaTkcd2CvrRWyZe8xFQ1RntyWKbDf6nH19PSdwxm";


function pad(n: string, width: number, z = '0') {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function hexdump(buf: ArrayBuffer) {
  let view = new Uint8Array(buf);
  let hex = Array.from(view).map(v => pad(v.toString(16), 2));
  return hex.join(" ");
}

function makeid(length : number) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
 }
 return result;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


export const Content = observer( () => {
  const aeWallet = React.useContext(AeWalletContext);
  const ethWallet = React.useContext(EthWalletContext);
  const contracts = React.useContext(ContractsContext);
  const accounts = useAccounts();
  const [fromNetwork, setfromNetwork] = useState<string>(networks[0].value);
  const [toNetwork, settoNetwork] = useState<string>(networks[1].value);
  const [isLoading, setIsLoading] = useState(false);
  const [fromValue, setFromValue] = useState(0);
  const [currentAction, setCurrentAction] = useState<number | null>(null);

  const doExchange = async () => {
    if (aeWallet.aeSdk === null) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Please connect Superhero wallet',
      });
      return;
    };

    if (accounts === undefined) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Please connect Metamask wallet',
      });
      return;
    }

    setIsLoading(true);
    try {
      const htlc_address = "ak" + aeHtlc.address.substr(2);
      const amount = fromValue * 1000000; // 6 number of digits
      const password = makeid(12);
      const secret_hash = sha256(password);

      // allowance tokens
      setCurrentAction(0);
      let result : any = null;
      result = await aeWallet.usdtContract.methods.allowance({from_account: aeWallet.address, for_account: htlc_address})
      let allowed = result.decodedResult;
      if (allowed === undefined) {
        await aeWallet.usdtContract.methods.create_allowance(htlc_address, amount);
      } else if (allowed < amount) {
        await aeWallet.usdtContract.methods.change_allowance(htlc_address, amount);
      }

      setCurrentAction(1);
      const unix = Date.now() + 1 * 60 * 10 * 1000; // 1 hour
      result = await aeWallet.htlcContract.methods.fund(aeToken.address, secret_hash, bot_addr, ethWallet.address, unix, amount);
      const lock_contract_id = result.decodedResult;

      console.log("lock contract id ", hexdump(lock_contract_id));
      console.log("password ", password);
      console.log("secret_hash ", secret_hash);

      setCurrentAction(2);
      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      const id: string = await web3.eth.net.getId();
      // @ts-ignore
      const deployedNetwork: any = ethHtlc.networks[id];
      const contract = new web3.eth.Contract(
        ethHtlc.abi,
        deployedNetwork.address,
      );

      const fromBlock = await web3.eth.getBlockNumber();
      let events;
      let time_to_wait = 120;
      while (true) {
        events = await contract.getPastEvents('log_fund', {fromBlock: fromBlock});
        for (let event of events) {
          if (event.event !== "log_fund") {
            continue;
          }
          if (event.returnValues.secret_hash.substr(2) !== secret_hash) {
            continue;
          }
          if (event) {
            setCurrentAction(3);
            const new_contract_id = event.returnValues.locked_contract_id.substr(2);
            await contract.methods.withdraw(Buffer.from(new_contract_id, "hex"), password).send({ from: accounts[0] });

            showNotification({
              color: 'green',
              title: 'Success',
              message: 'You got your tokens',
            });
            return;
          }
        }
        await delay(5000);

        time_to_wait -= 5;
        if (time_to_wait <= 0) {
          showNotification({
            color: 'red',
            title: 'Error',
            message: 'Can not finish exchange',
          });
          return;
        }
      }

      contracts.addContract(lock_contract_id, secret_hash, password);
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const onChangeValue = (v: any) => {
    setFromValue(v);
  };

  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <Group m="xs">
          <Text size={"sm"}><strong>From:</strong></Text>
          <Select
            radius={"lg"}
            data={[networks[0]]}
            value={fromNetwork}
          />
        </Group>

        <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
          <Group position="apart" m={"xs"}>
            <Text size={"xs"}><strong>Send:</strong></Text>
            <Text size={"xs"}><strong>Max:</strong></Text>
          </Group>
          <Group position="apart" m={"xs"}>
            <NumberInput style={{border: "0"}} variant="unstyled" value={fromValue} onChange={onChangeValue} defaultValue={0} />
            <Text size={"sm"}>{aeWallet.usdtBalanceFormat.toString()}</Text>
          </Group>
        </Paper>

        <Center style={{margin: "15px"}}>
          <IconExchange size={48} strokeWidth={2} />
        </Center>

        <Group m="xs">
          <Text size={"sm"}><strong>To:</strong></Text>
          <Select
            radius={"lg"}
            data={[networks[1]]}
            value={toNetwork}
          />
        </Group>

        <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
          <Group position="apart" m={"xs"}>
            <Text size={"xs"}><strong>Receive(estimated):</strong></Text>
            <Text size={"xs"}>&nbsp;</Text>
          </Group>
          <Group position="apart" m={"xs"}>
            <NumberInput readOnly style={{border: "0"}} variant="unstyled" value={fromValue} defaultValue={0} />
            <Text size={"sm"}>&nbsp;</Text>
          </Group>
        </Paper>

        <Center style={{paddingTop: "20px"}}>
          <Button loading={isLoading} size={"lg"} radius={"md"} onClick={doExchange}>Exchange</Button>
        </Center>

        { (currentAction !== null) &&
          <Center style={{paddingTop: "20px"}}>
            <Timeline active={currentAction} bulletSize={24} lineWidth={2}>
              <Timeline.Item bullet={<IconCheck size={12} />} title="Approve">
                <Text color="dimmed" size="sm">Approve token to spend</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<IconCheck size={12} />} title="Fund">
                <Text color="dimmed" size="sm">Fund contract with tokens</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<IconCheck size={12} />} title="Waiting">
                <Text color="dimmed" size="sm">Waiting for fund from other side</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<IconCheck size={12} />} title="Withdraw">
                <Text color="dimmed" size="sm">Withdraw funds</Text>
              </Timeline.Item>
            </Timeline>
          </Center>
        }
      </Paper>
    </Stack>
  );
});