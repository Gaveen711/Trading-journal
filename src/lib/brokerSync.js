import app, { auth, getFunctions, httpsCallable } from '../firebase';

function callCallable(name, payload = {}, timeoutMs = 300000) {
  if (!auth.currentUser) throw new Error('Not authenticated');
  const functions = getFunctions(app, 'asia-southeast1');
  const fn = httpsCallable(functions, name, { timeout: timeoutMs });
  return fn(payload).then((res) => res.data);
}

export function connectBrokerCallable(payload) {
  return callCallable('connectBroker', payload, 540000);
}

export function syncBrokerTradesCallable() {
  return callCallable('syncBrokerTrades', {}, 300000);
}
