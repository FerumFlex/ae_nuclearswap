import React from 'react';
import './App.css';
import { AppShell } from '@mantine/core';
import { HeaderResponsive } from './Components/Header';
import { FooterCentered } from './Components/Footer';
import { Content } from './Components/Content';

function App() {
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
