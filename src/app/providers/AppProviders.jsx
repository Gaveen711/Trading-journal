import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ToastContext.jsx';
import { ThemeProvider } from '../../hooks/useAppTheme.js';

/** Public-shell providers stay infrastructure-light to protect the entry bundle. */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
