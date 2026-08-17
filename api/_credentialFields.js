// Canonical inventory of broker-credential fields, and the deletion patch
// used to scrub them.
//
// This list is privacy machinery: the product's promise is that broker
// credentials never persist server-side. It used to live as five hand-copied
// lists (three API scrub sites + two migration scripts), and the API copies
// had drifted to scrubbing only 4 of the 7 account fields. One list, one
// patch builder — every scrub site imports from here.
//
// Plain .js on purpose: the migration scripts run under node directly and
// cannot import TypeScript.

/** Credential fields legacy deployments wrote on users/{uid}. */
export const USER_CREDENTIAL_FIELDS = ['brokerLogin', 'brokerPassword', 'metaApiAccountId'];

/** Credential fields legacy deployments wrote on users/{uid}/brokerAccounts/{id}. */
export const ACCOUNT_CREDENTIAL_FIELDS = [
  'login',
  'password',
  'brokerLogin',
  'brokerPassword',
  'metaApiAccountId',
  'providerAccountId',
  'credentialFingerprint',
];

/**
 * Builds a merge patch deleting every listed field.
 * @param {string[]} fields
 * @param {() => unknown} deleteSentinelFactory e.g. () => admin.firestore.FieldValue.delete()
 */
export function deletionPatch(fields, deleteSentinelFactory) {
  return Object.fromEntries(fields.map((field) => [field, deleteSentinelFactory()]));
}
