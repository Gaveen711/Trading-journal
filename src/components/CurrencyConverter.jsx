import { useState, useEffect, useRef, useMemo } from 'react';

// Rate tables are shared across mounts and survive remounts. Keyed by base
// currency; the API updates these roughly daily, so ten minutes is generous.
const RATES_TTL_MS = 10 * 60 * 1000;
const ratesCache = new Map();
import { ChevronDown } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { formatNumber } from '../lib/tradeUtils';
import { CURRENCIES } from '../data/currencies.js';

function CurrencySelect({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const selected = CURRENCIES.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2 relative w-full" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setSearch('');
        }}
        className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'bg-muted/50 border-primary/50 ring-2 ring-primary/10' : 'bg-muted/30 border-border/50 hover:border-primary/30'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-4 overflow-hidden rounded-sm bg-muted/20 flex-shrink-0">
            <img
              src={`/flags/${selected?.country?.toLowerCase()}.svg`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                if (selected?.code === 'EUR') e.target.src = '/flags/fr.svg';
                else e.target.src = 'https://placehold.co/40x30/1e1e2e/64748b?text=' + selected?.code;
              }}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">{selected?.code}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] p-1.5 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top flex flex-col gap-1.5 min-w-[180px]">
          <div className="px-1.5 pt-1.5 pb-0.5">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search currency..."
              className="w-full h-8 px-2.5 rounded-lg border border-border/40 bg-muted/20 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              autoFocus
            />
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-1 pl-0.5 pb-0.5">
            {filteredCurrencies.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${value === c.code ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50 text-foreground/70 hover:text-foreground'
                  }`}
                title={c.name}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 overflow-hidden rounded-sm bg-muted/10 flex-shrink-0">
                    <img
                      src={`/flags/${c.country?.toLowerCase()}.svg`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (c.code === 'EUR') e.target.src = '/flags/fr.svg';
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">{c.code}</span>
                </div>
                <span className="text-[9px] opacity-60 font-semibold truncate max-w-[100px] text-right">{c.name}</span>
              </button>
            ))}
            {filteredCurrencies.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground font-semibold">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CurrencyConverter() {
  const toast = useToast();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [loading, setLoading] = useState(false);

  // The endpoint returns a whole rate table for `from`, so the response depends
  // on `from` alone. Keying the fetch on `amount` meant one request to a
  // third-party API per keystroke, with no abort and no ordering guarantee —
  // a slow early response could overwrite a newer one.
  const [rates, setRates] = useState(null);
  const [rateError, setRateError] = useState(false);

  useEffect(() => {
    const cached = ratesCache.get(from);
    if (cached && Date.now() - cached.at < RATES_TTL_MS) {
      setRates(cached.rates);
      setRateError(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setRateError(false);

    (async () => {
      try {
        // Primary: user's private API key. Fallback: public API.
        const apiKey = import.meta.env.VITE_CURRENCY_API_KEY;
        let res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`, { signal: controller.signal });
        let data;
        if (res.ok) data = await res.json();

        if (!res.ok || data?.result !== 'success') {
          console.warn('Private API failed or limit reached, trying fallback...');
          res = await fetch(`https://open.er-api.com/v6/latest/${from}`, { signal: controller.signal });
          data = await res.json();
        }

        const table = data?.conversion_rates || data?.rates;
        if (!table) throw new Error('Invalid rate data received');

        ratesCache.set(from, { rates: table, at: Date.now() });
        if (active) setRates(table);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Currency Conversion Error:', error);
        if (active) {
          setRates(null);
          setRateError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [from]);

  // Pure arithmetic — typing an amount costs no network at all.
  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return null;
    if (from === to) return val;
    if (rateError) return val;              // degraded 1:1, matches previous fallback
    const rate = rates?.[to];
    return rate ? val * rate : null;
  }, [amount, from, to, rates, rateError]);

  const notifiedErrorFor = useRef(null);
  useEffect(() => {
    if (rateError && notifiedErrorFor.current !== from) {
      notifiedErrorFor.current = from;
      toast('Connection error. Using estimated rates.', 'error');
    }
    if (!rateError) notifiedErrorFor.current = null;
  }, [rateError, from, toast]);

  const handleConvert = (e) => {
    e.preventDefault();
  };

  return (
    <div className="card-premium rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
      <div className="text-center space-y-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Currency Converter</h3>
        <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
      </div>

      <form onSubmit={handleConvert} className="space-y-4">
        <div className="space-y-1.5 flex flex-col items-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter Amount</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                setAmount(val.replace(',', '.'));
              }
            }}
            className="input-premium h-10 text-sm font-bold text-center max-w-[220px]"
            placeholder="100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <CurrencySelect label="From" value={from} onChange={setFrom} />
          <CurrencySelect label="To" value={to} onChange={setTo} />
        </div>

        {result !== null && (
          <div className="py-1 text-center animate-in fade-in duration-500">
            <div className="text-sm font-bold text-foreground/80 tracking-tight">
              {loading ? (
                <span>Calculating...</span>
              ) : (
                <span>{formatNumber(parseFloat(amount) || 0, 0)} {from} = {result.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {to}</span>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 flex items-center justify-center rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 mt-2 shadow-sm"
        >
          <span>{loading ? 'Converting...' : 'Convert'}</span>
        </button>
      </form>
    </div>
  );
}
