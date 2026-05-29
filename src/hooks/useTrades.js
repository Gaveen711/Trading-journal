import { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, addDoc, doc, query, orderBy, serverTimestamp, increment, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export function useTrades(user) {
  const [trades, setTrades]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [lastMT5Sync, setLastMT5Sync] = useState(null); // tracks last MT5 auto-sync time

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setIsLoading(false);
      });
      return;
    }

    Promise.resolve().then(() => {
      setIsLoading(true);
    });
    const q = query(
      collection(db, 'users', user.uid, 'trades'),
      orderBy('date', 'desc')
    );

    // Real-time listener — fires instantly when MT5 syncs a new trade to Firestore
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Detect any newly added MT5 trades and update the last sync time
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.source === 'MT5_AUTO') {
              setLastMT5Sync(new Date());
            }
          }
        });

        setTrades(loaded);
        setIsLoading(false);
      },
      (error) => {
        console.error('Real-time trade listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [user]);

  const addTrade = async (tradeData) => {
    const collRef = collection(db, 'users', user.uid, 'trades');
    const docRef  = await addDoc(collRef, tradeData);
    // Persist the ID inside the document to prevent orphaned record risk
    await updateDoc(docRef, { id: docRef.id });
    
    await updateDoc(doc(db, 'users', user.uid), {
      totalTradesLogged: increment(1)
    });
    return docRef;
  };

  const removeTrade = async (id) => {
    if (!user?.uid) throw new Error('Not authenticated');
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', user.uid, 'trades', id));
    batch.update(doc(db, 'users', user.uid), {
      totalTradesLogged: increment(-1)
    });
    await batch.commit();
  };

  const editTrade = async (id, updatedData) => {
    const { id: _drop, ...safeData } = updatedData;
    await updateDoc(doc(db, 'users', user.uid, 'trades', id), safeData);
  };

  const resetTrades = async () => {
    if (!user?.uid) throw new Error('Not authenticated');
    try {
      const token = await user.getIdToken();
      const resp = await fetch('/api/reset-trades', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Failed to reset trades via API');
      }
    } catch (apiError) {
      console.warn('API reset failed or unavailable. Falling back to direct client-side wipe:', apiError);
      
      // Direct Firestore client-side deletion fallback
      const { getDocs, query, collection, writeBatch, doc } = await import('firebase/firestore');
      const q = query(collection(db, 'users', user.uid, 'trades'));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((documentSnapshot) => {
        batch.delete(doc(db, 'users', user.uid, 'trades', documentSnapshot.id));
      });
      
      batch.update(doc(db, 'users', user.uid), {
        totalTradesLogged: 0
      });
      
      await batch.commit();
    }
  };

  return { trades, isLoading, addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync };
}

