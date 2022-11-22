import { useEffect } from 'react';
import { shortenAddress } from '@usedapp/core'

import { Button, Badge, Anchor } from '@mantine/core';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import { useEthers, Goerli } from '@usedapp/core'


export const EthWallet = observer(() => {
  const {ethWallet} = useStore();
  const { activateBrowserWallet, switchNetwork } = useEthers();

  useEffect(() => {
    activateBrowserWallet();
  }, [activateBrowserWallet]);

  const onConnect = () => {
    activateBrowserWallet();
  };

  const onSwitchNetwork = () => {
    switchNetwork(Goerli.chainId);
  };

  return (
    <span>
      {
        ethWallet.address ?
        <Badge>
          {
            ethWallet.networkId ?
            <Anchor
              title={ethWallet.address}
              target={"_blank"}
              href={ethWallet.explorerAddressLink}
            >ETH - {shortenAddress(ethWallet.address)}</Anchor> :
            <Anchor onClick={onSwitchNetwork}>Switch to goerli.</Anchor>
          }
        </Badge> :
        <Button variant="light" compact onClick={onConnect}>ETH Connect</Button>
      }
    </span>
  )
})