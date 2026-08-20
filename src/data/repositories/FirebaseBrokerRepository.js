import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { BrokerRepository } from '../../core/domain/repositories/BrokerRepository.js';
import {
  connectBrokerCallable,
  syncBrokerTradesCallable,
  disconnectBrokerCallable,
  adoptBrokerCallable,
} from '../../lib/brokerSync.js';

export class FirebaseBrokerRepository extends BrokerRepository {
  subscribeToUserDoc(userId, onUpdate, onError) {
    return onSnapshot(doc(db, 'users', userId), onUpdate, onError);
  }

  subscribeToAccounts(userId, onUpdate, onError) {
    return onSnapshot(
      collection(db, 'users', userId, 'brokerAccounts'),
      (snapshot) => onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      onError,
    );
  }

  async syncBrokerTrades(credentials) {
    return syncBrokerTradesCallable(credentials);
  }

  async connectBroker(credentials) {
    return connectBrokerCallable(credentials);
  }

  async disconnectBroker(accountId) {
    return disconnectBrokerCallable(accountId);
  }

  /** Migrates this device's stored broker login onto the server-owned doc. */
  async adoptBrokerAccount(accountId, login) {
    return adoptBrokerCallable(accountId, login);
  }
}
