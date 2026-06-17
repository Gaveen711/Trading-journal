import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { SubscriptionRepository } from '../../core/domain/repositories/SubscriptionRepository.js';

export class FirebaseSubscriptionRepository extends SubscriptionRepository {
  subscribeToUserDoc(userId, onUpdate, onError) {
    return onSnapshot(doc(db, 'users', userId), onUpdate, onError);
  }

  async recordProAcceptance(userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      proLegalAccepted: true,
      proLegalAcceptedAt: new Date().toISOString(),
      proLegalVersion: '1.0.4',
      refundPolicyAcknowledged: true
    });
  }

  async agreeToTerms(userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      agreedToTerms: true,
      agreedAt: new Date().toISOString() 
    });
  }
}
