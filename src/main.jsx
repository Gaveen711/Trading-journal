import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import App from './App.jsx';
import { AppProviders } from './app/providers/AppProviders.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

// Route effects own scroll state; disable browser restoration before React mounts.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
        <SpeedInsights />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
