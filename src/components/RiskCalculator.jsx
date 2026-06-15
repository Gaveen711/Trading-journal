import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calculator, ShieldCheck } from 'react-bootstrap-icons';

export function RiskCalculator() {
  const { walletBalance, trades } = useOutletContext();
  const currentWalletBalance = (walletBalance || 0) + trades.reduce((s, t) => s + (t.pnl || 0), 0);

  const [balance, setBalance] = useState(currentWalletBalance.toString());
  const [riskPercent, setRiskPercent] = useState('1.0');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');

  const handleNumericChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setter(val.replace(',', '.'));
    }
  };

  // Derive riskAmount
  const bal = parseFloat(balance) || 0;
  const pct = parseFloat(riskPercent) || 0;
  const riskAmount = bal > 0 && pct > 0 ? (bal * (pct / 100)).toFixed(2) : '';

  // Derive lotSize and pipsRisk
  const rAmt = parseFloat(riskAmount) || 0;
  const ent = parseFloat(entry) || 0;
  const stop = parseFloat(sl) || 0;

  let lotSize = '0.00';
  let pipsRisk = '0';

  if (rAmt > 0 && ent > 0 && stop > 0 && ent !== stop) {
    const diff = Math.abs(ent - stop);
    // XAUUSD: 1 standard lot = 100 units. $ risk = diff * lots * 100
    let lots = rAmt / (diff * 100);
    lots = Math.max(0.01, lots); // Minimum lot size
    lotSize = lots.toFixed(2);
    
    pipsRisk = (diff / 0.01).toFixed(0);
  }

  return (
    <div className="card-premium p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Pre-Trade Risk Calculator</h3>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Determine exact lot size for XAUUSD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Balance ($)</label>
            <input type="text" inputMode="decimal" value={balance} onChange={handleNumericChange(setBalance)} className="input-premium h-12 text-sm font-bold" placeholder="10000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Risk %</label>
              <div className="relative">
                <input type="text" inputMode="decimal" value={riskPercent} onChange={handleNumericChange(setRiskPercent)} className="input-premium h-12 text-sm font-bold pl-3 pr-8" placeholder="1.0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-black">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Risk Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-black">$</span>
                <input type="text" inputMode="decimal" value={riskAmount} readOnly className="input-premium h-12 text-sm font-bold pl-7 bg-muted/30 text-foreground/80 cursor-not-allowed border-dashed" placeholder="100" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Entry Price</label>
              <input type="text" inputMode="decimal" value={entry} onChange={handleNumericChange(setEntry)} className="input-premium h-12 text-sm font-bold" placeholder="2000.00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stop Loss</label>
              <input type="text" inputMode="decimal" value={sl} onChange={handleNumericChange(setSl)} className="input-premium h-12 text-sm font-bold border-red-500/30 focus:border-red-500/50" placeholder="1995.00" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-500" />
            
            <div className="relative z-10 flex flex-col items-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-primary mb-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recommended Lot Size</span>
              <div className="text-6xl font-black tracking-tighter text-foreground py-2">
                {lotSize}
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-background/50 px-4 py-2 rounded-xl border border-border/50">
                <span>Stop Distance:</span>
                <span className="text-foreground">{pipsRisk} pips</span>
              </div>
              
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-6 max-w-[200px] leading-relaxed">
                Based on standard Gold contract size (100 oz). Always verify with your broker.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
