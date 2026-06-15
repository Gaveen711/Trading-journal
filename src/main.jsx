// Prevent browser from restoring scroll position on refresh — must run before React mounts
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastContext'
import { ThemeProvider } from './hooks/useAppTheme'
import { SpeedInsights } from '@vercel/speed-insights/react'
 
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
            <SpeedInsights />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
