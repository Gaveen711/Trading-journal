import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, ChevronDown, ArrowRight, ArrowUpRight, ArrowDownRight, Gem, Wallet, Book, RefreshCw } from 'lucide-react';
import { auth } from '../../firebase';
import { formatCurrency, formatNumber } from '../../lib/tradeUtils';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', country: 'US' },
  { code: 'EUR', name: 'Euro', country: 'EU' },
  { code: 'GBP', name: 'British Pound', country: 'GB' },
  { code: 'JPY', name: 'Japanese Yen', country: 'JP' },
  { code: 'AUD', name: 'Australian Dollar', country: 'AU' },
  { code: 'CAD', name: 'Canadian Dollar', country: 'CA' },
  { code: 'CHF', name: 'Swiss Franc', country: 'CH' }
];

function CurrencySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = CURRENCIES.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/80 hover:bg-muted border border-border/40 transition-all text-[11px] font-bold"
      >
        <span>{selected?.code}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 p-1 rounded-xl border border-border/50 bg-background shadow-xl min-w-[80px]">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onChange(c.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-1 text-[10px] font-bold rounded-lg hover:bg-muted block ${
                value === c.code ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardRightSidebar({
  plan,
  trades = [],
  journals = [],
  walletBalance = 0,
  setShowPricingModal,
  _toast
}) {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchRate = useCallback(async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    if (from === to) {
      setResult(val);
      return;
    }
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CURRENCY_API_KEY;
      let res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`);
      let data;
      if (res.ok) {
        data = await res.json();
      }
      if (!res.ok || data?.result !== 'success') {
        res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        data = await res.json();
      }
      const rates = data.conversion_rates || data.rates;
      const currentRate = rates[to];
      if (currentRate) {
        setResult(val * currentRate);
      }
    } catch (error) {
      console.error('Right Sidebar Conversion Error:', error);
      setResult(val * 1.0);
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // Calculate stats
  const totalBalance = walletBalance + trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winTrades = trades.filter(t => t.outcome === 'WIN');
  const winRate = trades.length ? ((winTrades.length / trades.length) * 100).toFixed(0) : 0;
  const totalTradesCount = trades.length;
  const totalJournalsCount = Object.keys(journals).length;

  const userEmail = auth.currentUser?.email || 'Trader';
  const userNick = userEmail.split('@')[0];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER SECTION */}
      <div className="hidden lg:flex items-center justify-between bg-card p-3 rounded-2xl border border-border/30 shadow-flat">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-xs font-bold text-foreground capitalize">{userNick}</p>
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">@{userNick}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase">
            {userNick.slice(0, 2)}
          </div>
        </div>
      </div>

      {/* TOTAL BALANCE CARD */}
      <div className="bg-card p-6 rounded-3xl border border-border/30 shadow-flat relative overflow-hidden flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total balance</span>
          <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            winRate >= 50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {winRate >= 50 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {winRate}% WR
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          {formatCurrency(totalBalance)}
        </h2>
        <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, winRate))}%` }}
          />
        </div>
      </div>

      {/* MY ITEMS TRACKER */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">My items</p>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Logged Trades */}
          <div className="bg-card p-4 rounded-2xl border border-border/30 shadow-flat flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pastel-blue flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Trades</p>
              <p className="text-sm font-black text-foreground">{totalTradesCount}</p>
            </div>
          </div>

          {/* Card 2: Journal Entries */}
          <div className="bg-card p-4 rounded-2xl border border-border/30 shadow-flat flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pastel-pink flex items-center justify-center shrink-0">
              <Book className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Journals</p>
              <p className="text-sm font-black text-foreground">{totalJournalsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RESTYLED CONVERT WIDGET */}
      <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-flat flex flex-col gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Convert</p>
        
        <div className="flex flex-col gap-2">
          {/* Input field */}
          <div className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 border border-border/20 rounded-xl px-3 py-2.5 transition-colors">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-foreground focus:outline-none focus:ring-0 p-0 w-24"
              placeholder="0.00"
            />
            <CurrencySelect value={from} onChange={setFrom} />
          </div>

          {/* Output field */}
          <div className="flex items-center justify-between bg-muted/30 border border-border/20 rounded-xl px-3 py-2.5">
            <span className="text-xs font-bold text-foreground/70">
              {loading ? '...' : result !== null ? formatNumber(result, 2) : '0.00'}
            </span>
            <CurrencySelect value={to} onChange={setTo} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-black uppercase tracking-wider px-1">
          <span>Rate: 1 {from} ≈ {result !== null && amount > 0 ? (result / parseFloat(amount)).toFixed(4) : '0.0000'} {to}</span>
          <button 
            type="button" 
            onClick={fetchRate}
            className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Refresh
          </button>
        </div>

        <button
          type="button"
          onClick={fetchRate}
          disabled={loading}
          className="w-full h-11 btn-apple-primary"
        >
          <span>Convert</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* UPGRADE PLAN CARD */}
      <div className="bg-[#121214] text-white p-5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col gap-4 group">
        {/* Decorative Grid Glow background */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-primary">
              <Gem className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Upgrade Plan</span>
          </div>
          <h3 className="text-base font-black tracking-tight mt-1 leading-snug text-white">
            {plan === 'pro' ? 'Pro Trading Console Active' : 'Unlock Pro sync with MetaAPI'}
          </h3>
          <p className="text-[10px] text-white/50 leading-relaxed font-bold">
            {plan === 'pro' ? 'Enjoy unlimited sync logs, automated MT5 metrics, and priority analytics.' : 'Ver 1.0.4 · Connect MT5/MT4, enjoy unlimited logs, and premium reports.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPricingModal?.(true)}
          className="w-full h-10 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 z-10"
        >
          <span>Let's Go</span>
          <ArrowRight className="w-3 h-3 text-black" />
        </button>
      </div>
    </div>
  );
}
