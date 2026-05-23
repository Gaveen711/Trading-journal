import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";

/** Production project — override via VITE_* in .env (see .env.example) */
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'xaujournal-0429';

const firebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Custom domain (Firebase Console → Auth → Settings → Authorized domains)
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auth.xaujournal.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || import.meta.env.VITE_FIREBASE_DATABASEURL_ID,
  projectId: PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebase);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, setPersistence, browserLocalPersistence, browserSessionPersistence };
export const googleProvider = new GoogleAuthProvider();
export default app;

/** Re-export for broker Cloud Functions (optional — set VITE_USE_FIREBASE_CALLABLE=true) */
export { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
