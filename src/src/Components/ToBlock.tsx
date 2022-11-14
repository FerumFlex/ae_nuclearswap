import { Text, Paper, Group, NumberInput } from '@mantine/core';


export function ToBlock ({ fromValue } : {fromValue: number}) {
  return (
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
  )
}