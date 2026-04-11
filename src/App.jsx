/* =============================================================================
   TRADING JOURNAL APP - Complete React/Vite App
   Firestore integration, Chart.js equity curve, full CRUD, analytics, CSV export
============================================================================= */
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc, setDoc, doc
} from "firebase/firestore";
import Login from "./Login.jsx";
import './App.css'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
const classNames = (...classes) => twMerge(clsx(classes))

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

/* =============================================================================
   SUB-COMPONENTS — defined OUTSIDE TradingApp so React does not
   recreate/remount them on every parent render (preserves internal state)
============================================================================= */
function LogTradeTab({ direction, setDirection, onSaveTrade, calcPnl, onUpgrade, todayStr, saving}) {
  const [entry, setEntry] = useState('')
  const [exit, setExit] = useState('')
  const [lots, setLots] = useState('0.10')
  const [amount, setAmount] = useState('')
  const [sl, setSl] = useState('')
  const [tp, setTp] = useState('')
  const [note, setNote] = useState('')

  const pnlData = calcPnl(
    parseFloat(entry) || 0, parseFloat(exit) || 0,
    parseFloat(lots) || 0, parseFloat(amount) || 0,
    parseFloat(sl) || 0, parseFloat(tp) || 0,
    direction
  )

  return (
    <>
      <div className="sub-banner">
        <div>
          <div className="sub-title">Trade like a pro with deeper insights</div>
          <div className="sub-text">Unlimited trades, equity curve, advanced analytics — all in Pro.</div>
        </div>
        <button className="sub-cta" onClick={onUpgrade}>View plans</button>
      </div>
      <div className="card">
        <div className="card-title">New trade</div>
        <form onSubmit={onSaveTrade}>
          <div className="field-row r2">
            <div className="field">
              <label>Date</label>
              <input type="date" name="date" defaultValue={todayStr()} />
            </div>
            <div className="field">
              <label>Session</label>
              <select name="session">
                <option value="">— Select session —</option>
                <option value="Asian">Asian</option>
                <option value="London">London</option>
                <option value="NY">New York</option>
                <option value="LN-NY">London–NY Overlap</option>
              </select>
            </div>
          </div>
          <div className="field-row r2">
            <div className="field">
              <label>Direction</label>
              <div className="dir-group">
                <div className={`dir-opt ${direction === 'BUY' ? 'sel-buy' : ''}`} onClick={() => setDirection('BUY')}>BUY</div>
                <div className={`dir-opt ${direction === 'SELL' ? 'sel-sell' : ''}`} onClick={() => setDirection('SELL')}>SELL</div>
              </div>
            </div>
            <div className="field">
              <label>Setup tag</label>
              <select name="setup">
                <option value="">— Select setup —</option>
                <option value="A+ Setup">A+ Setup</option>
                <option value="Breakout">Breakout</option>
                <option value="Reversal">Reversal</option>
                <option value="News">News</option>
                <option value="FOMO">FOMO</option>
                <option value="Revenge">Revenge</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="field-row r3">
            <div className="field">
              <label>Entry price</label>
              <input type="number" name="entry" placeholder="2645.00" step="0.01" value={entry} onChange={e => setEntry(e.target.value)} />
            </div>
            <div className="field">
              <label>Exit price</label>
              <input type="number" name="exit" placeholder="2658.50" step="0.01" value={exit} onChange={e => setExit(e.target.value)} />
            </div>
            <div className="field">
              <label>Lot size</label>
              <input type="number" name="lots" placeholder="0.10" step="0.01" value={lots} onChange={e => setLots(e.target.value)} />
            </div>
          </div>
          <div className="field-row r3">
            <div className="field">
              <label>Stop Loss (SL)</label>
              <input type="number" name="sl" placeholder="2638.00" step="0.01" value={sl} onChange={e => setSl(e.target.value)} />
            </div>
            <div className="field">
              <label>Take Profit (TP)</label>
              <input type="number" name="tp" placeholder="2668.00" step="0.01" value={tp} onChange={e => setTp(e.target.value)} />
            </div>
            <div className="field">
              <label>Amount invested ($)</label>
              <input type="number" name="amount" placeholder="500.00" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          </div>

          {pnlData.pnl !== null && (
            <div className="pnl-preview">
              <div>
                <span>Estimated P&L</span>
                <div style={{ marginTop: '3px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <strong style={{ color: pnlData.pnl >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                    {pnlData.pnl >= 0 ? '+' : ''}${Math.abs(pnlData.pnl).toFixed(2)}
                  </strong>
                  {pnlData.rr && <span className={`rr-chip ${pnlData.rr >= 1.5 ? 'good' : pnlData.rr < 1 ? 'bad' : ''}`}>R:R {pnlData.rr}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="field mb-10">
            <label>Trade notes</label>
            <textarea name="note" placeholder="Setup, entry reason, what went right or wrong..." value={note} onChange={e => setNote(e.target.value)}></textarea>
          </div>
          <div className="field mb-10">
            <label>Screenshots</label>
            <input type="file" multiple accept="image/*" name="screenshots" />
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save trade'}
          </button>
        </form>
      </div>
    </>
  )
}

function HistoryTab({ trades, onDeleteTrade, filterSearch, setFilterSearch, filterDir, setFilterDir, filterOutcome, setFilterOutcome, filterSession, setFilterSession, filterSetup, setFilterSetup, filterSort, setFilterSort, onExportCSV, onOpenEditModal }) {
  const [expandedNotes, setExpandedNotes] = useState({})

  let filtered = trades.filter(t => {
    if (filterSearch && !t.note?.toLowerCase().includes(filterSearch.toLowerCase())) return false
    if (filterDir && t.direction !== filterDir) return false
    if (filterOutcome && t.outcome !== filterOutcome) return false
    if (filterSession && t.session !== filterSession) return false
    if (filterSetup && t.setup !== filterSetup) return false
    return true
  })

  if (filterSort === 'oldest') filtered.sort((a, b) => a.date.localeCompare(b.date))
  else if (filterSort === 'best') filtered.sort((a, b) => b.pnl - a.pnl)
  else if (filterSort === 'worst') filtered.sort((a, b) => a.pnl - b.pnl)

  return (
    <div id="tab-history" className="section active">
      <div className="filter-bar">
        <input type="text" placeholder="Search notes..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
        <select value={filterDir} onChange={e => setFilterDir(e.target.value)}>
          <option value="">All directions</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
          <option value="">All outcomes</option>
          <option value="WIN">WIN</option>
          <option value="LOSS">LOSS</option>
          <option value="BE">Breakeven</option>
        </select>
        <select value={filterSession} onChange={e => setFilterSession(e.target.value)}>
          <option value="">All sessions</option>
          <option value="Asian">Asian</option>
          <option value="London">London</option>
          <option value="NY">New York</option>
          <option value="LN-NY">London–NY Overlap</option>
        </select>
        <select value={filterSetup} onChange={e => setFilterSetup(e.target.value)}>
          <option value="">All setups</option>
          <option value="A+ Setup">A+ Setup</option>
          <option value="Breakout">Breakout</option>
          <option value="Reversal">Reversal</option>
          <option value="News">News</option>
          <option value="FOMO">FOMO</option>
          <option value="Revenge">Revenge</option>
          <option value="Other">Other</option>
        </select>
        <select value={filterSort} onChange={e => setFilterSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="best">Best P&L</option>
          <option value="worst">Worst P&L</option>
        </select>
        <span className="filter-spacer"></span>
        <button className="export-btn" onClick={onExportCSV}>↓ Export CSV</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No trades match the current filters</div>
      ) : (
        <div id="history-list">
          {filtered.map(t => (
            <div key={t.id} className="trade-item cursor-pointer" onClick={() => setExpandedNotes(prev => ({ ...prev, [t.id]: !prev[t.id] }))}>
              <span className={`tag tag-${t.direction.toLowerCase()}`}>{t.direction}</span>
              <span className="td-date">{t.date}</span>
              <span className="td-price">
                {t.entry} → {t.exit}
                <br />
                <span className="small-muted">{t.amount > 0 ? `$${t.amount.toFixed(2)} invested` : `${t.lots} lot`}</span>
              </span>
              <span className={`td-pnl ${t.pnl >= 0 ? 'pos' : 'neg'}`}>{t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toFixed(2)}</span>
              <button className="del-btn" onClick={e => { e.stopPropagation(); onDeleteTrade(t.id) }}>×</button>
              {expandedNotes[t.id] && (
                <div className="trade-details">
                  {t.note && <p>{t.note}</p>}
                  {t.screenshots && t.screenshots.map((s, i) => <img key={i} src={s} alt="screenshot" style={{ maxWidth: '200px', margin: '5px' }} />)}
                  <div className="expand-actions">
                    <button className="icon-btn" onClick={e => { e.stopPropagation(); onOpenEditModal(t) }}>✎ Edit</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CalendarTab({ trades }) {
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [selectedCalDay, setSelectedCalDay] = useState(null)

  const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const fmtDate = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString + 'T00:00:00'))

  const dayTrades = (y, m, d) => {
    const key = formatDate(y, m, d)
    return trades.filter(t => t.date === key)
  }

  const renderCells = () => {
    const first = new Date(calYear, calMonth, 1).getDay()
    const days = new Date(calYear, calMonth + 1, 0).getDate()
    const cells = []

    for (let i = 0; i < first; i++) cells.push(<div key={`empty-${i}`} className="cal-day empty"></div>)

    for (let d = 1; d <= days; d++) {
      const ts = dayTrades(calYear, calMonth, d)
      const pnl = ts.reduce((sum, t) => sum + t.pnl, 0)
      const cls = ts.length ? (pnl > 0.01 ? 'win' : pnl < -0.01 ? 'loss' : 'be') : ''
      const todayDate = new Date()
      const isToday = d === todayDate.getDate() && calMonth === todayDate.getMonth() && calYear === todayDate.getFullYear()
      const selected = d === selectedCalDay
      cells.push(
        <div key={`day-${d}`} className={`cal-day ${cls}${isToday ? ' today' : ''}${selected ? ' selected' : ''}`} onClick={() => setSelectedCalDay(d)}>
          <div className="cal-day-num">{d}</div>
          {ts.length > 0 && <div className="cal-pnl">{pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(0)}</div>}
          {ts.length > 0 && <div className="cal-trade-count">{ts.length}t</div>}
        </div>
      )
    }
    return cells
  }

  const selectedTrades = selectedCalDay ? dayTrades(calYear, calMonth, selectedCalDay) : []
  const selectedDate = selectedCalDay ? formatDate(calYear, calMonth, selectedCalDay) : ''
  const selectedTotal = selectedTrades.reduce((sum, t) => sum + t.pnl, 0)

  const changeMonth = (delta) => {
    let nextMonth = calMonth + delta, nextYear = calYear
    if (nextMonth < 0) { nextMonth = 11; nextYear-- }
    if (nextMonth > 11) { nextMonth = 0; nextYear++ }
    setCalMonth(nextMonth)
    setCalYear(nextYear)
    setSelectedCalDay(null)
  }

  return (
    <div id="tab-calendar" className="section active">
      <div className="card">
        <div className="cal-nav">
          <button type="button" onClick={() => changeMonth(-1)}>&#8249;</button>
          <h3>{new Date(calYear, calMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button type="button" onClick={() => changeMonth(1)}>&#8250;</button>
        </div>
        <div className="cal-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="cal-dow">{d}</div>)}
        </div>
        <div className="cal-grid" style={{ marginTop: '4px' }}>{renderCells()}</div>
      </div>
      <div className="legend-row">
        <span className="legend-item win">■ Win day</span>
        <span className="legend-item loss">■ Loss day</span>
        <span className="legend-item be">■ Breakeven</span>
      </div>
      <div className="cal-day-detail">
        {selectedCalDay ? (
          <>
            <div className="cal-detail-title">
              {fmtDate(selectedDate)} — {selectedTrades.length} trade{selectedTrades.length !== 1 ? 's' : ''}{' '}
              <span style={{ color: selectedTotal >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                {selectedTotal >= 0 ? '+' : ''}${Math.abs(selectedTotal).toFixed(2)}
              </span>
            </div>
            {selectedTrades.map(trade => (
              <div key={trade.id} className="cal-detail-trade">
                <span className={`tag tag-${trade.direction.toLowerCase()}`}>{trade.direction}</span>
                <span style={{ fontFamily: 'Consolas,monospace', color: 'var(--text-soft)' }}>{trade.entry} → {trade.exit}</span>
                <span className={`td-pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}`} style={{ marginLeft: 'auto' }}>
                  {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                </span>
              </div>
            ))}
          </>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select a day to see trade details.</div>
        )}
      </div>
    </div>
  )
}

function AnalyticsTab({ trades, startingBalance = 0 }) {
  const wins = trades.filter(t => t.outcome === 'WIN')
  const losses = trades.filter(t => t.outcome === 'LOSS')
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0
  const wr = trades.length ? wins.length / trades.length : 0
  const expectancy = (wr * avgWin) + ((1 - wr) * avgLoss)
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  const pf = grossLoss > 0 ? grossWin / grossLoss : null
  const rrTrades = trades.filter(t => t.rr)
  const avgRR = rrTrades.length ? rrTrades.reduce((s, t) => s + t.rr, 0) / rrTrades.length : null

  let peak = startingBalance, maxDD = 0, running = startingBalance
  ;[...trades].sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
    running += t.pnl
    if (running > peak) peak = running
    const dd = peak - running
    if (dd > maxDD) maxDD = dd
  })

  const monthMap = {}
  trades.forEach(t => {
    const key = t.date.substring(0, 7)
    monthMap[key] = (monthMap[key] || 0) + t.pnl
  })
  const months = Object.keys(monthMap).sort().reverse()
  const maxAbs = months.length ? Math.max(...months.map(m => Math.abs(monthMap[m]))) : 1

  return (
    <div id="tab-analytics" className="section active">
      <div className="stats-row">
        <div className="stat">
          <div className="stat-lbl">Expectancy</div>
          <div className={`stat-val ${expectancy > 0 ? 'pos' : expectancy < 0 ? 'neg' : ''}`}>
            {trades.length ? `${expectancy >= 0 ? '+' : ''}$${expectancy.toFixed(2)}` : '—'}
          </div>
          <div className="stat-sub">per trade avg</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Avg Win</div>
          <div className="stat-val pos">{wins.length ? `+$${avgWin.toFixed(2)}` : '—'}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Avg Loss</div>
          <div className="stat-val neg">{losses.length ? `-$${Math.abs(avgLoss).toFixed(2)}` : '—'}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Profit Factor</div>
          <div className={`stat-val ${pf !== null ? (pf >= 1.5 ? 'pos' : pf < 1 ? 'neg' : '') : ''}`}>
            {pf !== null ? pf.toFixed(2) : '—'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Avg R:R</div>
          <div className="stat-val gold">{avgRR !== null ? avgRR.toFixed(2) : '—'}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Max Drawdown</div>
          <div className="stat-val neg">{maxDD > 0 ? `-$${maxDD.toFixed(2)}` : '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Monthly P&L</div>
        <div className="monthly-bars">
          {months.length ? months.map(month => {
            const value = monthMap[month]
            const percent = Math.abs(value) / maxAbs * 100
            const label = new Date(`${month}-01`).toLocaleString('default', { month: 'short', year: '2-digit' })
            return (
              <div key={month} className="monthly-bar-row">
                <div className="monthly-bar-label">{label}</div>
                <div className="monthly-bar-track">
                  <div className={`monthly-bar-fill ${value >= 0 ? 'pos' : 'neg'}`} style={{ width: `${percent.toFixed(1)}%` }}></div>
                </div>
                <div className={`monthly-bar-val ${value >= 0 ? 'pos' : 'neg'}`}>
                  {value >= 0 ? '+' : ''}${value.toFixed(0)}
                </div>
              </div>
            )
          }) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No trades yet.</div>}
        </div>
      </div>
    </div>
  )
}

function JournalTab({ journals, journalDate, setJournalDate, journalText, setJournalText, selectedMood, setSelectedMood, saveJournal, deleteJournalEntry, journalSaved }) {
  const moods = ['', '😤', '😕', '😐', '🙂', '😎']
  const entries = Object.entries(journals).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div id="tab-journal" className="section active">
      <div className="card">
        <div className="card-title">Daily journal</div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={journalDate} onChange={e => setJournalDate(e.target.value)} />
        </div>
        <div className="mood-row">
          <span className="mood-label">Mindset today</span>
          <div className="mood-btns">
            {moods.slice(1).map((emoji, index) => (
              <div key={index} className={`mood-btn ${selectedMood === index + 1 ? 'sel' : ''}`}
                title={['Terrible', 'Bad', 'Neutral', 'Good', 'Excellent'][index]}
                onClick={() => setSelectedMood(index + 1)}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Your thoughts</label>
          <textarea className="jnl-area" value={journalText} onChange={e => setJournalText(e.target.value)}
            placeholder="How did you feel today? What was the market doing? What did you learn?..." />
        </div>
        <div className="journal-actions">
          <button className="save-btn" onClick={saveJournal}>Save entry</button>
          <span className="save-ok" style={{ display: journalSaved ? 'inline' : 'none' }}>✓ Saved</span>
        </div>
      </div>
      <div className="jnl-list">
        <div className="jnl-list-title">Past entries</div>
        {entries.length === 0 ? (
          <div className="empty-state">No journal entries yet — write your first one above</div>
        ) : entries.map(([date, entry]) => (
          <div key={date} className="jnl-entry">
            <div className="jnl-entry-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="jnl-entry-date">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date + 'T00:00:00'))}
                </div>
                {entry.mood ? <span className="jnl-entry-mood">{moods[entry.mood]}</span> : null}
              </div>
              <button className="jnl-del-btn" onClick={() => deleteJournalEntry(date)}>×</button>
            </div>
            <div className="jnl-entry-text">
              {entry.text?.substring(0, 200)}{entry.text?.length > 200 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =============================================================================
   MAIN TRADING APP
============================================================================= */
function TradingApp({ user }) {
  const navigation = [
    { id: 'log', name: 'Log Trade' },
    { id: 'history', name: 'History' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'journal', name: 'Journal' }
  ]
  const [activeTab, setActiveTab] = useState('log')
  const [trades, setTrades] = useState([])
  const [journals, setJournals] = useState({})
  const [direction, setDirection] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)
  const [startingBalance, setStartingBalance] = useState(0)
  const [plan] = useState('free')
  const [isLightMode, setIsLightMode] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [toasts, setToasts] = useState([])
  const [filterSearch, setFilterSearch] = useState('')
  const [filterDir, setFilterDir] = useState('')
  const [filterOutcome, setFilterOutcome] = useState('')
  const [filterSession, setFilterSession] = useState('')
  const [filterSetup, setFilterSetup] = useState('')
  const [filterSort, setFilterSort] = useState('newest')
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0])
  const [journalText, setJournalText] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)
  const [equityPeriod, setEquityPeriod] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [editForm, setEditForm] = useState({
    date: '', entry: '', exit: '', lots: '', amount: '', sl: '', tp: '',
    note: '', session: '', setup: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const SUB_LIMITS = { freeTrades: 5, freeJournals: 10 }
  const today = new Date()

  const toast = useCallback((msg, type = 'success', duration = 3000) => {
    const id = Symbol()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const pad2 = n => String(n).padStart(2, '0')
  const todayStr = () => `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

  const storage = {
    async get(key, defaultValue = null) {
      try {
        const v = localStorage.getItem(key)
        return v !== null ? JSON.parse(v) : defaultValue
      } catch { return defaultValue }
    },
    async set(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    }
  }

  const loadTheme = () => {
    const saved = localStorage.getItem('xau-theme')
    if (saved === 'light') { 
      setIsLightMode(true); 
      setTheme('light');
      document.body.classList.add('light') 
    }
  }

  const loadTrades = async () => {
  try {
    setLoadError(null)
    const snapshot = await getDocs(collection(db, "users", user.uid, "trades"))
    const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    loaded.sort((a, b) => b.date.localeCompare(a.date))
    setTrades(loaded)
  } catch (error) {
    console.error('Error loading trades:', error)
    setLoadError(error.message)
    setTrades([])
  }
}

  const loadJournals = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'journals'))
      const newJournals = {}
      snapshot.docs.forEach(d => { newJournals[d.id] = d.data() })
      setJournals(newJournals)
    } catch { setJournals({}) }
  }

  const loadWallet = async () => {
    try {
      const r = await storage.get('xau-starting-balance')
      setStartingBalance(r ? parseFloat(r) || 0 : 0)
    } catch { setStartingBalance(0) }
  }

  useEffect(() => {
    const init = async () => {
      loadTheme()
      await Promise.all([loadTrades(), loadJournals(), loadWallet()])
      if (!localStorage.getItem('xau-onboarded')) setTimeout(() => setShowOnboarding(true), 400)
    }
    init()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const entry = journals[journalDate] || {}
    setJournalText(entry.text || '')
    setSelectedMood(entry.mood || null)
  }, [journalDate, journals])

  const toggleTheme = () => {
    const newMode = !isLightMode
    const newTheme = newMode ? 'light' : 'dark'
    setIsLightMode(newMode)
    setTheme(newTheme)
    document.body.classList.toggle('light', newMode)
    localStorage.setItem('xau-theme', newTheme)
  }

  const calcPnl = (entry, exit, lots, amount, sl, tp, dir = null) => {
    if (!entry || !exit || !dir || (!lots && !amount)) return { pnl: null, rr: null, risk: null, reward: null }
    const diff = dir === 'BUY' ? exit - entry : entry - exit
    const pnl = amount > 0 ? (diff / entry) * amount : diff * lots * 100
    let rr = null, risk = null, reward = null
    if (sl && tp) {
      risk = Math.abs(dir === 'BUY' ? entry - sl : sl - entry)
      reward = Math.abs(dir === 'BUY' ? tp - entry : entry - tp)
      if (risk > 0) rr = parseFloat((reward / risk).toFixed(2))
    }
    return { pnl: parseFloat(pnl.toFixed(2)), rr, risk, reward }
  }

  const saveTrade = async (e) => {
  e.preventDefault()
  setSaving(true)

  const formData = new FormData(e.target)
  const date = formData.get('date')
  const entry = parseFloat(formData.get('entry'))
  const exit = parseFloat(formData.get('exit'))
  const lots = parseFloat(formData.get('lots')) || 0
  const amount = parseFloat(formData.get('amount')) || 0
  const sl = parseFloat(formData.get('sl')) || null
  const tp = parseFloat(formData.get('tp')) || null
  const note = formData.get('note').trim()
  const session = formData.get('session')
  const setup = formData.get('setup')

  if (!date || !direction || isNaN(entry) || isNaN(exit) || (!amount && isNaN(lots))) {
    toast('Please fill in date, direction, prices and lot size.', 'error')
    setSaving(false)
    return
  }

  const diff = direction === 'BUY' ? exit - entry : entry - exit
  const pnl = amount > 0 ? (diff / entry) * amount : diff * lots * 100
  const outcome = pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE'

  let rr = null
  if (sl && tp) {
    const risk = Math.abs(direction === 'BUY' ? entry - sl : sl - entry)
    const rew = Math.abs(direction === 'BUY' ? tp - entry : entry - tp)
    if (risk > 0) rr = parseFloat((rew / risk).toFixed(2))
  }

  const trade = {
    date, direction, entry, exit, lots: isNaN(lots) ? 0 : lots,
    amount, sl, tp, rr, session, setup,
    pnl: parseFloat(pnl.toFixed(2)), outcome, note,
    timestamp: new Date()
  }

  try {
    const docRef = await addDoc(collection(db, "users", user.uid, "trades"), trade)
    setTrades(prev => [{ id: docRef.id, ...trade }, ...prev])
    e.target.reset()
    e.target.date.value = todayStr()
    setDirection(null)
    const icon = outcome === 'WIN' ? '🟢' : outcome === 'LOSS' ? '🔴' : '🟡'
    toast(`${icon} Trade saved — ${outcome} ${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(2)}`,
      outcome === 'WIN' ? 'success' : outcome === 'LOSS' ? 'error' : 'warn')
  } catch (error) {
    console.error('Firestore save error:', error)
    toast('Failed to save trade — ' + error.message, 'error')
  } finally {
    setSaving(false)
  }
}

  const deleteTrade = async (id) => {
    if (!confirm('Delete this trade?')) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trades', id))
      setTrades(prev => prev.filter(t => t.id !== id))
      toast('Trade deleted.', 'warn')
    } catch (error) {
      console.error('Error deleting trade:', error)
      toast('Failed to delete trade', 'error')
    }
  }

  const saveJournal = async () => {
    if (!journalDate) return
    const entryExists = Boolean(journals[journalDate])
    const newJournals = { ...journals }
    if (journalText.trim()) {
      newJournals[journalDate] = { text: journalText, mood: selectedMood }
    } else {
      delete newJournals[journalDate]
    }

    if (plan === 'free' && !entryExists && Object.keys(newJournals).length > SUB_LIMITS.freeJournals) {
      setShowPricingModal(true)
      toast(`Free plan limit (${SUB_LIMITS.freeJournals} entries). Upgrade to Pro.`, 'warn')
      return
    }

    try {
      if (journalText.trim()) {
        await setDoc(doc(db, 'users', user.uid, 'journals', journalDate), { text: journalText, mood: selectedMood })
      } else {
        await deleteDoc(doc(db, 'users', user.uid, 'journals', journalDate))
      }
      setJournals(newJournals)
      setJournalSaved(true)
      setTimeout(() => setJournalSaved(false), 2000)
      toast('Journal saved!', 'success')
    } catch (error) {
      console.error('Journal save error:', error)
      toast('Storage error.', 'error')
    }
  }

  const deleteJournalEntry = async (date) => {
    if (!confirm('Delete this journal entry?')) return
    const newJournals = { ...journals }
    delete newJournals[date]
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journals', date))
      setJournals(newJournals)
      if (journalDate === date) { setJournalText(''); setSelectedMood(null) }
      toast('Entry deleted.', 'warn')
    } catch (error) {
      console.error('Journal delete error:', error)
      toast('Storage error.', 'warn')
    }
  }

  const completeOnboarding = async () => {
    const val = parseFloat(document.getElementById('onboard-wallet')?.value || 0)
    if (!isNaN(val) && val > 0) {
      const newBalance = parseFloat(val.toFixed(2))
      setStartingBalance(newBalance)
      await storage.set('xau-starting-balance', newBalance)
    }
    localStorage.setItem('xau-onboarded', '1')
    setShowOnboarding(false)
    toast('Welcome! Log your first trade below.', 'success')
  }

  const dismissOnboarding = () => {
    localStorage.setItem('xau-onboarded', '1')
    setShowOnboarding(false)
  }

  const getWeeklySummary = () => {
    const cutoff = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0]
    const weekTrades = trades.filter(t => t.date >= cutoff)
    if (!weekTrades.length) return null
    const pnl = weekTrades.reduce((s, t) => s + t.pnl, 0)
    const wins = weekTrades.filter(t => t.outcome === 'WIN').length
    const wr = Math.round(wins / weekTrades.length * 100)
    return {
      title: `${today.toLocaleDateString('en-US', { weekday: 'long' })}'s week at a glance`,
      sub: `${weekTrades.length} trade${weekTrades.length > 1 ? 's' : ''} logged in the last 7 days`,
      pnl, wr, count: weekTrades.length
    }
  }

  const getEquityData = () => {
    const base = Number.isFinite(startingBalance) ? startingBalance : 0
    let sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    if (equityPeriod !== 'all') {
      const days = equityPeriod === '1w' ? 7 : equityPeriod === '1m' ? 30 : 90
      const cutoff = new Date(today.getTime() - days * 86400000).toISOString().split('T')[0]
      sorted = sorted.filter(t => t.date >= cutoff)
    }
    const labels = ['Start'], values = [base]
    let running = base
    sorted.forEach(t => { running += t.pnl; labels.push(t.date.slice(5)); values.push(parseFloat(running.toFixed(2))) })
    return { labels, values }
  }

  const exportCSV = () => {
    if (!trades.length) { toast('No trades to export.', 'warn'); return }
    const headers = ['Date', 'Direction', 'Session', 'Setup', 'Entry', 'Exit', 'Lots', 'SL', 'TP', 'RR', 'Amount', 'PnL', 'Outcome', 'Notes']
    const rows = trades.map(t => [
      t.date, t.direction, t.session || '', t.setup || '', t.entry, t.exit,
      t.lots, t.sl || '', t.tp || '', t.rr || '', t.amount, t.pnl, t.outcome,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `xauusd_trades_${todayStr()}.csv`
    a.click()
    toast(`Exported ${trades.length} trades.`, 'success')
  }

  const openEditModal = (trade) => {
    setEditingTrade(trade)
    setEditForm({
      date: trade.date || '', entry: trade.entry ?? '', exit: trade.exit ?? '',
      lots: trade.lots ?? '', amount: trade.amount ?? '', sl: trade.sl ?? '',
      tp: trade.tp ?? '', note: trade.note || '', session: trade.session || '', setup: trade.setup || ''
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingTrade(null)
    setEditForm({ date: '', entry: '', exit: '', lots: '', amount: '', sl: '', tp: '', note: '', session: '', setup: '' })
  }

  const saveEdit = async () => {
    if (!editingTrade) return
    const { date, entry: entryValue, exit: exitValue, lots: lotsValue, amount: amountValue, sl: slValue, tp: tpValue, note, session, setup } = editForm
    const entry = parseFloat(entryValue)
    const exit = parseFloat(exitValue)
    const lots = parseFloat(lotsValue) || 0
    const amount = parseFloat(amountValue) || 0
    const sl = slValue === '' ? null : parseFloat(slValue)
    const tp = tpValue === '' ? null : parseFloat(tpValue)

    if (!date || !editingTrade.direction || isNaN(entry) || isNaN(exit) || (!amount && isNaN(lots))) {
      toast('Please fill in date, direction, prices and lot size.', 'error')
      return
    }

    const diff = editingTrade.direction === 'BUY' ? (exit - entry) : (entry - exit)
    const pnl = amount > 0 ? (diff / entry) * amount : diff * lots * 100
    const outcome = pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE'

    let rr = null
    if (sl !== null && tp !== null) {
      const risk = Math.abs(editingTrade.direction === 'BUY' ? entry - sl : sl - entry)
      const rew = Math.abs(editingTrade.direction === 'BUY' ? tp - entry : entry - tp)
      if (risk > 0) rr = parseFloat((rew / risk).toFixed(2))
    }

    const updatedTrade = {
      ...editingTrade, date, entry, exit, lots: isNaN(lots) ? 0 : lots, amount,
      sl, tp, rr, session, setup, pnl: parseFloat(pnl.toFixed(2)), outcome, note: note.trim()
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'trades', editingTrade.id), updatedTrade)
      setTrades(prev => prev.map(t => t.id === editingTrade.id ? updatedTrade : t))
      closeEditModal()
      toast('Trade updated!', 'success')
    } catch (error) {
      console.error('Error updating trade:', error)
      toast('Failed to update trade', 'error')
    }
  }

  const equityData = getEquityData()
  const baseBalance = Number.isFinite(startingBalance) ? startingBalance : 0
  const totalPnl = equityData.values[equityData.values.length - 1] - baseBalance
  const peakVal = Math.max(...equityData.values)
  const troughVal = Math.min(...equityData.values)

  const chartData = {
    labels: equityData.labels,
    datasets: [{
      data: equityData.values,
      borderColor: equityData.values[equityData.values.length - 1] >= baseBalance ? '#20c997' : '#ff6b6b',
      borderWidth: 2, pointRadius: equityData.labels.length > 30 ? 0 : 3, pointHoverRadius: 5,
      pointBackgroundColor: equityData.values[equityData.values.length - 1] >= baseBalance ? '#20c997' : '#ff6b6b',
      fill: true,
      backgroundColor: (ctx) => {
        const c = ctx.chart.ctx
        const g = c.createLinearGradient(0, 0, 0, 180)
        const color = equityData.values[equityData.values.length - 1] >= baseBalance ? '#20c997' : '#ff6b6b'
        g.addColorStop(0, color + '30'); g.addColorStop(1, color + '00')
        return g
      },
      tension: 0.4
    }]
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isLightMode ? '#ffffff' : '#1a2535',
        borderColor: equityData.values[equityData.values.length - 1] >= startingBalance ? '#20c997' : '#ff6b6b',
        borderWidth: 1, titleColor: isLightMode ? '#1a2236' : '#e5e7eb',
        bodyColor: equityData.values[equityData.values.length - 1] >= startingBalance ? '#20c997' : '#ff6b6b',
        padding: 10, callbacks: { label: ctx => ` $${ctx.parsed.y.toFixed(2)}` }
      }
    },
    scales: {
      x: {
        grid: { color: isLightMode ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)' },
        ticks: { color: isLightMode ? '#8896aa' : '#6f7d8c', font: { size: 10, family: 'Consolas,monospace' }, maxTicksLimit: 8 }
      },
      y: {
        grid: { color: isLightMode ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)' },
        ticks: { color: isLightMode ? '#8896aa' : '#6f7d8c', font: { size: 10, family: 'Consolas,monospace' }, callback: v => '$' + v.toFixed(0) }
      }
    }
  }

  // FIX: computed once, not called twice in JSX
  const weeklySummary = getWeeklySummary()

  return (
    <div className="app-container">
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {showOnboarding && (
        <div className="onboard-wrap">
          <div className="onboard-card">
            <div className="onboard-icon">📈</div>
            <div className="onboard-title">Welcome to Gold Journal</div>
            <div className="onboard-sub">Your personal XAUUSD trading journal</div>
            <div className="field">
              <label>Starting balance ($)</label>
              <input type="number" id="onboard-wallet" placeholder="1000.00" step="0.01" />
            </div>
            <button className="onboard-btn" onClick={completeOnboarding}>Start journaling</button>
            <div className="onboard-skip" onClick={dismissOnboarding}>Skip</div>
          </div>
        </div>
      )}

      <div className="min-h-full">
        {/* Modern Dashboard Navigation */}
        <Disclosure as="nav" className="bg-gray-800/50 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0 flex items-center gap-2">
                  <div className="size-8 bg-gold rounded-lg flex items-center justify-center font-bold text-gray-900">G</div>
                  <span className="text-white font-bold hidden sm:block">GOLD JOURNAL</span>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={classNames(
                          activeTab === item.id
                            ? 'bg-gray-950/50 text-gold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium transition-all'
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6 gap-4">
                  {/* Theme Toggle Button */}
                  <button onClick={toggleTheme} className="theme-btn text-gray-400 hover:text-white p-2 rounded-lg transition-all">
                    {theme === 'dark' ? '☀' : '🌙'}
                  </button>
                  
                  <span className="text-xs text-gray-400 font-mono">
                    {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 rounded-md transition-all" onClick={() => setShowPricingModal(true)}>
                    Upgrade
                  </button>
                  
                  <button onClick={() => signOut(auth)} className="text-sm text-gray-400 hover:text-white">
                    Sign out
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                  <Bars3Icon className="block size-6 group-data-[open]:hidden" />
                  <XMarkIcon className="hidden size-6 group-data-[open]:block" />
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Panel */}
          <Disclosure.Panel className="md:hidden bg-gray-900 border-b border-white/10">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.id}
                  as="button"
                  onClick={() => setActiveTab(item.id)}
                  className={classNames(
                    activeTab === item.id ? 'bg-gray-950/50 text-gold' : 'text-gray-300 hover:bg-white/5',
                    'block w-full text-left rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <button onClick={() => signOut(auth)} className="block w-full text-left text-gray-400 px-3 py-2 text-base font-medium">
                Sign out
              </button>
            </div>
          </Disclosure.Panel>
        </Disclosure>

        {/* Dynamic Header */}
        <header className="relative">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white capitalize">
              {activeTab.replace(/^\w/, c => c.toUpperCase())} Dashboard
            </h1>
          </div>
        </header>

        {/* ← ADD THIS */}
        {loadError && (
          <div style={{
            background: '#ff6b6b22', border: '1px solid #ff6b6b',
            color: '#ff6b6b', padding: '10px 16px', borderRadius: '8px',
            margin: '10px 0', fontSize: '13px'
          }}>
            ⚠️ Failed to load trades: {loadError}
          </div>
        )}

{activeTab === 'log' && (
          <div id="tab-log" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            {weeklySummary && (
              <div className="weekly-card">
                <div className="weekly-left">
                  <div className="weekly-label">Last 7 days</div>
                  <div className="weekly-title">{weeklySummary.title}</div>
                  <div className="weekly-sub">{weeklySummary.sub}</div>
                </div>
                <div className="weekly-stats">
                  <div className="weekly-stat">
                    <div className="weekly-stat-val" style={{ color: weeklySummary.pnl >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                      {weeklySummary.pnl >= 0 ? '+' : ''}${Math.abs(weeklySummary.pnl).toFixed(2)}
                    </div>
                    <div className="weekly-stat-lbl">P&L</div>
                  </div>
                  <div className="weekly-stat">
                    <div className="weekly-stat-val" style={{ color: weeklySummary.wr >= 50 ? 'var(--win)' : 'var(--loss)' }}>
                      {weeklySummary.wr}%
                    </div>
                    <div className="weekly-stat-lbl">Win rate</div>
                  </div>
                  <div className="weekly-stat">
                    <div className="weekly-stat-val">{weeklySummary.count}</div>
                    <div className="weekly-stat-lbl">Trades</div>
                  </div>
                </div>
              </div>
            )}

            <div className="stats-row">
              <div className="stat">
                <div className="stat-lbl">Starting Wallet</div>
                <div className="stat-val">${startingBalance.toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat-lbl">Total P&L</div>
                <div className="stat-val gold">${trades.reduce((s, t) => s + t.pnl, 0).toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat-lbl">Win Rate</div>
                <div className="stat-val">{trades.length ? Math.round(trades.filter(t => t.outcome === 'WIN').length / trades.length * 100) : 0}%</div>
              </div>
              <div className="stat">
                <div className="stat-lbl">Trades</div>
                <div className="stat-val">{trades.length}</div>
              </div>
            </div>

              <LogTradeTab
                   plan={plan}direction={direction} setDirection={setDirection}
                   onSaveTrade={saveTrade} calcPnl={calcPnl}
                   onUpgrade={() => setShowPricingModal(true)} todayStr={todayStr}
                  saving={saving}
               />

            <div className="card">
              <div className="equity-header">
                <div className="card-title" style={{ margin: 0 }}>Equity curve</div>
                <div className="equity-periods">
                  <button className={`equity-period-btn ${equityPeriod === 'all' ? 'active' : ''}`} onClick={() => setEquityPeriod('all')}>All</button>
                  <button className={`equity-period-btn ${equityPeriod === '3m' ? 'active' : ''}`} onClick={() => setEquityPeriod('3m')}>3M</button>
                  <button className={`equity-period-btn ${equityPeriod === '1m' ? 'active' : ''}`} onClick={() => setEquityPeriod('1m')}>1M</button>
                  <button className={`equity-period-btn ${equityPeriod === '1w' ? 'active' : ''}`} onClick={() => setEquityPeriod('1w')}>1W</button>
                </div>
              </div>
              <div className="equity-canvas-wrap">
                {trades.length > 0
                  ? <Line data={chartData} options={chartOptions} />
                  : <div className="equity-empty">📊 Log your first trade to see your equity curve</div>
                }
              </div>
              {/* FIX: trades.length > 0 prevents rendering stray "0" when empty */}
              {trades.length > 0 && (
                <div className="equity-summary">
                  <div className="equity-sum-item">
                    <div className="equity-sum-lbl">Total return</div>
                    <div className={`equity-sum-val ${totalPnl >= 0 ? 'pos' : 'neg'}`}>
                      {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toFixed(2)}
                    </div>
                  </div>
                  <div className="equity-sum-item">
                    <div className="equity-sum-lbl">Peak balance</div>
                    <div className="equity-sum-val pos">${peakVal.toFixed(2)}</div>
                  </div>
                  <div className="equity-sum-item">
                    <div className="equity-sum-lbl">Lowest point</div>
                    <div className="equity-sum-val">${troughVal.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          // FIX: filterSetup + setFilterSetup were missing from props
          <HistoryTab
            trades={trades} onDeleteTrade={deleteTrade}
            filterSearch={filterSearch} setFilterSearch={setFilterSearch}
            filterDir={filterDir} setFilterDir={setFilterDir}
            filterOutcome={filterOutcome} setFilterOutcome={setFilterOutcome}
            filterSession={filterSession} setFilterSession={setFilterSession}
            filterSetup={filterSetup} setFilterSetup={setFilterSetup}
            filterSort={filterSort} setFilterSort={setFilterSort}
            onExportCSV={exportCSV} onOpenEditModal={openEditModal}
          />
        )}

        {activeTab === 'calendar' && <CalendarTab trades={trades} />}

        {activeTab === 'analytics' && <AnalyticsTab trades={trades} startingBalance={startingBalance} />}

        {activeTab === 'journal' && (
          <JournalTab
            journals={journals} journalDate={journalDate} setJournalDate={setJournalDate}
            journalText={journalText} setJournalText={setJournalText}
            selectedMood={selectedMood} setSelectedMood={setSelectedMood}
            saveJournal={saveJournal} deleteJournalEntry={deleteJournalEntry}
            journalSaved={journalSaved}
          />
        )}

        {showPricingModal && (
          <div className="modal-wrap" onClick={e => e.target.className === 'modal-wrap' && setShowPricingModal(false)}>
            <div className="modal-card wide">
              <div className="modal-head">
                <h3>Upgrade to Pro</h3>
                <button className="modal-close" onClick={() => setShowPricingModal(false)}>×</button>
              </div>
              <div className="pricing-grid">
                <div className="price-card">
                  <div className="price-name">Free</div>
                  <div className="price-cost">$0/mo</div>
                  <ul className="price-list">
                    <li>Up to 5 trades</li>
                    <li>Up to 10 journal entries</li>
                  </ul>
                </div>
                <div className="price-card featured">
                  <div className="price-badge">Most Popular</div>
                  <div className="price-name">Pro</div>
                  <div className="price-cost">$9/mo</div>
                  <ul className="price-list">
                    <li>Unlimited everything</li>
                    <li>Advanced analytics</li>
                    <li>CSV export</li>
                  </ul>
                  <button className="sub-cta full">Upgrade Monthly</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingTrade && (
          <div className="modal-wrap" onClick={e => e.target.className === 'modal-wrap' && closeEditModal()}>
            <div className="modal-card">
              <div className="modal-head">
                <h3>Edit trade</h3>
                <button className="modal-close" onClick={closeEditModal}>×</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveEdit() }}>
                <div className="field-row r2">
                  <div className="field">
                    <label>Date</label>
                    <input type="date" value={editForm.date} onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))} />
                  </div>
                </div>
                <div className="field-row r2">
                  <div className="field">
                    <label>Entry</label>
                    <input type="number" value={editForm.entry} step="0.01" onChange={e => setEditForm(prev => ({ ...prev, entry: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Exit</label>
                    <input type="number" value={editForm.exit} step="0.01" onChange={e => setEditForm(prev => ({ ...prev, exit: e.target.value }))} />
                  </div>
                </div>
                <div className="field-row r2">
                  <div className="field">
                    <label>Lots</label>
                    <input type="number" value={editForm.lots} step="0.01" onChange={e => setEditForm(prev => ({ ...prev, lots: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Amount ($)</label>
                    <input type="number" value={editForm.amount} step="0.01" onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))} />
                  </div>
                </div>
                <div className="field-row r2">
                  <div className="field">
                    <label>SL</label>
                    <input type="number" value={editForm.sl} step="0.01" onChange={e => setEditForm(prev => ({ ...prev, sl: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>TP</label>
                    <input type="number" value={editForm.tp} step="0.01" onChange={e => setEditForm(prev => ({ ...prev, tp: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label>Notes</label>
                  <textarea value={editForm.note} onChange={e => setEditForm(prev => ({ ...prev, note: e.target.value }))}></textarea>
                </div>
                <button type="submit" className="submit-btn">Save changes</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* =============================================================================
   AUTH WRAPPER
============================================================================= */
function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#e5e7eb' }}>
        Loading...
      </div>
    )
  }

  if (!user) return <Login />
  return <TradingApp user={user} />
}

export default App