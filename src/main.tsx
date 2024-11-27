// index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import WakeLockProvider from './providers/WakeLockProvider';
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";

import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <WakeLockProvider>
        <App />
      </WakeLockProvider>
      </PersistGate>
      </Provider>
      </ErrorBoundary>
  </StrictMode>
);
