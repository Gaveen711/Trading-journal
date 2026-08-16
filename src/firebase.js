import {
  clearIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { clearBrokerCredentials } from './lib/brokerCredentials.js';
import app, {
  auth,
  browserLocalPersistence,
  browserSessionPersistence,
  facebookProvider,
  googleProvider,
  setPersistence,
} from './firebaseAuth.js';

// IndexedDB-backed cache rather than the default in-memory one. The main win is
// listener resumption: after a reload, onSnapshot re-attaches with a resume
// token and pays only for documents that changed, instead of re-reading the
// whole first page of trades every time. Secondary win is that the first paint
// can come from disk instead of a network round trip.
//
// This must be the only Firestore construction site in the client —
// initializeFirestore throws if getFirestore already ran for this app.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const storage = getStorage(app);

/**
 * Signs out and destroys the on-disk cache.
 *
 * The cache holds trade records, and Firestore does *not* drop them when the
 * auth user changes — on a shared machine the next person to sign in would
 * inherit the previous user's documents on disk. So sign-out has to clear it.
 *
 * clearIndexedDbPersistence only runs against a terminated instance, and
 * terminate() kills `db` permanently, so this has to end in a full page load
 * rather than a client-side navigation — nothing can use `db` afterwards.
 *
 * Clearing throws 'failed-precondition' when another tab still holds the
 * database. That is reported, not fatal: sign-out has already happened, and the
 * remaining tabs are still the same user.
 */
export async function signOutAndClearCache() {
  const uid = auth.currentUser?.uid;
  localStorage.removeItem('xau-auth-hint');
  // Broker credentials get the same treatment as the Firestore cache, and for
  // the same reason: they are per-user data that must not outlive the session
  // on a shared machine. This clears both the metadata and any session-held
  // password, including blobs left by a previous identity on this device.
  clearBrokerCredentials(uid);
  // Let a sign-out failure reach the caller — do not tear down the cache or
  // navigate if the user is in fact still signed in.
  await auth.signOut();
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (error) {
    console.warn('Firestore cache could not be cleared:', error);
  }
  window.location.assign('/');
}

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
