import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, authPersistenceReady } from '../firebase';
import { admissionErrorMessage, verifyAdminAdmission } from './adminAdmission';

type AuthStatus = 'checking' | 'signed-out' | 'authorized';
type SignOutReason = 'manual' | 'idle' | 'authorization-lost';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  notice: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutSecurely: (reason?: SignOutReason) => Promise<void>;
  clearNotice: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const configuredIdleMinutes = Number(import.meta.env.VITE_ADMIN_IDLE_TIMEOUT_MINUTES);
const idleMinutes = Number.isFinite(configuredIdleMinutes)
  ? Math.min(60, Math.max(5, configuredIdleMinutes))
  : 15;

export const ADMIN_IDLE_TIMEOUT_MS = idleMinutes * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [notice, setNotice] = useState<string | null>(null);
  const authorizationRun = useRef(0);

  const closeSession = useCallback(async (reason: SignOutReason = 'manual') => {
    await signOut(auth);
    setUser(null);
    setStatus('signed-out');
    setNotice(reason === 'idle' ? 'Your session ended after a period of inactivity.' : null);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    void authPersistenceReady.then(() => {
      if (!active) return;

      unsubscribe = onIdTokenChanged(auth, (nextUser) => {
        const run = ++authorizationRun.current;

        if (!nextUser) {
          setUser(null);
          setStatus('signed-out');
          return;
        }

        setStatus('checking');
        void verifyAdminAdmission(nextUser).then(() => {
          if (!active || run !== authorizationRun.current) return;
          setUser(nextUser);
          setNotice(null);
          setStatus('authorized');
        }).catch(async (error: unknown) => {
          if (!active || run !== authorizationRun.current) return;
          setNotice(admissionErrorMessage(error));
          await signOut(auth);
          if (!active) return;
          setUser(null);
          setStatus('signed-out');
        });
      });
    }).catch(() => {
      if (!active) return;
      setNotice('Secure browser-session storage is unavailable. Check browser privacy settings.');
      setStatus('signed-out');
    });

    return () => {
      active = false;
      authorizationRun.current += 1;
      unsubscribe();
    };
  }, []);

  const completeAdmission = useCallback(async (nextUser: User) => {
    try {
      await verifyAdminAdmission(nextUser, true);
      setUser(nextUser);
      setNotice(null);
      setStatus('authorized');
    } catch (error) {
      setNotice(admissionErrorMessage(error));
      await signOut(auth);
      setUser(null);
      setStatus('signed-out');
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setNotice(null);
    setStatus('checking');
    try {
      await authPersistenceReady;
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await completeAdmission(credential.user);
    } catch (error) {
      if (!auth.currentUser) setStatus('signed-out');
      throw error;
    }
  }, [completeAdmission]);

  useEffect(() => {
    if (status !== 'authorized' || !user) return;

    let expiresAt = Date.now() + ADMIN_IDLE_TIMEOUT_MS;
    let timeoutId: ReturnType<typeof setTimeout>;

    const endIdleSession = () => {
      void closeSession('idle');
    };
    const schedule = () => {
      clearTimeout(timeoutId);
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        endIdleSession();
        return;
      }
      timeoutId = setTimeout(endIdleSession, remaining);
    };
    const recordActivity = () => {
      expiresAt = Date.now() + ADMIN_IDLE_TIMEOUT_MS;
      schedule();
    };
    const checkVisibility = () => {
      if (document.visibilityState === 'visible') schedule();
    };

    const activityEvents: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    const passiveOptions: AddEventListenerOptions = { passive: true, capture: true };

    schedule();
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, passiveOptions));
    document.addEventListener('visibilitychange', checkVisibility);

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity, passiveOptions));
      document.removeEventListener('visibilitychange', checkVisibility);
    };
  }, [closeSession, status, user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    notice,
    signInWithEmail,
    signOutSecurely: closeSession,
    clearNotice: () => setNotice(null),
  }), [closeSession, notice, signInWithEmail, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
