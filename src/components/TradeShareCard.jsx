import React from 'react';
import { formatCurrency, formatNumber } from '../lib/tradeUtils';
import { getTradeStrategyTags } from '../lib/tradeAnalytics.js';

export const TradeShareCard = React.forwardRef(({ trade }, ref) => {
  if (!trade) return null;

  const isWin = trade.pnl >= 0;
  const pnlFormatted = formatCurrency(trade.pnl, true);
  const pipsFormatted = `${formatNumber(trade.pips || 0, 1)} Pips`;
  const lotsFormatted = `${trade.lots} Lots`;
  
  const strategies = getTradeStrategyTags(trade);

  return (
    <div 
      ref={ref} 
      className="relative overflow-hidden w-[1200px] h-[675px] bg-[#050505] flex flex-col justify-center items-center text-white font-sans"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background glowing auroras */}
      <div className={`absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 ${isWin ? 'bg-cyan-500' : 'bg-orange-500'}`}></div>
      
      {/* Premium Glass Panel */}
      <div className="relative z-10 w-[1000px] rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl p-16 flex flex-col items-center">
        
        {/* Top Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="px-6 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-xl font-bold tracking-widest uppercase">
            {trade.market || 'XAU/USD'}
          </div>
          <div className={`px-6 py-2 rounded-full border text-xl font-bold tracking-widest uppercase ${isWin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {trade.direction}
          </div>
        </div>

        {/* Massive PNL */}
        <div className={`text-[140px] font-black tracking-tighter leading-none mb-12 ${isWin ? 'text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.3)]'}`}>
          {pnlFormatted}
        </div>

        {/* Granular Stats Pills */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <div className="px-8 py-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
            <span className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">Lot Size</span>
            <span className="text-3xl font-black">{lotsFormatted}</span>
          </div>
          <div className="px-8 py-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
            <span className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">Distance</span>
            <span className="text-3xl font-black">{pipsFormatted}</span>
          </div>
          {trade.rr && (
            <div className="px-8 py-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">R:R Ratio</span>
              <span className="text-3xl font-black">{trade.rr}</span>
            </div>
          )}
          {trade.session && (
            <div className="px-8 py-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">Session</span>
              <span className="text-3xl font-black">{trade.session}</span>
            </div>
          )}
        </div>

        {/* Strategies Row */}
        {strategies.length > 0 && (
          <div className="flex gap-3 mt-10">
            {strategies.map((s, i) => (
              <span key={i} className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-lg font-bold uppercase tracking-widest">
                {s}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Watermark Logo */}
      <div className="absolute bottom-10 right-12 flex items-center gap-3 opacity-60">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tight text-white/80">xaujournal<span className="text-emerald-500">.</span></span>
      </div>
      <div className="absolute bottom-10 left-12 text-white/30 text-lg font-bold tracking-widest uppercase flex items-center gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        Verified API
      </div>
    </div>
  );
});

TradeShareCard.displayName = 'TradeShareCard';
