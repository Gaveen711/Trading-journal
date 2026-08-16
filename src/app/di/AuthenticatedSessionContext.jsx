import { createContext, useContext } from 'react';
import { useBrokerAccounts } from '../../hooks/useBrokerAccounts.js';
import { useWallet } from '../../hooks/useWallet.js';

const WalletContext = createContext(null);
const BrokerAccountsContext = createContext(null);

/**
 * Owns one wallet and one broker-accounts subscription for the authenticated
 * session.
 *
 * Both hooks used to be instantiated twice — useWallet in AuthenticatedApp and
 * DashboardLayout, useBrokerAccounts in DashboardLayout and EASetup. Each copy
 * kept its own state, so onboarding's updateBalance moved one balance while the
 * sidebar rendered the other, and the broker hooks opened duplicate onSnapshot
 * listeners on users/{uid} plus a second auth.onAuthStateChanged.
 *
 * Must be mounted inside AppServicesProvider — both hooks resolve repositories
 * through useAppServices().
 */
export function AuthenticatedSessionProvider({ user, children }) {
  const wallet = useWallet(user);
  const brokerAccounts = useBrokerAccounts();
  return (
    <WalletContext.Provider value={wallet}>
      <BrokerAccountsContext.Provider value={brokerAccounts}>
        {children}
      </BrokerAccountsContext.Provider>
    </WalletContext.Provider>
  );
}

// Context hooks intentionally share this module so provider and consumer cannot drift.
// eslint-disable-next-line react-refresh/only-export-components
export function useSessionWallet() {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error('useSessionWallet must be used within AuthenticatedSessionProvider');
  return wallet;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessionBrokerAccounts() {
  const accounts = useContext(BrokerAccountsContext);
  if (!accounts) throw new Error('useSessionBrokerAccounts must be used within AuthenticatedSessionProvider');
  return accounts;
}
