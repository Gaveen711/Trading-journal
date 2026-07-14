import { useCallback, useEffect, useState } from 'react';
import { useAppServices } from '../app/di/AppServicesContext.jsx';

/** React adapter for journal workflows; storage details stay behind the repository. */
export function useJournals(user) {
  const [journals, setJournals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { journalRepository: repository } = useAppServices();

  const loadJournals = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setJournals(await repository.loadJournals(user.uid));
    } catch {
      setJournals({});
    } finally {
      setIsLoading(false);
    }
  }, [repository, user]);

  useEffect(() => { loadJournals(); }, [loadJournals]);

  const saveJournalEntry = async (date, text, mood) => {
    const nextJournals = { ...journals };
    const wasPresent = Boolean(journals[date]);
    if (text.trim()) nextJournals[date] = { text, mood };
    else delete nextJournals[date];
    await repository.saveJournalEntry(user.uid, date, text, mood, !wasPresent, wasPresent);
    setJournals(nextJournals);
    return nextJournals;
  };
  const deleteEntry = async (date) => {
    const wasPresent = Boolean(journals[date]);
    const nextJournals = { ...journals };
    delete nextJournals[date];
    await repository.deleteEntry(user.uid, date, wasPresent);
    setJournals(nextJournals);
  };

  return { journals, isLoading, saveJournalEntry, deleteEntry, refreshJournals: loadJournals };
}
