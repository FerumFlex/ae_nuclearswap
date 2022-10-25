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
import { MantineThemeOverride, MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks


const myTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  defaultRadius: 0,
};

const App = observer(() => {
  const accounts = useAccounts();
  const {aeWallet, ethWallet} = useStore()
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

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
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
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
      </MantineProvider>
    </ColorSchemeProvider>
  );
});

export default App;
