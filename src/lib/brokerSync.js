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
  if (!response.ok) throw new Error(data.message || data.error || 'Broker request failed');
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
