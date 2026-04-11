// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebase= {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASURMENT_ID

};

const app = initializeApp(firebase);

// ✅ Create db FIRST
const db = getFirestore(app);

// ✅ Now you can log it
console.log("DB initialized:", db);

// Exports
const auth = getAuth(app);
let analytics = null;
try { analytics = getAnalytics(app) } catch (e) { console.warn('Analytics blocked', e) }
export { db, auth, analytics };
export const googleProvider = new GoogleAuthProvider();
export default app;
  