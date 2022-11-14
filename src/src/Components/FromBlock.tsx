import { Text, Paper, Group, NumberInput } from '@mantine/core';


export function FromBlock ({ fromValue, setFromValue, maxBalance } : {fromValue: number, setFromValue: any, maxBalance: bigint | undefined}) {
  return (
    <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
      <Group position="apart" m={"xs"}>
        <Text size={"xs"}><strong>Send:</strong></Text>
        <Text size={"xs"}><strong>Max:</strong></Text>
      </Group>
      <Group position="apart" m={"xs"}>
        <NumberInput style={{border: "0"}} variant="unstyled" value={fromValue} onChange={setFromValue} defaultValue={0} />
        <Text size={"sm"}>{maxBalance ? maxBalance.toString() : '-'}</Text>
      </Group>
    </Paper>
  )
}