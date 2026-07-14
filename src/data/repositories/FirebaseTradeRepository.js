import {
  collection, doc, getDocs, increment, limit, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp, startAfter, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { TradeRepository } from '../../core/domain/repositories/TradeRepository.js';
import { subtractTradeAnalytics, tradeAnalyticsDelta } from '../../lib/tradeAnalytics.js';

const DEFAULT_PAGE_SIZE = 100;
const analyticsIncrements = (delta) => Object.fromEntries(
  Object.entries(delta).map(([key, value]) => ['analytics.' + key, increment(value)])
);

export class FirebaseTradeRepository extends TradeRepository {
  subscribeToTrades(userId, onUpdate, onError, pageSize = DEFAULT_PAGE_SIZE) {
    const tradesQuery = query(collection(db, 'users', userId, 'trades'), orderBy('date', 'desc'), limit(pageSize));
    return onSnapshot(tradesQuery, (snapshot) => {
      const loaded = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const triggerSync = snapshot.docChanges().some((change) => (
        change.type === 'added' && change.doc.data().source === 'MT5_AUTO'
      ));
      onUpdate(loaded, triggerSync, {
        cursor: snapshot.docs.at(-1) || null,
        hasMore: snapshot.size === pageSize,
      });
    }, onError);
  }

  async getTradesPage(userId, cursor, pageSize = DEFAULT_PAGE_SIZE) {
    const constraints = [orderBy('date', 'desc')];
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(pageSize));
    const snapshot = await getDocs(query(collection(db, 'users', userId, 'trades'), ...constraints));
    return {
      trades: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
      cursor: snapshot.docs.at(-1) || null,
      hasMore: snapshot.size === pageSize,
    };
  }

  async addTrade(userId, tradeData) {
    const batch = writeBatch(db);
    const tradeRef = doc(collection(db, 'users', userId, 'trades'));
    const delta = tradeAnalyticsDelta(tradeData);
    batch.set(tradeRef, { ...tradeData, id: tradeRef.id });
    batch.update(doc(db, 'users', userId), {
      totalTradesLogged: increment(delta.tradeCount),
      lastTradeTime: serverTimestamp(),
      ...analyticsIncrements(delta),
    });
    await batch.commit();
    return tradeRef;
  }

  async removeTrade(userId, tradeId) {
    await runTransaction(db, async (transaction) => {
      const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
      const snapshot = await transaction.get(tradeRef);
      if (!snapshot.exists()) return;
      const delta = tradeAnalyticsDelta(snapshot.data(), -1);
      transaction.delete(tradeRef);
      transaction.update(doc(db, 'users', userId), {
        totalTradesLogged: increment(delta.tradeCount),
        ...analyticsIncrements(delta),
      });
    });
  }

  async editTrade(userId, tradeId, updatedData) {
    const { id: _drop, ...safeData } = updatedData;
    await runTransaction(db, async (transaction) => {
      const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
      const snapshot = await transaction.get(tradeRef);
      if (!snapshot.exists()) throw new Error('Trade not found');
      const nextTrade = { ...snapshot.data(), ...safeData };
      transaction.update(tradeRef, safeData);
      const delta = subtractTradeAnalytics(snapshot.data(), nextTrade);
      transaction.update(doc(db, 'users', userId), {
        totalTradesLogged: increment(delta.tradeCount),
        ...analyticsIncrements(delta),
      });
    });
  }

  async resetTrades(userId, idToken) {
    const response = await fetch('/api/reset-trades', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + idToken },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to reset trades via API');
    }
  }
}