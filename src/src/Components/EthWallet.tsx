import { useEffect } from 'react';
import { shortenAddress } from '@usedapp/core'

import { Button, Badge, Anchor } from '@mantine/core';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import { useEthers } from '@usedapp/core'


export const EthWallet = observer(() => {
  const {ethWallet} = useStore();
  const { activateBrowserWallet, chainId } = useEthers();

  useEffect(() => {
    activateBrowserWallet();
  }, [activateBrowserWallet]);

  const onConnect = () => {
    activateBrowserWallet();
  };

  return (
    <span>
      {
        ethWallet.address && chainId ?
        <Badge>
            <Anchor
              target={"_blank"}
              href={ethWallet.explorerAddressLink}
            >ETH - {shortenAddress(ethWallet.address)}</Anchor>
          </Badge> :
        <Button variant="light" compact onClick={onConnect}>ETH Connect</Button>
      }
    </span>
  )
})