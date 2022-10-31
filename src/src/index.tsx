import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from '@mantine/notifications';
import store, { StoreContext } from './store';
import { DAppProvider } from '@usedapp/core'
import { config } from './utils/Config';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StoreContext.Provider value={store}>
      <DAppProvider config={config}>
        <NotificationsProvider position="top-right">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NotificationsProvider>
      </DAppProvider>
    </StoreContext.Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
