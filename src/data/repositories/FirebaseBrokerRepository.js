import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { BrokerRepository } from '../../core/domain/repositories/BrokerRepository.js';
import {
  connectBrokerCallable,
  syncBrokerTradesCallable,
  disconnectBrokerCallable,
} from '../../lib/brokerSync.js';

export class FirebaseBrokerRepository extends BrokerRepository {
  subscribeToUserDoc(userId, onUpdate, onError) {
    return onSnapshot(doc(db, 'users', userId), onUpdate, onError);
  }

  async syncBrokerTrades(credentials) {
    return syncBrokerTradesCallable(credentials);
  }

  async connectBroker(credentials) {
    return connectBrokerCallable(credentials);
  }

  async disconnectBroker() {
    return disconnectBrokerCallable();
  }
}
