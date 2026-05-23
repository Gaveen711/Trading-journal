import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getFriendlyErrorMessage } from '../lib/errorUtils';
import { connectBrokerCallable, syncBrokerTradesCallable } from '../lib/brokerSync';
import { CloudDownload, LockFill, Lightning } from 'react-bootstrap-icons';

const BROKERS = [
  { label: 'IC Markets (MT5)', server: 'ICMarketsSC-Demo', platform: 'mt5' },
  { label: 'IC Markets (MT4)', server: 'ICMarkets-Demo02', platform: 'mt4' },
  { label: 'Exness (MT5)', server: 'Exness-Trial', platform: 'mt5' },
  { label: 'FTMO (MT5)', server: 'FTMO-Server', platform: 'mt5' },
  { label: 'The Funded Trader (MT5)', server: 'TheFundedTrader-Live', platform: 'mt5' },
];

export default function BrokerConnect() {
  const { plan = 'free', expiry = null, setShowPricingModal: onUpgrade } = useOutletContext();
  const [broker, setBroker] = useState('');
  const [customServer, setCustomServer] = useState('');
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [platform, setPlatform] = useState('mt5');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const nowMs = Date.now();
  const isSyncAllowed =
    (plan === 'pro' && expiry && new Date(expiry).getTime() > nowMs) || plan === 'grace';

  const selectedPreset = BROKERS.find((b) => b.server === broker);
  const selectedServer = broker === 'custom' ? customServer.trim() : broker;
  const resolvedPlatform = broker === 'custom' ? platform : (selectedPreset?.platform || platform);

  async function handleConnect() {
    if (!selectedServer || !accountId || !password) {
      setStatus({ type: 'error', message: 'Please fill in server, account ID, and password.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await connectBrokerCallable({
        server: selectedServer,
        accountId,
        password,
        platform: resolvedPlatform,
      });
      setStatus({ type: 'success', message: result.message });
      setPassword('');
    } catch (err) {
      setStatus({ type: 'error', message: getFriendlyErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  if (!isSyncAllowed) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-8 flex flex-col items-center text-center gap-4">
        <LockFill className="w-8 h-8 text-foreground/30" />
        <p className="text-[11px] text-muted-foreground max-w-xs">Broker connect requires Pro.</p>
        {onUpgrade && (
          <button type="button" onClick={onUpgrade} className="btn-primary text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2">
            <Lightning className="w-3.5 h-3.5" />
            Upgrade to Pro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 space-y-5">
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight text-gradient">Connect your broker</h2>
        <p className="text-[11px] text-muted-foreground mt-1 font-medium">
          MT4/MT5 login via MetaApi — no EA required. Credentials stay on the server.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          disabled={broker !== 'custom' && !!selectedPreset}
          className="input-premium h-11 w-full text-sm font-bold"
        >
          <option value="mt5">MetaTrader 5</option>
          <option value="mt4">MetaTrader 4</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broker / server</label>
        <select
          value={broker}
          onChange={(e) => {
            setBroker(e.target.value);
            const p = BROKERS.find((b) => b.server === e.target.value);
            if (p) setPlatform(p.platform);
          }}
          className="input-premium h-11 w-full text-sm font-bold"
        >
          <option value="">Select broker…</option>
          {BROKERS.map((b) => (
            <option key={b.server} value={b.server}>{b.label}</option>
          ))}
          <option value="custom">Other (enter server manually)</option>
        </select>
      </div>

      {broker === 'custom' && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server name</label>
          <input
            type="text"
            placeholder="e.g. MyBroker-Live01"
            value={customServer}
            onChange={(e) => setCustomServer(e.target.value)}
            className="input-premium h-11 w-full text-sm font-bold"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account ID (login)</label>
        <input
          type="text"
          placeholder="e.g. 12345678"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="input-premium h-11 w-full text-sm font-bold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
        <input
          type="password"
          placeholder="MT4/MT5 password (investor password works)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-premium h-11 w-full text-sm font-bold"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleConnect}
          disabled={loading || syncing}
          className="btn-primary flex-1 h-12 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CloudDownload className="w-4 h-4" />
          {loading ? 'Connecting…' : 'Connect & sync'}
        </button>
        <button
          type="button"
          disabled={loading || syncing}
          onClick={async () => {
            setSyncing(true);
            setStatus(null);
            try {
              const result = await syncBrokerTradesCallable();
              setStatus({ type: 'success', message: result.message });
            } catch (err) {
              setStatus({ type: 'error', message: getFriendlyErrorMessage(err) });
            } finally {
              setSyncing(false);
            }
          }}
          className="flex-1 h-12 rounded-xl border border-border/60 text-[11px] font-black uppercase tracking-widest hover:bg-muted/40 disabled:opacity-50"
        >
          {syncing ? 'Syncing…' : 'Sync again'}
        </button>
      </div>

      {status && (
        <p className={`text-[11px] font-medium leading-relaxed ${status.type === 'error' ? 'text-destructive' : 'text-green-500'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
