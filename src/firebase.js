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
