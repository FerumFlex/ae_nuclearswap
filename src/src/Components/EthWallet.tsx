import { useEffect } from 'react';
import { shortenAddress } from '@usedapp/core'

import { Button, Badge, Anchor } from '@mantine/core';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import { useEthers } from '@usedapp/core'
import { config } from '../utils/Config';
import { getChainName } from '@usedapp/core';


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
    switchNetwork(config.readOnlyChainId || 1);
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
            <Anchor onClick={onSwitchNetwork}>Switch to {getChainName(config.readOnlyChainId || 1)}.</Anchor>
          }
        </Badge> :
        <Button variant="light" compact onClick={onConnect}>ETH Connect</Button>
      }
    </span>
  )
})