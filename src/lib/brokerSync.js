import { auth } from '../firebaseAuth.js';

async function callBrokerApi(path, payload) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const response = await fetch(path, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + await user.getIdToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // The route's stable `code` (spec §3.3: 'login-mismatch', 'pro-required',
    // 'email-unverified') is the only way a caller can tell a conflict that
    // means "server truth already exists" from a transport failure. Throwing a
    // bare Error dropped it along with the status, so every caller was left
    // matching on prose.
    const error = new Error(data.message || data.error || 'Broker request failed');
    error.status = response.status;
    if (data.code) error.code = data.code;
    throw error;
  }
  return data;
}

export function connectBrokerCallable(payload) {
  return callBrokerApi('/api/connect-broker', payload);
}

export function syncBrokerTradesCallable(payload = {}) {
  return callBrokerApi('/api/broker-login-sync', { action: 'sync', ...payload });
}

export function disconnectBrokerCallable(accountId) {
  return callBrokerApi('/api/broker-login-sync', { action: 'remove', accountId });
}

/**
 * One-shot migration of the broker `login` from this device's localStorage onto
 * the server-owned account doc (spec §2.1 / D-2). Idempotent server-side, and
 * deliberately not Pro-gated: without it a lapsed user's account list dies with
 * their localStorage. A 409 carries `code: 'login-mismatch'` — server truth
 * already exists and must never be overwritten.
 */
export function adoptBrokerCallable(accountId, login) {
  return callBrokerApi('/api/broker-login-sync', { action: 'adopt', accountId, login });
}
