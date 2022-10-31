import { useEffect } from 'react';

import { Button, Badge } from '@mantine/core';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import { useEthers } from '@usedapp/core'


export const EthWallet = observer(() => {
  const {ethWallet} = useStore();
  const { activateBrowserWallet } = useEthers();

  useEffect(() => {
    activateBrowserWallet();
  }, [activateBrowserWallet]);

  const onConnect = () => {
    activateBrowserWallet();
  };

  return (
    <span>
      {
        ethWallet.address ?
        <Badge>ETH - {ethWallet.address.substr(0, 4) + "..." + ethWallet.address.substr(-4)}</Badge> :
        <Button variant="light" compact onClick={onConnect}>Connect</Button>
      }
    </span>
  )
})