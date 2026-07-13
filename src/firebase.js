import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import app, {
  auth,
  browserLocalPersistence,
  browserSessionPersistence,
  facebookProvider,
  googleProvider,
  setPersistence,
} from './firebaseAuth.js';

const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  browserLocalPersistence,
  browserSessionPersistence,
  db,
  facebookProvider,
  googleProvider,
  setPersistence,
  storage,
};
export default app;
/** Re-export for broker Cloud Functions (optional — set VITE_USE_FIREBASE_CALLABLE=true) */
export { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
