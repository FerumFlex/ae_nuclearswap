import { useState } from 'react';
import { Text, Paper, Stack, Select, Group, Center, NumberInput, Button } from '@mantine/core';
import { IconExchange } from '@tabler/icons';


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


export function Content() {
  const [fromNetwork, setfromNetwork] = useState<string>(networks[0].value);
  const [toNetwork, settoNetwork] = useState<string>(networks[1].value);

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

        <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
          <Group position="apart" m={"xs"}>
            <Text size={"xs"}><strong>Send:</strong></Text>
            <Text size={"xs"}><strong>Max:</strong></Text>
          </Group>
          <Group position="apart" m={"xs"}>
            <NumberInput style={{border: "0"}} variant="unstyled" defaultValue={0} />
            <Text size={"sm"}>1000.0</Text>
          </Group>
        </Paper>

        <Center style={{margin: "15px"}}>
          <IconExchange size={48} strokeWidth={2} />
        </Center>

        <Group m="xs">
          <Text size={"sm"}><strong>To:</strong></Text>
          <Select
            radius={"lg"}
            data={networks}
            value={toNetwork}
          />
        </Group>

        <Paper withBorder radius={"lg"} shadow="lg" style={{padding: "10px", backgroundColor: "rgb(20, 21, 23)"}}>
          <Group position="apart" m={"xs"}>
            <Text size={"xs"}><strong>Receive(estimated):</strong></Text>
            <Text size={"xs"}>&nbsp;</Text>
          </Group>
          <Group position="apart" m={"xs"}>
            <NumberInput readOnly style={{border: "0"}} variant="unstyled" defaultValue={0} />
            <Text size={"sm"}>&nbsp;</Text>
          </Group>
        </Paper>

        <Center style={{paddingTop: "20px"}}>
          <Button size={"lg"} radius={"md"}>Exchange</Button>
        </Center>
      </Paper>
    </Stack>
  );
}