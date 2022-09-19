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


function App() {
  const [aeSdk, setAeSdk] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const _aeSdk = await initSdk();
      setAeSdk(_aeSdk);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      header={<HeaderResponsive aeSdk={aeSdk} links={[
        {
          "link": "/",
          "label": "Swap"
        },
        {
          "link": "/utils",
          "label": "Utils"
        }
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
      <Routes>
        <Route path="/" element={<Content aeSdk={aeSdk} />}></Route>
        <Route path="/utils" element={<Utils aeSdk={aeSdk} />}></Route>
      </Routes>
    </AppShell>
  );
}

export default App;
