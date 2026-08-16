import { collection, getDocs, setDoc, deleteDoc, doc, updateDoc, increment, writeBatch } from 'firebase/firestore';
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

  /**
   * Deletes many entries and fixes the counter in as few round trips as
   * possible. Per-entry deletion cost two serial writes each, so clearing a
   * year of journaling fired ~730 individual writes.
   * Chunked at Firestore's 500-operation batch limit, leaving one slot for the
   * counter update.
   */
  async deleteEntries(userId, dates) {
    if (!dates.length) return;
    const CHUNK = 499;
    for (let index = 0; index < dates.length; index += CHUNK) {
      const slice = dates.slice(index, index + CHUNK);
      const batch = writeBatch(db);
      slice.forEach((date) => batch.delete(doc(db, 'users', userId, 'journals', date)));
      batch.update(doc(db, 'users', userId), { totalJournalsLogged: increment(-slice.length) });
      await batch.commit();
    }
  }
}
