export class BrokerRepository {
  subscribeToUserDoc(_userId, _onUpdate, _onError) {
    throw new Error('subscribeToUserDoc not implemented');
  }

  syncBrokerTrades(_credentials) {
    throw new Error('syncBrokerTrades not implemented');
  }

  connectBroker(_credentials) {
    throw new Error('connectBroker not implemented');
  }

  disconnectBroker() {
    throw new Error('disconnectBroker not implemented');
  }
}
