import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  useDeviceLanguage,
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(`Firebase client configuration is incomplete: ${missingConfig.join(', ')}`);
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firebase names this imperative API like a React hook, but it configures an
// Auth instance and is intentionally called once during module initialization.
// eslint-disable-next-line react-hooks/rules-of-hooks
useDeviceLanguage(auth);

if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_AUTH_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

const authPersistenceReady = setPersistence(auth, browserSessionPersistence);

export { app, auth, authPersistenceReady, firebaseConfig };
