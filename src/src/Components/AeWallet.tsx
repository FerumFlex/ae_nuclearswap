import { Button, Badge, Anchor } from '@mantine/core';
import { useStore } from "../store";
import { observer } from "mobx-react-lite";


function shortenAddress(address: string) : string {
  return address.substr(0, 6) + "..." + address.substr(-4);
}


export const AeWallet = observer(() => {
  const {aeWallet} = useStore();

  const onConnect = () => {
  };

  return (
    <span>
      {aeWallet.address ?
        <Badge>
          <Anchor
            target={"_blank"}
            href={aeWallet.explorerAddressLink}
          >
            AE - {shortenAddress(aeWallet.address)}
          </Anchor>
        </Badge> :
        <Button variant="light" compact onClick={onConnect}>AE Connect</Button>
      }
    </span>
  )
})
