import app, { auth, getFunctions, httpsCallable, connectFunctionsEmulator } from '../firebase';

let functionsInstance = null;

function getFunctionsInstance() {
  if (!functionsInstance) {
    functionsInstance = getFunctions(app, 'asia-southeast1');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
      console.log('Connected to local Cloud Functions emulator on port 5001');
    }
  }
  return functionsInstance;
}

function callCallable(name, payload = {}, timeoutMs = 300000) {
  if (!auth.currentUser) throw new Error('Not authenticated');
  const functions = getFunctionsInstance();
  const fn = httpsCallable(functions, name, { timeout: timeoutMs });
  return fn(payload).then((res) => res.data);
}

export function connectBrokerCallable(payload) {
  return callCallable('connectBroker', payload, 540000);
}

export function syncBrokerTradesCallable() {
  return callCallable('syncBrokerTrades', {}, 300000);
}

export function disconnectBrokerCallable() {
  return callCallable('disconnectBroker', {}, 60000);
}
