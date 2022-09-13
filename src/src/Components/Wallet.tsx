import React, { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { hooks, metaMask } from '../connectors/metaMask';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks


export function Wallet() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState(undefined)

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
      { accounts && accounts.length ? accounts[0].slice(0, 5) + '...' + accounts[0].slice(-5) : <Button onClick={onConnect}>Connect</Button>}
    </div>
  )
}
