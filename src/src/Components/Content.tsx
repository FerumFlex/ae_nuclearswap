import { useState } from 'react';
import { createStyles, Text, Paper, Stack, Select, Group, Center, Button, Timeline } from '@mantine/core';
import { IconExchange, IconCheck } from '@tabler/icons';
import aeToken from '../contracts/ae_token.json';
import aeGate from '../contracts/ae_gate.json';
import ethGate from '../contracts/Gate.json';
import { useStore } from '../store';
import { observer } from "mobx-react-lite";
import { showNotification } from '@mantine/notifications';
import { networks, bot_addr } from '../utils/Config';
import { makeid, delay, hexdump } from '../utils/utils';
import { useEthers } from '@usedapp/core';
import { FromBlock } from './FromBlock';
import { ToBlock } from './ToBlock';

const Buffer = require('buffer').Buffer;
const Web3 = require('web3');

var sha256 = require('js-sha256');


const useStyles = createStyles((theme) => ({
  exchangeButton: {
    cursor: 'pointer'
  }
}));

export const Content = observer( () => {
  const { account } = useEthers();
  const {aeWallet, ethWallet, contracts } = useStore();
  const [fromNetwork, setfromNetwork] = useState<string>(networks[0].value);
  const [toNetwork, settoNetwork] = useState<string>(networks[1].value);
  const [isLoading, setIsLoading] = useState(false);
  const [fromValue, setFromValue] = useState(0);
  const [currentAction, setCurrentAction] = useState<number | null>(null);
  const { classes } = useStyles();

  const doExchange = async () => {
    if (aeWallet.aeSdk === null) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Please connect Superhero wallet',
      });
      return;
    };

    if (account === undefined) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Please connect Metamask wallet',
      });
      return;
    }

    setIsLoading(true);
    try {
      const gate_address = "ak" + aeGate.address.substr(2);
      const amount = fromValue * 1000000; // 6 number of digits
      const password = makeid(12);
      const secret_hash = sha256(password);

      // allowance tokens
      setCurrentAction(0);
      let result : any = null;
      result = await aeWallet.usdtContract.methods.allowance({from_account: aeWallet.address, for_account: gate_address})
      let allowed = result.decodedResult;
      if (allowed === undefined) {
        await aeWallet.usdtContract.methods.create_allowance(gate_address, amount);
      } else if (allowed < amount) {
        await aeWallet.usdtContract.methods.change_allowance(gate_address, amount);
      }

      setCurrentAction(1);
      const unix = Date.now() + 1 * 60 * 10 * 1000; // 1 hour
      result = await aeWallet.gateContract.methods.fund(aeToken.address, secret_hash, bot_addr, ethWallet.address, unix, amount);
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
        ethGate.abi,
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
            await contract.methods.withdraw(Buffer.from(new_contract_id, "hex"), password).send({ from: account });

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
          break;
        }
      }

      contracts.addContract(lock_contract_id, secret_hash, password);
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const onExchange = () => {
    setfromNetwork(toNetwork);
    settoNetwork(fromNetwork);
  };

  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <Group m="xs">
          <Text size={"sm"}><strong>From:</strong></Text>
          <Select
            radius={"lg"}
            data={networks}
            value={fromNetwork}
          />
        </Group>

        <FromBlock fromValue={fromValue} setFromValue={setFromValue} maxBalance={ethWallet.usdtBalance} />

        <Center style={{margin: "15px"}}>
          <IconExchange onClick={onExchange} size={48} className={classes.exchangeButton} strokeWidth={2} />
        </Center>

        <Group m="xs">
          <Text size={"sm"}><strong>To:</strong></Text>
          <Select
            radius={"lg"}
            data={networks}
            value={toNetwork}
          />
        </Group>

        <ToBlock fromValue={fromValue} />

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