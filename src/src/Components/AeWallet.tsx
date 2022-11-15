import { Button, Badge } from '@mantine/core';
import { useStore } from "../store";
import { observer } from "mobx-react-lite";


export const AeWallet = observer(() => {
  const {aeWallet} = useStore();

  const onConnect = () => {
  };

  return (
    <span>
      {aeWallet.address ?
        <Badge>AE - {aeWallet.address.substr(0, 5) + "..." + aeWallet.address.substr(-4)}</Badge> :
        <Button variant="light" compact onClick={onConnect}>Connect</Button>
      }
    </span>
  )
})
