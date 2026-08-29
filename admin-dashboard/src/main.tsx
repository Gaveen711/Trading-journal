import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import App from './App';
import { Toaster } from './components/ui/sonner';

const root = document.getElementById('root');
if (!root) throw new Error('The admin application root element is missing.');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <App />
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  </StrictMode>,
);
