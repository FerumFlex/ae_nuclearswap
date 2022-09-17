import React, {useEffect, useState} from 'react';
import './App.css';
import { AppShell } from '@mantine/core';
import { HeaderResponsive } from './Components/Header';
import { FooterCentered } from './Components/Footer';
import { Content } from './Components/Content';
import { initSdk } from './utils/aeternity';

function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [aeSdk, setAeSdk] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const aeSdk = await initSdk();
      setAeSdk(aeSdk);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      header={<HeaderResponsive aeSdk={aeSdk} links={[
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
      <Content aeSdk={aeSdk} />
    </AppShell>
  );
}

export default App;
