import { Text, Center, Timeline } from '@mantine/core';
import { IconCheck } from '@tabler/icons';
import { WAIT_MINUTES } from './Actions';

export default function Progress ({ currentAction }: { currentAction: number | null}) {
  if (currentAction === null) {
    return null;
  }

  return (
    <Center style={{paddingTop: "20px"}}>
      <Timeline active={currentAction} bulletSize={24} lineWidth={2}>
        <Timeline.Item bullet={<IconCheck size={12} />} title="Approve">
          <Text color="dimmed" size="sm">Approve token to spend</Text>
        </Timeline.Item>
        <Timeline.Item bullet={<IconCheck size={12} />} title="Fund">
          <Text color="dimmed" size="sm">Fund contract with tokens</Text>
        </Timeline.Item>
        <Timeline.Item bullet={<IconCheck size={12} />} title="Waiting">
          <Text color="dimmed" size="sm">Waiting for signature (max: {WAIT_MINUTES} minutes)</Text>
        </Timeline.Item>
        <Timeline.Item bullet={<IconCheck size={12} />} title="Withdraw or Cancel">
          <Text color="dimmed" size="sm">Claim funds or cancel</Text>
        </Timeline.Item>
      </Timeline>
    </Center>
  )
}