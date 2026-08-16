/**
 * Broker credential storage, split by sensitivity.
 *
 *   localStorage   — account metadata (id, server, login, display name). Not
 *                    secret, and needs to survive a browser restart so the
 *                    account list renders without a reconnect.
 *   sessionStorage — the broker password, for the life of the tab only.
 *
 * The password previously sat in localStorage next to the metadata, where it
 * outlived sign-out and was readable by anyone with access to the browser
 * profile. That is an MT4/MT5 *trading* password: it authorises order
 * placement, not just read access.
 *
 * sessionStorage removes the at-rest and shared-machine exposure. It does not
 * defend against XSS on this origin — only never persisting the password does,
 * which needs a per-sync prompt in the broker UI.
 *
 * This module deliberately has no imports: `firebase.js` calls into it during
 * sign-out, and pulling in the DI container from there would form a cycle.
 */

export const accountsKey = (uid) => `xau-broker-accounts-${uid}`;
export const secretKey = (uid) => `xau-broker-secret-${uid}`;

/**
 * Reads stored account metadata, stripping any `password` left behind by a
 * build that persisted it. The stripped list is written back, so the legacy
 * credential leaves disk the first time an affected user loads the app.
 */
export function readLocalAccounts(uid) {
  if (typeof window === 'undefined' || !uid) return [];
  try {
    const raw = localStorage.getItem(accountsKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    let hadSecret = false;
    const cleaned = parsed.map((account) => {
      if (account && typeof account === 'object' && 'password' in account) {
        hadSecret = true;
        const { password: _drop, ...rest } = account;
        return rest;
      }
      return account;
    });
    if (hadSecret) localStorage.setItem(accountsKey(uid), JSON.stringify(cleaned));
    return cleaned;
  } catch (parseError) {
    console.error('Failed to parse local broker accounts:', parseError);
    return [];
  }
}

export function writeLocalAccounts(uid, accounts) {
  if (typeof window === 'undefined' || !uid) return;
  try {
    if (accounts.length) localStorage.setItem(accountsKey(uid), JSON.stringify(accounts));
    else localStorage.removeItem(accountsKey(uid));
  } catch (storageError) {
    console.warn('Could not persist broker accounts:', storageError);
  }
}

export function readSessionPassword(uid, accountId) {
  if (typeof window === 'undefined' || !uid) return null;
  try {
    const raw = sessionStorage.getItem(secretKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.[accountId] || null;
  } catch {
    return null;
  }
}

export function writeSessionPassword(uid, accountId, password) {
  if (typeof window === 'undefined' || !uid) return;
  try {
    sessionStorage.setItem(secretKey(uid), JSON.stringify({ [accountId]: password }));
  } catch (storageError) {
    console.warn('Could not hold broker credentials for this session:', storageError);
  }
}

/**
 * Clears both stores. Called on disconnect and on sign-out.
 *
 * The sweep over every `xau-broker-*` key is deliberate: on a shared machine
 * the next person to sign in must not inherit the previous user's credentials,
 * and that holds even if we no longer know which uid wrote them.
 */
export function clearBrokerCredentials(uid) {
  if (typeof window === 'undefined') return;
  try {
    if (uid) {
      localStorage.removeItem(accountsKey(uid));
      sessionStorage.removeItem(secretKey(uid));
    }
    Object.keys(localStorage)
      .filter((key) => key.startsWith('xau-broker-accounts-'))
      .forEach((key) => localStorage.removeItem(key));
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('xau-broker-secret-'))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch (storageError) {
    console.warn('Could not clear broker credentials:', storageError);
  }
}
