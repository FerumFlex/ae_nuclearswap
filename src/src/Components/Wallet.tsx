import React, { useEffect } from 'react';
import { Button } from '@mantine/core';
import { metaMask } from '../connectors/metaMask';
import { useStore } from '../store';
import { observer } from "mobx-react-lite"


export const Wallet = observer(() => {
  const {aeWallet, ethWallet} = useStore()

  // attempt to connect eagerly on mount
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
    <div>
      <p>
        ETH: { ethWallet.address ? ethWallet.address : <Button onClick={onConnect}>Connect</Button>}
        <br />
        AE: {aeWallet.address}
      </p>
    </div>
  )
})
