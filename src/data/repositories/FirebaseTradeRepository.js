import { collection, onSnapshot, updateDoc, addDoc, doc, query, orderBy, increment, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { TradeRepository } from '../../core/domain/repositories/TradeRepository.js';

export class FirebaseTradeRepository extends TradeRepository {
  subscribeToTrades(userId, onUpdate, onError) {
    const q = query(
      collection(db, 'users', userId, 'trades'),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, 
      (snapshot) => {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        let triggerSync = false;

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.source === 'MT5_AUTO') {
              triggerSync = true;
            }
          }
        });

        onUpdate(loaded, triggerSync);
      },
      onError
    );
  }

  async addTrade(userId, tradeData) {
    const batch = writeBatch(db);
    const tradeRef = doc(collection(db, 'users', userId, 'trades'));
    
    batch.set(tradeRef, {
      ...tradeData,
      id: tradeRef.id
    });
    
    batch.update(doc(db, 'users', userId), {
      totalTradesLogged: increment(1),
      lastTradeTime: serverTimestamp()
    });
    
    await batch.commit();
    return tradeRef;
  }

  async removeTrade(userId, tradeId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', userId, 'trades', tradeId));
    batch.update(doc(db, 'users', userId), {
      totalTradesLogged: increment(-1)
    });
    await batch.commit();
  }

  async editTrade(userId, tradeId, updatedData) {
    const { id: _drop, ...safeData } = updatedData;
    await updateDoc(doc(db, 'users', userId, 'trades', tradeId), safeData);
  }

  async resetTrades(userId, idToken) {
    try {
      const resp = await fetch('/api/reset-trades', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Failed to reset trades via API');
      }
    } catch (apiError) {
      console.warn('API reset failed or unavailable. Falling back to direct client-side wipe:', apiError);
      
      const { getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'users', userId, 'trades'));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((documentSnapshot) => {
        batch.delete(doc(db, 'users', userId, 'trades', documentSnapshot.id));
      });
      
      batch.update(doc(db, 'users', userId), {
        totalTradesLogged: 0
      });
      
      await batch.commit();
    }
  }
}
