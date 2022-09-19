import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineThemeOverride, MantineProvider } from '@mantine/core';
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from '@mantine/notifications';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const myTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  defaultRadius: 0,
};

root.render(
  <React.StrictMode>
    <NotificationsProvider position="top-right">
      <MantineProvider theme={myTheme} withGlobalStyles withNormalizeCSS>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </NotificationsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
