import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function EASetup() {
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDoc(doc(db, 'users', uid));
      setApiKey(snap.data()?.apiKey || '');
    };
    load();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!apiKey) return null; // only show for Pro users

  return (
    <div className="space-y-6 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <h2 className="text-lg font-semibold text-white">
        MT5 Auto-Sync
      </h2>

      {/* API Key */}
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">Your API Key</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-zinc-800 text-amber-400 px-4 py-2 rounded-lg text-sm font-mono truncate">
            {apiKey}
          </code>
          <button
            onClick={copy}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          🔒 Never share this key. It gives write access to your journal.
        </p>
      </div>

      {/* Download EA */}
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">Download EA</p>
        <a
          href="/XAUJournalEA.mq5"
          download
          className="inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg"
        >
          ⬇ Download XAUJournalEA.mq5
        </a>
      </div>

      {/* Setup Steps */}
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">Setup Instructions</p>
        <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
          <li>Open MT5 → File → Open Data Folder</li>
          <li>Navigate to <code className="text-zinc-300">MQL5 / Experts</code></li>
          <li>Paste <code className="text-zinc-300">XAUJournalEA.mq5</code> there</li>
          <li>Restart MT5 → drag EA onto any chart</li>
          <li>Paste your API key into the EA inputs</li>
        </ol>
      </div>

      {/* Warning */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <p className="text-sm text-amber-400 font-medium">⚠️ Required MT5 Setting</p>
        <p className="text-xs text-zinc-400 mt-1">
          Go to <strong className="text-zinc-300">Tools → Options → Expert Advisors</strong> and add{' '}
          <code className="text-zinc-300">xaujournal.vercel.app</code> to the allowed WebRequest URLs.
        </p>
      </div>
    </div>
  );
}
