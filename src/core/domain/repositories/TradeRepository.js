export class TradeRepository {
  subscribeToTrades(userId, onUpdate, onError) {
    throw new Error('subscribeToTrades not implemented');
  }

  addTrade(userId, tradeData) {
    throw new Error('addTrade not implemented');
  }

  removeTrade(userId, tradeId) {
    throw new Error('removeTrade not implemented');
  }

  editTrade(userId, tradeId, updatedData) {
    throw new Error('editTrade not implemented');
  }

  resetTrades(userId, idToken) {
    throw new Error('resetTrades not implemented');
  }
}
