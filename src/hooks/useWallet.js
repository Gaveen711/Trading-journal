import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useWallet(user) {
  const [walletBalance, setWalletBalance] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(1000); // Default $1000 goal
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadWallet = async () => {
      try {
        setIsLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        let cloudWalletBalance = undefined;
        let cloudMonthlyGoal = undefined;

        if (userSnap.exists()) {
          const data = userSnap.data();
          cloudWalletBalance = data.walletBalance;
          cloudMonthlyGoal = data.monthlyGoal;
        }

        if (cloudWalletBalance !== undefined) {
          setWalletBalance(cloudWalletBalance);
        } else {
          await setDoc(userRef, { walletBalance: 0 }, { merge: true });
          setWalletBalance(0);
        }

        if (cloudMonthlyGoal !== undefined) {
          setMonthlyGoal(cloudMonthlyGoal);
        } else {
          await setDoc(userRef, { monthlyGoal: 1000 }, { merge: true });
          setMonthlyGoal(1000);
        }
      } catch (error) {
        console.error('Wallet Sync Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWallet();
  }, [user]);

  const updateBalance = async (newBalance) => {
    setWalletBalance(newBalance);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { walletBalance: newBalance }, { merge: true });
    }
  };

  const resetWallet = async () => {
    setWalletBalance(0);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { walletBalance: 0 }, { merge: true });
    }
  };

  const updateMonthlyGoal = async (newGoal) => {
    setMonthlyGoal(newGoal);
    if (user) {
      await setDoc(doc(db, "users", user.uid), { monthlyGoal: newGoal }, { merge: true });
    }
  };

  return { walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, isLoading };
}

