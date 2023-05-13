import {useEffect, useState} from 'react';
import './App.css';
import { AppShell } from '@mantine/core';
import { HeaderResponsive } from './Components/Header';
import { FooterCentered } from './Components/Footer';
import { initSdk } from './utils/aeternity';
import { Routes, Route } from "react-router-dom";
import { observer } from "mobx-react-lite"
import { useStore } from './store';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useEthers, useTokenBalance } from '@usedapp/core'
import usdtToken from './contracts/USDT.json';
import { NotificationsProvider } from '@mantine/notifications';
import { ARBITRUM_USDT_ADDRESS } from './utils/utils';

// pages
import { ContentPage } from './Pages/Content';
import { UtilsPage } from './Pages/Utils';
import { AboutPage } from './Pages/About';


const AE_NETWORK = process.env.REACT_APP_AE_NETWORK;
const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK;

const App = observer(() => {
  const { account, chainId } = useEthers();
  const {aeWallet, ethWallet} = useStore();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
  const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  let chainIdStr : string = chainId ? chainId.toString() : "";
  let address: string;
  if (ETH_NETWORK === "arbitrum") {
    address = ARBITRUM_USDT_ADDRESS;
  } else {
    // @ts-ignore
    address = chainIdStr && usdtToken.networks[chainIdStr] ? usdtToken.networks[chainIdStr].address : "";
  }
  let usdtBalance = useTokenBalance(address, account);

  useEffect(() => {
    (async () => {
      await initSdk(aeWallet);
    })();
  }, [aeWallet]);

  useEffect(() => {
    ethWallet.setInfo(account ? account : "", chainId?.toString(), usdtBalance?.toBigInt());
  }, [account, chainId, usdtBalance, ethWallet]);

  let HEADER_LINKS = [
    {
      "link": "/",
      "label": "Bridge"
    },
    {
      "link": "/about",
      "label": "About"
    }
  ];

  if (AE_NETWORK === "ae_uat") {
    HEADER_LINKS.push(
      {
        "link": "/utils",
        "label": "Utils"
      }
    );
  }

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
              <Route path="/" element={<ContentPage />}></Route>
              <Route path="/about" element={<AboutPage />}></Route>
              <Route path="/utils" element={<UtilsPage />}></Route>
            </Routes>
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
});

export default App;
