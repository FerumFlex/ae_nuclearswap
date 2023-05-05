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
import { useEthers, useTokenBalance } from '@usedapp/core'
import usdtToken from './contracts/USDT.json';
import { NotificationsProvider } from '@mantine/notifications';


const App = observer(() => {
  const { account, chainId } = useEthers();
  const {aeWallet, ethWallet} = useStore();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
  const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  let chainIdStr : string = chainId ? chainId.toString() : "";
  // @ts-ignore
  let address = chainIdStr && usdtToken.networks[chainIdStr] ? usdtToken.networks[chainIdStr].address : "";
  let usdtBalance = useTokenBalance(address, account);

  useEffect(() => {
    (async () => {
      await initSdk(aeWallet);
    })();
  }, [aeWallet]);

  useEffect(() => {
    ethWallet.setInfo(account ? account : "", chainId?.toString(), usdtBalance?.toBigInt());
  }, [account, chainId, usdtBalance, ethWallet]);

  const HEADER_LINKS = [
    {
      "link": "/",
      "label": "Swap"
    },
    {
      "link": "/utils",
      "label": "Utils"
    }
  ];

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <NotificationsProvider position="top-right">
          <AppShell
            padding="md"
            header={<HeaderResponsive links={HEADER_LINKS} />}
            footer={<FooterCentered links={[]} />}
          >
            <Routes>
              <Route path="/" element={<Content />}></Route>
              <Route path="/utils" element={<Utils />}></Route>
            </Routes>
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
});

export default App;
