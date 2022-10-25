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
import { useStore } from './store';
import { hooks } from './connectors/metaMask';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks


const App = observer(() => {
  const accounts = useAccounts();
  const {aeWallet, ethWallet} = useStore()

  useEffect(() => {
    (async () => {
      await initSdk(aeWallet);
    })();
  }, [aeWallet]);

  useEffect(() => {
    let address = accounts?.length ? accounts[0] : "";
    ethWallet.setAddress(address);
  }, [accounts, ethWallet])

  return (
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
  );
});

export default App;
