import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

export function useTrades(user) {
  const [trades, setTrades]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [lastMT5Sync, setLastMT5Sync] = useState(null); // tracks last MT5 auto-sync time

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    const token = await currentUser.getIdToken();

    const BASE_URL = window.location.origin;
    try {
      const res = await fetch(`${BASE_URL}/api/save-trade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || 'Failed to log trade');
      }

      const data = await res.json().catch(() => ({ id: null }));
      return { id: data.id };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  };

  const removeTrade = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'trades', id));
  };

  const editTrade = async (id, updatedData) => {
    // We explicitly keep the id if it exists in updatedData to maintain record identity
    await updateDoc(doc(db, 'users', user.uid, 'trades', id), updatedData);
  };

  const resetTrades = async () => {
    const { writeBatch, getDocs } = await import('firebase/firestore');
    const batch    = writeBatch(db);
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'trades'));
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  return { trades, isLoading, addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync };
}

