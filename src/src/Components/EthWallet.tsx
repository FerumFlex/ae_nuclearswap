import React, { useEffect } from 'react';

import { Button, Badge } from '@mantine/core';
import { metaMask } from '../connectors/metaMask';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';


export const EthWallet = observer(() => {
  const {ethWallet} = useStore();

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
  }, []);

  const onConnect = () => {
    void metaMask.activate().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
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