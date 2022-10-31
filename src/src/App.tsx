import {useEffect, useState} from 'react';
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
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useEthers } from '@usedapp/core'


const App = observer(() => {
  const { account } = useEthers()
  const {aeWallet, ethWallet} = useStore()
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    (async () => {
      await initSdk(aeWallet);
    })();
  }, [aeWallet]);

  useEffect(() => {
    ethWallet.setAddress(account ? account : "");
  }, [account, ethWallet])

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
