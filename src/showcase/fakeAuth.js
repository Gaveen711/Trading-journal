/**
 * The auth surface the app services expose, without Firebase behind it.
 *
 * Hooks read `auth.currentUser` for the uid/email and subscribe through
 * `onAuthStateChanged`; the user object needs `getIdToken` because the
 * trade reset path asks for a bearer token. Nothing here ever changes state —
 * the showcase is signed in for the life of the page.
 */
import { DEMO_DISPLAY_NAME, DEMO_EMAIL, DEMO_UID } from './demoData.js';

export const showcaseUser = Object.freeze({
  uid: DEMO_UID,
  email: DEMO_EMAIL,
  displayName: DEMO_DISPLAY_NAME,
  emailVerified: true,
  photoURL: null,
  isAnonymous: false,
  providerData: [],
  getIdToken: async () => 'showcase',
  reload: async () => {},
});

export const fakeAuth = {
  currentUser: showcaseUser,
  /** Delivers off the subscribing stack, as Firebase does; unsubscribing first cancels it. */
  onAuthStateChanged(callback) {
    let active = true;
    queueMicrotask(() => {
      if (active) callback(showcaseUser);
    });
    return () => { active = false; };
  },
  async signOut() {},
};
