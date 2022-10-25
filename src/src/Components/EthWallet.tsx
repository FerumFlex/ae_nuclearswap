import React, { useEffect } from 'react';

import { Button } from '@mantine/core';
import { metaMask } from '../connectors/metaMask';
import { useStore } from '../store';


export const EthWallet = () => {
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
        ethWallet.address ? ethWallet.address.substr(0, 4) + "..." + ethWallet.address.substr(-4) :
        <Button variant="light" compact onClick={onConnect}>Connect</Button>
      }
    </span>
  )
}