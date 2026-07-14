import { createContext, useContext, useState } from 'react';
import { createAppServices } from './createAppServices.js';

const AppServicesContext = createContext(null);

/** Owns one stable dependency graph for the lifetime of the React application. */
export function AppServicesProvider({ children, services }) {
  const [resolvedServices] = useState(() => services ?? createAppServices());
  return <AppServicesContext.Provider value={resolvedServices}>{children}</AppServicesContext.Provider>;
}

// Context hooks intentionally share this module so provider and consumer cannot drift.
// eslint-disable-next-line react-refresh/only-export-components
export function useAppServices() {
  const services = useContext(AppServicesContext);
  if (!services) throw new Error('useAppServices must be used within AppServicesProvider');
  return services;
}
