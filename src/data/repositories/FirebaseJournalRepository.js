import { collection, getDocs, setDoc, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { JournalRepository } from '../../core/domain/repositories/JournalRepository.js';

export class FirebaseJournalRepository extends JournalRepository {
  async loadJournals(userId) {
    const snapshot = await getDocs(collection(db, 'users', userId, 'journals'));
    const journals = {};
    snapshot.docs.forEach(d => {
      journals[d.id] = d.data();
    });
    return journals;
  }

  async saveJournalEntry(userId, date, text, mood, isNew, wasPresent) {
    if (text.trim()) {
      await setDoc(doc(db, 'users', userId, 'journals', date), { text, mood });
      if (isNew) {
        await updateDoc(doc(db, 'users', userId), { totalJournalsLogged: increment(1) });
      }
    } else {
      await deleteDoc(doc(db, 'users', userId, 'journals', date));
      if (wasPresent) {
        await updateDoc(doc(db, 'users', userId), { totalJournalsLogged: increment(-1) });
      }
    }
  }

  async deleteEntry(userId, date, wasPresent) {
    await deleteDoc(doc(db, 'users', userId, 'journals', date));
    if (wasPresent) {
      await updateDoc(doc(db, 'users', userId), { totalJournalsLogged: increment(-1) });
    }
  }
}
