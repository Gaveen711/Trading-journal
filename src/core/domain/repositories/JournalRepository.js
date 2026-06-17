export class JournalRepository {
  loadJournals(_userId) {
    throw new Error('loadJournals not implemented');
  }

  saveJournalEntry(_userId, _date, _text, _mood, _isNew, _wasPresent) {
    throw new Error('saveJournalEntry not implemented');
  }

  deleteEntry(_userId, _date, _wasPresent) {
    throw new Error('deleteEntry not implemented');
  }
}
