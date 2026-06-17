import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';

export function CurrencyConverterWidget() {
  const [rates, setRates] = useState({ USD: 1 });
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState('1000');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          // Merge some static metals that might be missing or out of date
          const fullRates = {
            ...data.rates,
            XAU: 1 / 4329.10, // Approximate 2026 value
            XAG: 1 / 29.37,
            XPT: 1 / 995.23,
            XPD: 1 / 1028.07,
          };
          setRates(fullRates);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load currency rates", err);
        setLoading(false);
      });
  }, []);

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const convertedAmount = useMemo(() => {
    if (!rates[fromCurr] || !rates[toCurr]) return '0.00';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return '0.00';
    
    const amountInUSD = parsedAmount / rates[fromCurr];
    const result = amountInUSD * rates[toCurr];
    
    const isMetal = ['XAU', 'XAG', 'XPT', 'XPD'].includes(toCurr);
    return result.toLocaleString(undefined, { 
      minimumFractionDigits: isMetal ? 4 : 2, 
      maximumFractionDigits: isMetal ? 4 : 2 
    });
  }, [amount, fromCurr, toCurr, rates]);

  const currencyOptions = Object.keys(rates).sort();

  return (
    <div className="p-4 rounded-2xl apple-glass-panel flex flex-col gap-3 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-1 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          Currency Converter
        </span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex bg-muted/30 border border-border/20 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent px-4 py-3 text-sm font-bold text-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value)}
            className="flex-1 bg-muted/30 border border-border/20 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <button 
            onClick={handleSwap}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ArrowLeftRight size={14} />
          </button>

          <select 
            value={toCurr}
            onChange={(e) => setToCurr(e.target.value)}
            className="flex-1 bg-muted/30 border border-border/20 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer text-right"
          >
            {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mt-2 pt-3 border-t border-border/10 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Result</span>
          <span className="text-sm font-black text-foreground tracking-tight truncate max-w-[200px]">
            {convertedAmount} {toCurr}
          </span>
        </div>
      </div>
    </div>
  );
}
