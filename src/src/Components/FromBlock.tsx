import { Text, Paper, Group, NumberInput, Badge, Anchor } from '@mantine/core';
import { BigNumber } from 'ethers';


export function FromBlock ({ fromValue, setFromValue, maxBalance, precision } : {fromValue: number, setFromValue: any, maxBalance: number | undefined, precision: number}) {
  const onChangeFromAmount = async (value: number) => {
    if (Number.isFinite(value)) {
      const tokenAmount = BigNumber.from(Math.trunc(value * (10 ** precision)));
      setFromValue(tokenAmount.toBigInt());
    }
  };

  const onSetMaxAmount = () => {
    if (maxBalance) {
      setFromValue(Math.trunc(maxBalance * (10 ** precision)));
    }
  };

  return (
    <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
      <Group position="apart" m={"xs"}>
        <Text size={"xs"}><strong>Send:</strong></Text>
        <Text size={"xs"}>
          <Badge size={"xs"}><Anchor onClick={onSetMaxAmount}>Max:</Anchor></Badge>
        </Text>
      </Group>
      <Group position="apart" m={"xs"}>
        <NumberInput
          style={{border: "0"}}
          precision={precision}
          variant="unstyled"
          value={fromValue}
          onChange={onChangeFromAmount}
          defaultValue={0}
          max={maxBalance}
        />
        <Text size={"sm"}>{maxBalance ? maxBalance.toString() : '-'}</Text>
      </Group>
    </Paper>
  )
}