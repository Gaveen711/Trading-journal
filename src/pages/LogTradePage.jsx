import { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { calcPnl, todayStr, formatCurrency } from '../lib/tradeUtils';
import { useToast } from '../components/ToastContext';
import { ArrowUpRight, ArrowDownRight, BarChartLine, ExclamationTriangleFill, LockFill, CloudArrowUp, Trash } from 'react-bootstrap-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { auth, storage } from '../firebase';
import { DatePicker } from '../components/ui/DatePicker';
import { CustomSelect } from '../components/ui/CustomSelect';
import { CurrencyExchange } from 'react-bootstrap-icons';
import { CurrencyConverter } from '../components/CurrencyConverter';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function LogTradePage() {
  const {
    trades, addTrade, setShowPricingModal, walletBalance, updateBalance,
    plan, resetTrades, monthlyGoal, updateMonthlyGoal,
    journals, saveJournalEntry
  } = useOutletContext();
  const { isLightMode } = useAppTheme();
  const toast = useToast();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabParam || 'chart'); // 'chart' | 'log' | 'logs'
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    setActiveTab(tabParam || 'chart');
  }, [tabParam]);



  const TRADE_LIMIT = 50;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const thisMonthTradesCount = trades.filter(t => t.date >= monthStart).length;
  const isLimitReached = plan === 'free' && thisMonthTradesCount >= TRADE_LIMIT;

  const [direction, setDirection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [equityPeriod, setEquityPeriod] = useState('all');

  const [date, setDate] = useState(todayStr());
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [lots, setLots] = useState('0.10');
  const [swap, setSwap] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [note, setNote] = useState('');
  const [leverage, setLeverage] = useState('');
  const [session, setSession] = useState('');
  const [setup, setSetup] = useState('');

  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (plan !== 'pro') {
      setShowPricingModal(true);
      toast('Upgrade to Pro to attach analysis screenshots.', 'warn');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls = [];
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast('Please sign in to upload images.', 'error');
      setUploading(false);
      return;
    }

    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

    try {
      let completedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
        const storageRef = ref(storage, `users/${userId}/trades/${uniqueName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const totalProgress = ((completedCount + fileProgress / 100) / files.length) * 100;
              setUploadProgress(Math.round(totalProgress));
            },
            (err) => {
              console.error('File upload task error:', err);
              reject(err);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(url);
              completedCount++;
              resolve();
            }
          );
        });
      }

      setScreenshots(prev => [...prev, ...uploadedUrls]);
      toast('Images uploaded successfully.', 'success');
    } catch (err) {
      console.error('Upload error:', err);
      toast('Failed to upload some images. Please try again.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeScreenshot = (indexToRemove) => {
    setScreenshots(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleNumericChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setter(val.replace(',', '.'));
    }
  };

  const pnlData = calcPnl(
    parseFloat(entry) || 0, parseFloat(exit) || 0,
    parseFloat(lots) || 0, 0,
    parseFloat(sl) || 0, parseFloat(tp) || 0,
    direction, parseFloat(swap) || 0
  );

  const saveTradeForm = async (e) => {
    e.preventDefault();

    if (isLimitReached) {
      setShowPricingModal(true);
      toast(`Monthly limit reached (${TRADE_LIMIT} trades). Access will reset next month, or upgrade now for unlimited logs.`, 'warn');
      return;
    }

    setSaving(true);
    const formData = new FormData(e.target);
    const date = formData.get('date');
    const entryVal = parseFloat(formData.get('entry'));
    const exitVal = parseFloat(formData.get('exit'));
    const lotsVal = parseFloat(formData.get('lots')) || 0;
    const swapVal = parseFloat(formData.get('swap')) || 0;
    const slVal = parseFloat(formData.get('sl')) || null;
    const tpVal = parseFloat(formData.get('tp')) || null;
    const noteVal = formData.get('note').trim();
    const leverageVal = formData.get('leverage');

    if (!date || !direction || isNaN(entryVal) || isNaN(exitVal) || isNaN(lotsVal)) {
      toast('Please complete all required fields.', 'error');
      setSaving(false);
      return;
    }

    const tradeRes = calcPnl(entryVal, exitVal, lotsVal, 0, slVal, tpVal, direction, swapVal);
    const { pnl, pips, rr } = tradeRes;
    const outcome = pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE';

    const tradeData = {
      date, direction, entry: entryVal, exit: exitVal, lots: lotsVal, swap: swapVal, sl: slVal, tp: tpVal, rr, pips, session, setup, market: 'GOLD', leverage: leverageVal,
      pnl: parseFloat(pnl.toFixed(2)), outcome, note: noteVal, screenshots, timestamp: new Date()
    };

    try {
      await addTrade(tradeData);
      e.target.reset();
      setDirection(null);
      setDate(todayStr());
      setEntry(''); setExit(''); setLots('0.10'); setSwap(''); setSl(''); setTp(''); setNote(''); setLeverage(''); setSession(''); setSetup(''); setScreenshots([]);
      toast(`Trade recorded: ${outcome} ${formatCurrency(pnl, true)}`, outcome === 'WIN' ? 'success' : outcome === 'LOSS' ? 'error' : 'warn');
    } catch (err) {
      toast(err?.message || 'Failed to record trade. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sortedForChart = [...trades].sort((a, b) => a.date.localeCompare(b.date));

  let chartVisibleTrades = sortedForChart;
  let initialBalanceForChart = walletBalance || 0;

  if (equityPeriod === '30') {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    chartVisibleTrades = sortedForChart.filter(t => t.date >= cutoffStr);

    // Calculate the cumulative pnl of all trades BEFORE the 30-day window
    const olderTrades = sortedForChart.filter(t => t.date < cutoffStr);
    initialBalanceForChart += olderTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  }

  const chartLabels = ['Start', ...chartVisibleTrades.map(t => t.date)];
  let currentBalance = initialBalanceForChart;
  const chartDataPoints = [currentBalance, ...chartVisibleTrades.map(t => {
    currentBalance += t.pnl;
    return parseFloat(currentBalance.toFixed(2));
  })];

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Equity',
      data: chartDataPoints,
      borderColor: '#8B5CF6',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 3,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 13, 20, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        padding: 12,
        borderRadius: 8,
        displayColors: false,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
        ticks: { color: isLightMode ? '#64748b' : '#94a3b8', font: { size: 11 } }
      }
    }
  };

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempBalance, setTempBalance] = useState(walletBalance || 0);
  const [tempGoal, setTempGoal] = useState(monthlyGoal || 1000);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    setTempBalance(walletBalance || 0);
  }, [walletBalance]);

  const handleSaveBalance = async () => {
    await updateBalance(parseFloat(tempBalance) || 0);
    setIsEditingBalance(false);
    toast("Wallet initialized.", "success");
  };

  const handleSaveGoal = async () => {
    await updateMonthlyGoal(parseFloat(tempGoal) || 0);
    setIsEditingGoal(false);
    toast("Monthly objective updated.", "success");
  };

  const handleWipeTerminal = async () => {
    try {
      await resetTrades();
      await updateBalance(0);
      setIsEditingBalance(true);
      setIsWiping(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast("Terminal wiped. Setup new balance.", "warn");
    } catch (e) {
      toast("Failed to reset terminal: " + e.message, "error");
    }
  };

  useEffect(() => {
    let timer;
    if (isWiping) {
      timer = setTimeout(() => setIsWiping(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [isWiping]);

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const difference = nextMonth - now;

      if (difference <= 0) {
        setTimeLeft('00d : 00h : 00m : 00s');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLimitReached) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse rounded-full" />
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10 border border-white/10 group">
            <LockFill className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500" />
          </div>
        </div>

        <div className="max-w-md space-y-3">
          <h2 className="text-3xl font-black text-gradient-red uppercase tracking-tighter">Terminal Locked</h2>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
            Free monthly limit reached ({TRADE_LIMIT}/{TRADE_LIMIT}). <br />
            <span className="text-destructive font-black">Upgrade to Pro</span> to unlock unlimited operations and cognitive brief logs.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Time until limit resets:</span>
          <div className="flex items-center gap-2">
            {timeLeft.split(' : ').map((part, index) => {
              const value = part.slice(0, -1);
              const label = part.slice(-1);
              const labelName = label === 'd' ? 'Days' : label === 'h' ? 'Hours' : label === 'm' ? 'Mins' : 'Secs';
              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center bg-muted/40 border border-border/50 rounded-2xl px-4 py-2.5 min-w-[64px] shadow-sm">
                    <span className="text-xl font-black tracking-tight text-foreground">{value}</span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/60">{labelName}</span>
                  </div>
                  {index < 3 && (
                    <span className="text-sm font-black text-muted-foreground/30 mx-1.5 animate-pulse">:</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button
            onClick={() => setShowPricingModal(true)}
            className="flex-1 h-14 btn-apple-primary text-xs"
          >
            Go Pro Now
          </button>
          <button
            onClick={() => auth.signOut()}
            className="flex-1 h-14 btn-apple-secondary text-[10px]"
          >
            Logout
          </button>
        </div>

        <style>{`
          .text-gradient-red {
            background: linear-gradient(to bottom right, #ef4444, #991b1b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
      </div>
    );
  }

  const currentWalletBalance = (walletBalance || 0) + trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const winRate = chartVisibleTrades.length ? (chartVisibleTrades.filter(t => t.outcome === 'WIN').length / chartVisibleTrades.length * 100).toFixed(0) : 0;

  const thisMonthTrades = trades.filter(t => t.date >= monthStart);
  const thisMonthPnl = thisMonthTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const goalProgress = Math.min(100, Math.max(0, (thisMonthPnl / (monthlyGoal || 1)) * 100));

  const wins = chartVisibleTrades.filter(t => (t.pnl || 0) > 0);
  const losses = chartVisibleTrades.filter(t => (t.pnl || 0) < 0);
  const avgProfit = wins.length ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length : 0;

  const userDisplayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Trader';

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      await saveJournalEntry(todayStr(), reviewText.trim(), 'neutral');
      setReviewText('');
      toast('Daily review note saved successfully.', 'success');
    } catch (err) {
      toast('Failed to record review: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-3xl border border-border/30 shadow-flat relative group overflow-hidden">
        <div className="space-y-1 flex-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Selected asset: XAU/USD</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(thisMonthPnl)}
            </h1>
            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
              thisMonthPnl >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {thisMonthPnl >= 0 ? '+' : ''}{thisMonthPnl.toFixed(2)} this month
            </span>
          </div>

          {/* OBJECTIVE PROGRESS BAR */}
          <div className="pt-2 max-w-md">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-1">
              <span>Objective Target</span>
              {isEditingGoal ? (
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={tempGoal}
                    onChange={handleNumericChange(setTempGoal)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
                    className="w-16 h-5 px-1 text-[9px] font-bold border border-primary bg-background rounded"
                  />
                  <button onClick={handleSaveGoal} className="text-primary hover:underline lowercase text-[9px]">save</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingGoal(true)} className="hover:text-primary transition-colors hover:underline text-[9px] uppercase">
                  Goal: {formatCurrency(monthlyGoal)} ({goalProgress.toFixed(0)}%)
                </button>
              )}
            </div>
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000" 
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-right sm:block hidden shrink-0">
          <p className="text-sm font-black text-foreground uppercase">Gold USD (XAU-USD)</p>
          <p className="text-[9px] font-black text-muted-foreground tracking-widest">Active journaling instrument</p>
        </div>
      </header>

      {/* TABS SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/20 pb-4">
        <div className="glass-tab-container">
          <button
            onClick={() => setActiveTab('chart')}
            className={`glass-tab-button ${activeTab === 'chart' ? 'glass-tab-button-active' : ''}`}
          >
            Performance Chart
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`glass-tab-button ${activeTab === 'log' ? 'glass-tab-button-active' : ''}`}
          >
            Log Trade
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`glass-tab-button ${activeTab === 'logs' ? 'glass-tab-button-active' : ''}`}
          >
            Recent Logs
          </button>
        </div>

        {/* TIMESCALE SELECTORS */}
        <div className="glass-tab-container">
          <button
            onClick={() => setEquityPeriod('30')}
            className={`glass-tab-button ${equityPeriod === '30' ? 'glass-tab-button-active' : ''}`}
          >
            30 Days
          </button>
          <button
            onClick={() => setEquityPeriod('all')}
            className={`glass-tab-button ${equityPeriod === 'all' ? 'glass-tab-button-active' : ''}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* ACTIVE VIEW TAB CONTENT */}
      <div className="transition-all duration-300">
        {activeTab === 'chart' && (
          <div className="card-premium p-6 h-[320px] sm:h-[450px] flex flex-col relative overflow-hidden">
            <div className="flex-1 w-full min-h-0 relative z-10">
              {trades.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-muted/50 border border-border/50 flex items-center justify-center shadow-inner">
                    <BarChartLine className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-sm font-bold text-foreground opacity-80">No Performance Data</span>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 px-8 leading-relaxed">Log trades to see your performance curve.</p>
                  </div>
                </div>
              )}
            </div>
            {/* Background Glow */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {activeTab === 'log' && (
          <div className="card-premium p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Record New Gold Trade</h3>
            <form onSubmit={saveTradeForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</label>
                  <DatePicker name="date" value={date} onChange={setDate} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Market</label>
                  <div className="h-11 rounded-xl border border-border/40 bg-muted/10 flex items-center px-3 gap-2 overflow-hidden whitespace-nowrap">
                    <span className="text-[11px] font-black text-primary">XAU/USD</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">· Gold</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Session</label>
                  <CustomSelect
                    name="session"
                    value={session}
                    onChange={setSession}
                    options={[
                      { value: 'Sydney', label: 'Sydney' },
                      { value: 'Tokyo', label: 'Tokyo' },
                      { value: 'London', label: 'London' },
                      { value: 'NewYork', label: 'NewYork' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Direction</label>
                  <div className="flex bg-muted/40 rounded-xl p-1 gap-1 border border-border/40 h-11">
                    <button
                      type="button"
                      onClick={() => setDirection('BUY')}
                      className={`flex-1 rounded-lg text-[10px] font-black transition-all ${direction === 'BUY' ? 'bg-green-500 text-white shadow-lg' : 'hover:bg-background text-muted-foreground hover:text-foreground'}`}
                    >BUY</button>
                    <button
                      type="button"
                      onClick={() => setDirection('SELL')}
                      className={`flex-1 rounded-lg text-[10px] font-black transition-all ${direction === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-background text-muted-foreground hover:text-foreground'}`}
                    >SELL</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Setup</label>
                  <CustomSelect
                    name="setup"
                    value={setup}
                    onChange={setSetup}
                    options={[
                      { value: 'A+ Setup', label: 'A+ Setup' },
                      { value: 'Breakout', label: 'Breakout' },
                      { value: 'Reversal', label: 'Reversal' },
                      { value: 'News', label: 'News' },
                      { value: 'Trend', label: 'Trend' }
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Leverage</label>
                  <CustomSelect
                    name="leverage"
                    value={leverage}
                    onChange={setLeverage}
                    options={[
                      { value: '1:1', label: '1:1' },
                      { value: '1:10', label: '1:10' },
                      { value: '1:30', label: '1:30' },
                      { value: '1:50', label: '1:50' },
                      { value: '1:100', label: '1:100' },
                      { value: '1:200', label: '1:200' },
                      { value: '1:500', label: '1:500' },
                      { value: '1:1000', label: '1:1000' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Entry Price</label>
                  <input type="text" name="entry" inputMode="decimal" value={entry} onChange={handleNumericChange(setEntry)} className="input-premium h-11 text-xs font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Exit Price</label>
                  <input type="text" name="exit" inputMode="decimal" value={exit} onChange={handleNumericChange(setExit)} className="input-premium h-11 text-xs font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lot Size</label>
                  <input type="text" name="lots" inputMode="decimal" value={lots} onChange={handleNumericChange(setLots)} className="input-premium h-11 text-xs font-bold" placeholder="0.10" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stop Loss</label>
                  <input type="text" name="sl" inputMode="decimal" value={sl} onChange={handleNumericChange(setSl)} className="input-premium h-11 text-xs font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Take Profit</label>
                  <input type="text" name="tp" inputMode="decimal" value={tp} onChange={handleNumericChange(setTp)} className="input-premium h-11 text-xs font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Swap / Fees ($)</label>
                  <input type="text" name="swap" inputMode="decimal" value={swap} onChange={handleNumericChange(setSwap)} className="input-premium h-11 text-xs font-bold" placeholder="0.00" />
                </div>
              </div>

              {pnlData.pnl !== null && (
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 flex justify-between items-center animate-in slide-in-from-top-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Forecasted Impact ({pnlData.pips} Pips)</span>
                    <span className={`text-lg font-black ${pnlData.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(pnlData.pnl, true)}
                    </span>
                  </div>
                  {pnlData.rr && (
                    <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black tracking-tight ${pnlData.rr >= 2 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                      R:R {pnlData.rr}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Trade Notes</label>
                <textarea name="note" value={note} onChange={e => setNote(e.target.value)} className="input-premium h-20 resize-none text-xs leading-relaxed p-3" placeholder="Emotional state, pattern recognized, execution comments..."></textarea>
              </div>

              {/* Screenshots Upload Zone */}
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex justify-between">
                  <span>Analysis Screenshots</span>
                  {plan !== 'pro' && <span className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1"><LockFill className="w-2.5 h-2.5" /> Pro Feature</span>}
                </label>

                {plan === 'pro' ? (
                  <div className="space-y-3">
                    <div className="relative border border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 bg-muted/10 group hover:bg-muted/20">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <CloudArrowUp className="w-7 h-7 text-muted-foreground/60 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                      <span className="text-[11px] font-black text-foreground/80 uppercase tracking-widest">
                        {uploading ? `Uploading (${uploadProgress}%)...` : 'Drag & Drop or Click to Upload'}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">PNG, JPG or WEBP (Max 5MB each)</span>
                    </div>

                    {uploading && (
                      <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    {screenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {screenshots.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl border border-border/50 overflow-hidden bg-muted group/thumb shadow-sm">
                            <img src={url} alt="upload preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(i)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive/85 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow active:scale-90"
                              title="Delete screenshot"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => { setShowPricingModal(true); toast('Upgrade to Pro to attach analysis screenshots.', 'warn'); }}
                    className="border border-dashed border-border/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/5 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <LockFill className="w-6 h-6 text-muted-foreground/40" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Attach Analysis Screenshots</span>
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mt-1">Unlock with Pro</span>
                  </div>
                )}
              </div>

              {plan === 'free' && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    <span>Trade Limit</span>
                    <span>{thisMonthTradesCount} / {TRADE_LIMIT} Logs</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/20 shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ease-[var(--apple-ease)] ${isLimitReached ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary'}`}
                      style={{ width: `${(thisMonthTradesCount / TRADE_LIMIT) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || isLimitReached}
                className={`w-full h-12 btn-apple-primary text-[11px] ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {saving ? 'Saving...' : isLimitReached ? 'Limit Exceeded' : 'Save Trade'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card-premium p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Recent Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground uppercase text-[9px] font-black tracking-wider">
                    <th className="py-2">Date</th>
                    <th className="py-2">Market</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Lots</th>
                    <th className="py-2 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {trades.slice(0, 10).map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 font-semibold text-foreground/80">
                      <td className="py-2.5 text-muted-foreground">{t.date}</td>
                      <td className="py-2.5 font-bold text-foreground">{t.market || 'GOLD'}</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest ${
                          t.direction === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>{t.direction}</span>
                      </td>
                      <td className="py-2.5 font-mono">{t.lots}</td>
                      <td className={`py-2.5 text-right font-black ${
                        t.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>{t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}</td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-muted-foreground">No trades logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4 PASTEL CARDS STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Win Rate */}
        <div className="card-pastel-green-glass p-5 rounded-3xl flex flex-col gap-1.5 text-left transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Win Rate</span>
          <p className="text-2xl font-black tracking-tight">{winRate}%</p>
          <p className="text-[9px] font-bold opacity-70">Percentage of winning logs</p>
        </div>

        {/* Card 2: Avg Profit */}
        <div className="card-pastel-blue-glass p-5 rounded-3xl flex flex-col gap-1.5 text-left transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Avg Win</span>
          <p className="text-2xl font-black tracking-tight">{formatCurrency(avgProfit)}</p>
          <p className="text-[9px] font-bold opacity-70">Average gain per win</p>
        </div>

        {/* Card 3: Avg Drawdown */}
        <div className="card-pastel-pink-glass p-5 rounded-3xl flex flex-col gap-1.5 text-left transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Avg Loss</span>
          <p className="text-2xl font-black tracking-tight">{formatCurrency(avgLoss)}</p>
          <p className="text-[9px] font-bold opacity-70">Average loss per drawdown</p>
        </div>

        {/* Card 4: Wallet Balance */}
        <div className="card-pastel-yellow-glass p-5 rounded-3xl flex flex-col gap-1.5 text-left transition-transform duration-300 hover:-translate-y-0.5 relative overflow-hidden group hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Balance</span>
            {!isEditingBalance && plan === 'pro' && (
              <button 
                onClick={() => setIsEditingBalance(true)}
                className="text-[8px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                Deposit
              </button>
            )}
          </div>
          {isEditingBalance ? (
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                inputMode="decimal"
                value={tempBalance}
                onChange={handleNumericChange(setTempBalance)}
                onKeyDown={e => e.key === 'Enter' && handleSaveBalance()}
                className="w-full h-7 px-1 text-xs font-bold border border-primary bg-background rounded text-foreground"
              />
              <button onClick={handleSaveBalance} className="text-[10px] font-black text-primary uppercase">Save</button>
            </div>
          ) : (
            <>
              <p className="text-2xl font-black tracking-tight">{formatCurrency(currentWalletBalance)}</p>
              <p className="text-[9px] font-bold opacity-70">Total account equity</p>
            </>
          )}
        </div>
      </div>

      {/* DAILY REVIEW NOTES FEED */}
      <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-flat flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pastel-yellow border border-yellow-400 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
              Daily Reviews & Cognitive Thoughts
            </h3>
          </div>
          <span className="text-[9px] font-black bg-pastel-cream px-2 py-0.5 rounded-full">
            {Object.keys(journals).length} notes logged
          </span>
        </div>

        {/* FEED CONTENT */}
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {Object.entries(journals).slice(0, 5).map(([jDate, jData]) => (
            <div key={jDate} className="bg-pastel-cream p-4 rounded-2xl border border-yellow-100 flex gap-3 text-left animate-in fade-in duration-300">
              <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 text-yellow-600 font-bold text-xs uppercase border border-yellow-200">
                {jDate.slice(-2)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-foreground">{userDisplayName}</span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground/60">{jDate}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  {jData.text}
                </p>
              </div>
            </div>
          ))}
          {Object.keys(journals).length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No journal reviews recorded yet. Write your thoughts below to log one.
            </div>
          )}
        </div>

        {/* FEED INPUT FORM */}
        <form onSubmit={handleAddReview} className="flex gap-2">
          <input
            type="text"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share today's review notes..."
            className="flex-1 h-11 px-4 rounded-xl border border-border/40 bg-muted/20 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <button
            type="submit"
            className="btn-apple-yellow shrink-0"
          >
            Submit
          </button>
        </form>
      </div>

      {/* PRO RESET OPTION */}
      {(plan === 'pro' || import.meta.env.DEV) && (
        <div className="pt-8 pb-4 hidden md:flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
          {isWiping && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 max-w-sm flex gap-3 text-left animate-in slide-in-from-bottom-2 duration-300">
              <ExclamationTriangleFill className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-1">Danger Zone</p>
                <p className="text-[10px] text-destructive/80 leading-relaxed font-bold">
                  This will permanently delete all trades and reset your balance. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => isWiping ? handleWipeTerminal() : setIsWiping(true)}
            className="reset-trash-btn"
            title="Reset Terminal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="svgIcon bin-top">
              <g clipPath="url(#clip0_35_24)">
                <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z" />
              </g>
              <defs>
                <clipPath id="clip0_35_24">
                  <rect fill="white" height={14} width={69} />
                </clipPath>
              </defs>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="svgIcon bin-bottom">
              <g clipPath="url(#clip0_35_22)">
                <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z" />
              </g>
              <defs>
                <clipPath id="clip0_35_22">
                  <rect fill="white" height={57} width={69} />
                </clipPath>
              </defs>
            </svg>
            <span className="button-text">{isWiping ? 'Confirm?' : 'Reset'}</span>
          </button>
        </div>
      )}
    </div>
  );
}




