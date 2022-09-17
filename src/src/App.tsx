import React, {useEffect, useState} from 'react';
import './App.css';
import { AppShell } from '@mantine/core';
import { HeaderResponsive } from './Components/Header';
import { FooterCentered } from './Components/Footer';
import { Content } from './Components/Content';
import { initSdk } from './utils/aeternity';

function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      const aeSdk = await initSdk();
      setSdkReady(true);
      const _address = await aeSdk.address();
      setAddress(_address);
      console.log(_address);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      header={<HeaderResponsive links={[
        // {
        //   "link": "/about",
        //   "label": "Features"
        // },
        // {
        //   "link": "/pricing",
        //   "label": "Pricing"
        // },
        // {
        //   "link": "/learn",
        //   "label": "Learn"
        // },
        // {
        //   "link": "/community",
        //   "label": "Community"
        // }
      ]} />}
      footer={<FooterCentered links={[
        // {
        //   "link": "#",
        //   "label": "Contact"
        // },
        // {
        //   "link": "#",
        //   "label": "Privacy"
        // },
        // {
        //   "link": "#",
        //   "label": "Blog"
        // }
      ]} />}
    >
      <Content />
    </AppShell>
  );
}

export default App;
