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

    // Initialize defaults in firestore if not exists
    if (walletBalance === undefined) {
      await setDoc(userRef, { walletBalance: 0 }, { merge: true });
      walletBalance = 0;
    }

    if (monthlyGoal === undefined) {
      await setDoc(userRef, { monthlyGoal: 1000 }, { merge: true });
      monthlyGoal = 1000;
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
