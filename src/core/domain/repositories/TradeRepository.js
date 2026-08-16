export class TradeRepository {
  subscribeToTrades(_userId, _onUpdate, _onError) {
    throw new Error('subscribeToTrades not implemented');
  }

  getTradesPage(_userId, _cursor, _pageSize) {
    throw new Error('getTradesPage not implemented');
  }

  subscribeToTradesInRange(_userId, _startDate, _endDate, _onUpdate, _onError) {
    throw new Error('subscribeToTradesInRange not implemented');
  }

  addTrade(_userId, _tradeData) {
    throw new Error('addTrade not implemented');
  }

  removeTrade(_userId, _tradeId) {
    throw new Error('removeTrade not implemented');
  }

  editTrade(_userId, _tradeId, _updatedData) {
    throw new Error('editTrade not implemented');
  }

  resetTrades(_userId, _idToken) {
    throw new Error('resetTrades not implemented');
  }
}
