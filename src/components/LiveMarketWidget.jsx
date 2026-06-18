import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'react-bootstrap-icons';
import { useAppTheme } from '../hooks/useAppTheme';

const TIMEFRAMES = [
  { id: '1', label: '1m' },
  { id: '5', label: '5m' },
  { id: '15', label: '15m' },
  { id: '30', label: '30m' },
  { id: '60', label: '1h' },
  { id: '240', label: '4h' },
  { id: 'D', label: '1D' },
  { id: 'W', label: '1W' }
];

export function LiveMarketWidget() {
  const { isLightMode } = useAppTheme();
  const [interval, setIntervalState] = useState('60'); // default '1h'
  const [activeAsset, setActiveAsset] = useState('xauusd');

  // Real-time Simulated Tickers state
  const [tickers, setTickers] = useState({
    xauusd: { id: 'xauusd', name: 'XAU/USD', desc: 'Gold Spot / US Dollar (OANDA)', tvSymbol: 'OANDA:XAUUSD', symbol: 'Au', color: 'amber-500', price: 4329.105, change: -0.13, history: [4335, 4332, 4328, 4330, 4334, 4327, 4331, 4328, 4329.105] },
    xagusd: { id: 'xagusd', name: 'XAG/USD', desc: 'Silver Spot / US Dollar (OANDA)', tvSymbol: 'OANDA:XAGUSD', symbol: 'Ag', color: 'slate-300', price: 29.372, change: +0.26, history: [29.20, 29.25, 29.30, 29.28, 29.35, 29.32, 29.38, 29.35, 29.372] },
    xptusd: { id: 'xptusd', name: 'XPT/USD', desc: 'Platinum Spot / US Dollar (OANDA)', tvSymbol: 'OANDA:XPTUSD', symbol: 'Pt', color: 'slate-400', price: 995.238, change: +0.02, history: [994, 995, 993, 996, 995, 994, 997, 995, 995.238] },
    xpdusd: { id: 'xpdusd', name: 'XPD/USD', desc: 'Palladium Spot / US Dollar (OANDA)', tvSymbol: 'OANDA:XPDUSD', symbol: 'Pd', color: 'slate-500', price: 1028.070, change: -0.03, history: [1029, 1028, 1030, 1027, 1028, 1029, 1026, 1027, 1028.070] }
  });

  // Ticks updater loop
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTickers(prev => {
        const next = { ...prev };

        Object.keys(next).forEach(key => {
          const t = next[key];
          // Random Walk simulation (realistic tight spread ticks)
          const tickPercent = (Math.random() - 0.5) * 0.00015; // very small fluctuation
          const oldPrice = t.price;
          const newPrice = Number((oldPrice * (1 + tickPercent)).toFixed(3));

          // Calculate net change relative to a baseline initial price
          const basePrice = t.history[0];
          const newChange = Number((((newPrice - basePrice) / basePrice) * 100).toFixed(2));

          // Append to history (keep max 10 points)
          const newHistory = [...t.history];
          newHistory.push(newPrice);
          if (newHistory.length > 12) {
            newHistory.shift();
          }

          next[key] = {
            ...t,
            price: newPrice,
            change: newChange,
            history: newHistory
          };
        });

        return next;
      });
    }, 1000);

  }, []);

  // Fetch actual prices on mount to sync simulated prices with TradingView charts
  useEffect(() => {
    const fetchRealPrices = async () => {
      const assets = [
        { id: 'xauusd', symbol: 'XAU' },
        { id: 'xagusd', symbol: 'XAG' },
        { id: 'xptusd', symbol: 'XPT' },
        { id: 'xpdusd', symbol: 'XPD' }
      ];
      try {
        const results = await Promise.all(
          assets.map(async (asset) => {
            const res = await fetch(`https://api.gold-api.com/price/${asset.symbol}`);
            if (res.ok) {
              const data = await res.json();
              return { id: asset.id, price: Number(data.price) };
            }
            return null;
          })
        );

        setTickers(prev => {
          const next = { ...prev };
          results.forEach(res => {
            if (res && res.price) {
              const basePrice = res.price;
              const currentHistory = [...next[res.id].history];
              const historyMultiplier = basePrice / next[res.id].price;
              const newHistory = currentHistory.map(h => Number((h * historyMultiplier).toFixed(3)));
              
              next[res.id] = {
                ...next[res.id],
                price: basePrice,
                history: newHistory
              };
            }
          });
          return next;
        });
      } catch (err) {
        console.error('Error fetching real-time prices from gold-api.com:', err);
      }
    };

    fetchRealPrices();
  }, []);

  // Helper to generate SVG sparkline path
  const getSparklinePath = (history, width = 120, height = 36) => {
    if (!history || history.length < 2) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return { x, y };
    });

    // Generate cubic bezier curve for smooth sparklines
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const getClosedSparklinePath = (history, pathData, width = 120, height = 36) => {
    if (!pathData) return '';
    return `${pathData} L ${width} ${height} L 0 ${height} Z`;
  };

  const tvTheme = isLightMode ? 'light' : 'dark';
  const activeData = tickers[activeAsset];
  const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(activeData.tvSymbol)}&interval=${interval}&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=${tvTheme}&timezone=exchange&showpopupbutton=1&studylabelbg=rgba(255%2C%20255%2C%20255%2C%201)&page-uri=https%3A%2F%2Fwww.tradingview.com%2Fwidgetembed%2F`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* MAIN LIVE CHART CARD */}
      <div className="apple-glass-panel rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group min-h-[600px]">

        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-${activeData.color}/10 border border-${activeData.color}/20 flex items-center justify-center font-bold text-${activeData.color} text-sm`}>
              {activeData.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-foreground m-0">{activeData.name}</h2>
                <span className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full ${activeData.change >= 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {activeData.change >= 0 ? '+' : ''}{activeData.change}%
                </span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider m-0 mt-0.5">{activeData.desc}</p>
            </div>
          </div>

          {/* Price & Timeframes */}
          <div className="flex flex-col sm:items-end gap-1.5 self-stretch sm:self-auto">
            <div className="flex items-baseline gap-2 justify-between sm:justify-start">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {activeAsset !== 'us10y' ? '$' : ''}{activeData.price.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real-time
              </span>
            </div>

            {/* Timeframe selector */}
            <div className="flex bg-muted/40 p-0.5 rounded-xl border border-border/40 self-end sm:self-auto shrink-0 overflow-x-auto">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setIntervalState(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider hover:scale-[1.06] active:scale-[0.94] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${interval === t.id
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Embedded Live Chart */}
        <div className="flex-1 w-full min-h-[460px] rounded-2xl overflow-hidden border border-border/30 bg-card/10 relative z-10 [transform:translateZ(0)] [mask-image:-webkit-radial-gradient(white,black)]">
          <iframe
            key={activeAsset}
            src={iframeSrc}
            title="XAUUSD Live Market Candlestick Chart"
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
          />
        </div>
      </div>

      {/* Tickers Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'xauusd', name: 'XAU/USD', desc: 'Gold/USD', prefix: '$', suffix: '' },
          { id: 'xagusd', name: 'XAG/USD', desc: 'Silver/USD', prefix: '$', suffix: '' },
          { id: 'xptusd', name: 'XPT/USD', desc: 'Platinum/USD', prefix: '$', suffix: '' },
          { id: 'xpdusd', name: 'XPD/USD', desc: 'Palladium/USD', prefix: '$', suffix: '' }
        ].map((t) => {
          const ticker = tickers[t.id];
          if (!ticker) return null;
          const isUp = ticker.change >= 0;
          const strokeColor = isUp ? 'hsl(142, 70%, 45%)' : 'hsl(0, 84%, 60%)';
          const path = getSparklinePath(ticker.history, 140, 36);
          const closedPath = getClosedSparklinePath(ticker.history, path, 140, 36);

          return (
            <div 
              key={t.id} 
              onClick={() => setActiveAsset(t.id)}
              className={`apple-glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 group hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden cursor-pointer ${activeAsset === t.id ? 'ring-2 ring-primary/50 bg-primary/5 shadow-lg shadow-primary/5' : 'hover:shadow-lg hover:shadow-foreground/5'}`}
            >
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground m-0">{t.name}</p>
                <h4 className="text-base font-black text-foreground tracking-tight m-0">
                  {t.prefix}{ticker.price.toLocaleString(undefined, { minimumFractionDigits: 3 })}{t.suffix}
                </h4>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-full ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {isUp ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                    {isUp ? '+' : ''}{ticker.change}%
                  </span>
                  <span className="text-[8px] font-medium text-muted-foreground/60 uppercase tracking-widest leading-none mt-0.5">{t.desc}</span>
                </div>
              </div>

              {/* Sparkline Canvas SVG */}
              <div className="w-[140px] h-[36px] relative z-10 shrink-0 self-end">
                <svg width="100%" height="100%" viewBox="0 0 140 36" className="overflow-visible">
                  <defs>
                    <linearGradient id={`grad-${t.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Closed area gradient */}
                  {closedPath && (
                    <path d={closedPath} fill={`url(#grad-${t.id})`} stroke="none" />
                  )}

                  {/* Top stroke line */}
                  {path && (
                    <path
                      d={path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                  )}
                </svg>
              </div>

              {/* Background Accent Lines */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/2 rounded-full blur-2xl pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
