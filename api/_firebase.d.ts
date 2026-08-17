// Type surface for _firebase.js. The runtime `db` export is a lazy-init Proxy,
// but every property it forwards comes from admin.firestore() — so Firestore
// is its honest type. Keeps `tsc -p api` meaningful without converting the
// credential-sanitising bootstrap itself to TS.
import type adminNamespace from 'firebase-admin';

export declare const admin: typeof adminNamespace;
export declare const db: adminNamespace.firestore.Firestore;
export declare function initAdmin(): typeof adminNamespace;
export declare function isDbReady(): boolean;
export declare const now: () => adminNamespace.firestore.FieldValue;
