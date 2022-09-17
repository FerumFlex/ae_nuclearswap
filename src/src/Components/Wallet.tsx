import React, { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { hooks, metaMask } from '../connectors/metaMask';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks


export function Wallet({aeSdk}: {aeSdk: any}) {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();
  const [address, setAddress] = useState("");

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

  useEffect(() => {
    if (!aeSdk) {
      return;
    }
    (async() => {
      const _address = await aeSdk.address()
      setAddress(_address);
    })();
  }, [aeSdk])

  const onConnect = () => {
    void metaMask.activate().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
  };

  return (
    <div>
      <p>ETH: { accounts && accounts.length ? accounts[0] : <Button onClick={onConnect}>Connect</Button>}</p>
      <p>AE: {address}</p>
    </div>
  )
}
