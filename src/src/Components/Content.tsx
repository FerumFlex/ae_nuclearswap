import React, { useState } from 'react';
import { Text, Paper, Stack, Select, Group, Center, NumberInput, Button } from '@mantine/core';
import { IconExchange } from '@tabler/icons';
import aeToken from '../contracts/ae_token.json';
import aeHtlc from '../contracts/ae_htlc.json';
import { AeWalletContext, EthWalletContext } from '../store/Contexts';
import { observer } from "mobx-react-lite"


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


export const Content = observer( () => {
  const aeWallet = React.useContext(AeWalletContext);
  const ethWallet = React.useContext(EthWalletContext);
  const [fromNetwork, setfromNetwork] = useState<string>(networks[0].value);
  const [toNetwork, settoNetwork] = useState<string>(networks[1].value);
  const [isLoading, setIsLoading] = useState(false);
  const [fromValue, setFromValue] = useState(0);

  const doExchange = async () => {
    if (aeWallet.aeSdk === null) {
      return
    };

    setIsLoading(true);
    try {
      const htlc_address = "ak" + aeHtlc.address.substr(2);
      const amount = fromValue * 1000000; // 6 number of digits
      const password = "testing";
      const secret_hash = sha256(password);

      // mint tokens
      let result : any = null;
      result = await aeWallet.usdtContract.methods.allowance({from_account: aeWallet.address, for_account: htlc_address})
      let allowed = result.decodedResult;
      if (allowed === undefined) {
        await aeWallet.usdtContract.methods.create_allowance(htlc_address, amount);
      } else if (allowed < amount) {
        await aeWallet.usdtContract.methods.change_allowance(htlc_address, amount);
      }

      const unix = Date.now() + 60 * 10 * 1000; // 1 hour
      result = await aeWallet.htlcContract.methods.fund(aeToken.address, secret_hash, bot_addr, ethWallet.address, unix, amount);
      const lock_transaction_id = result.decodedResult;

      console.log("lock contract id", hexdump(lock_transaction_id));
    } finally {
      setIsLoading(false)
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
      </Paper>
    </Stack>
  );
});