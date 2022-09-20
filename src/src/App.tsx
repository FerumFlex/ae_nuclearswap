import React, {useEffect, useState} from 'react';
import './App.css';
import { AppShell } from '@mantine/core';
import { HeaderResponsive } from './Components/Header';
import { FooterCentered } from './Components/Footer';
import { Content } from './Components/Content';
import { Utils } from './Components/Utils';
import { initSdk } from './utils/aeternity';
import {
  Routes,
  Route,
} from "react-router-dom";
import { observer } from "mobx-react-lite"
import { AeWalletContext, EthWalletContext, ContractsContext } from './store/Contexts';
import AeWallet from './store/AeWallet';
import EthWallet from './store/EthWallet';
import Contracts from './store/Contracts';
import { hooks } from './connectors/metaMask';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks



const App = observer(() => {
  const [aeWallet, setAeWallet] = useState(new AeWallet());
  const [ethWallet, setEthWallet] = useState(new EthWallet());
  const [contracts, setCOntracts] = useState(new Contracts());
  const accounts = useAccounts();

  useEffect(() => {
    (async () => {
      await initSdk(aeWallet);
    })();
  }, []);

  useEffect(() => {
    let address = accounts?.length ? accounts[0] : "";
    ethWallet.setAddress(address);
  }, [accounts])

  return (
    <AeWalletContext.Provider value={aeWallet}>
      <EthWalletContext.Provider value={ethWallet}>
        <ContractsContext.Provider value={contracts}>
          <AppShell
            padding="md"
            header={<HeaderResponsive links={[
              {
                "link": "/",
                "label": "Swap"
              },
              {
                "link": "/utils",
                "label": "Utils"
              }
            ]} />}
            footer={<FooterCentered links={[]} />}
          >
            <Routes>
              <Route path="/" element={<Content />}></Route>
              <Route path="/utils" element={<Utils />}></Route>
            </Routes>
          </AppShell>
        </ContractsContext.Provider>
      </EthWalletContext.Provider>
    </AeWalletContext.Provider>
  );
});

export default App;
