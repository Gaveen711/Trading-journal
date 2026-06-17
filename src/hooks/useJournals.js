import { useState, useEffect, useMemo } from 'react';
import { FirebaseJournalRepository } from '../data/repositories/FirebaseJournalRepository';

export function useJournals(user) {
  const [journals, setJournals] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const repository = useMemo(() => new FirebaseJournalRepository(), []);

  const loadJournals = async () => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const data = await repository.loadJournals(user.uid);
      setJournals(data);
    } catch { 
      setJournals({}); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveJournalEntry = async (date, text, mood) => {
    const newJournals = { ...journals };
    const isNew = !journals[date];
    const wasPresent = !!journals[date];

    if (text.trim()) {
      newJournals[date] = { text, mood };
    } else {
      delete newJournals[date];
    }

    await repository.saveJournalEntry(user.uid, date, text, mood, isNew, wasPresent);
    setJournals(newJournals);
    return newJournals;
  };

  const deleteEntry = async (date) => {
    const wasPresent = !!journals[date];
    const newJournals = { ...journals };
    delete newJournals[date];
    
    await repository.deleteEntry(user.uid, date, wasPresent);
    setJournals(newJournals);
  };

  return { journals, isLoading, saveJournalEntry, deleteEntry, refreshJournals: loadJournals };
}


