import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { WalletRepository } from '../../core/domain/repositories/WalletRepository.js';

export class FirebaseWalletRepository extends WalletRepository {
  async getWalletData(userId) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    let walletBalance = undefined;
    let monthlyGoal = undefined;

    if (userSnap.exists()) {
      const data = userSnap.data();
      walletBalance = data.walletBalance;
      monthlyGoal = data.monthlyGoal;
    }

    // Backfill defaults in one write rather than two. This is a write on a read
    // path, so it only runs for a user doc that has never had these fields.
    const defaults = {};
    if (walletBalance === undefined) {
      defaults.walletBalance = 0;
      walletBalance = 0;
    }
    if (monthlyGoal === undefined) {
      defaults.monthlyGoal = 1000;
      monthlyGoal = 1000;
    }
    if (Object.keys(defaults).length > 0) {
      await setDoc(userRef, defaults, { merge: true });
    }

    return { walletBalance, monthlyGoal };
  }

  async updateBalance(userId, newBalance) {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { walletBalance: newBalance }, { merge: true });
  }

  async updateMonthlyGoal(userId, newGoal) {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { monthlyGoal: newGoal }, { merge: true });
  }
}
