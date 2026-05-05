import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from '../lib/tradeUtils';

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
          await updateDoc(userRef, { walletBalance: 0 }, { merge: true });
          setWalletBalance(0);
        }

        if (cloudMonthlyGoal !== undefined) {
          setMonthlyGoal(cloudMonthlyGoal);
        } else {
          // Initialize goal if missing
          await updateDoc(userRef, { monthlyGoal: 1000 }, { merge: true });
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
      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: newBalance
      });
    }
  };

  const resetWallet = async () => {
    setWalletBalance(0);
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: 0
      });
    }
  };

  const updateMonthlyGoal = async (newGoal) => {
    setMonthlyGoal(newGoal);
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        monthlyGoal: newGoal
      });
    }
  };

  return { walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, isLoading };
}
