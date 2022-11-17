import { Text, Paper, Group, NumberInput } from '@mantine/core';
import { BigNumber } from 'ethers';


export function ToBlock ({ fromValue, maxBalance, precision } : {fromValue: number, maxBalance: number | undefined, precision: number}) {
  return (
    <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
      <Group position="apart" m={"xs"}>
        <Text size={"xs"}><strong>Receive:</strong></Text>
        <Text size={"xs"}>&nbsp;</Text>
      </Group>
      <Group position="apart" m={"xs"}>
        <NumberInput
          style={{border: "0"}}
          variant="unstyled"
          value={fromValue}
          defaultValue={0}
          precision={precision}
        />
        <Text size={"sm"}>&nbsp;</Text>
        <Text size={"sm"}>{maxBalance ? maxBalance.toString() : '-'}</Text>
      </Group>
    </Paper>
  )
}