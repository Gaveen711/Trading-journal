/* ————————————————————————————————————————————————————————————
   The showcase dataset: the public site's sample record, expanded into
   the documents the real dashboard reads.

   Every trade below is `DEMO_TRADES` from src/lib/deskDemo.js with a
   date, prices, size, a stop and a note put on it. P&L is exactly
   `r × RISK_PER_R`, so the win rate, expectancy and session split the
   dashboard renders are the same figures the landing page derives from
   the same record — nothing is hand-typed twice.

   Dates are anchored, not relative: day 40 of the record is Friday
   2026-08-21, so `npm run shots` produces the same pixels on any day
   (the capture script pins the clock to DEMO_NOW to match).
   ———————————————————————————————————————————————————————————— */

import { DEMO_TRADES } from '../lib/deskDemo.js';
import { computePips, outcomeForPnl, XAUUSD_OZ_PER_LOT } from '../lib/goldContract.js';
import { resolveSessionAt, SESSION_ENGINE_VERSION } from '../lib/sessionEngine.js';
import { slugifySetupName } from '../lib/tradeAnalytics.js';

export const DEMO_UID = 'showcase-demo';
export const DEMO_EMAIL = 'demo@xaujournal.com';
export const DEMO_DISPLAY_NAME = 'Demo desk';

/** The instant the captures are taken at: Friday, London still open, NY mid-session. */
export const DEMO_NOW = '2026-08-21T15:45:00.000Z';

/** Starting balance and the fixed dollar risk behind one R. */
export const START_BALANCE = 25000;
export const RISK_PER_R = 250;

const DAY_MS = 86_400_000;
const ANCHOR_DAY = 40;
const ANCHOR_UTC = Date.UTC(2026, 7, 21);
const BROKER_ACCOUNT_ID = 'showcase-icm-5104';
const BROKER_SERVER = 'ICMarketsSC-Live';

/** The record skips weekends in its own numbering, so a day offset is a calendar offset. */
const dateForDay = (day) => new Date(ANCHOR_UTC - (ANCHOR_DAY - day) * DAY_MS);
const isoDay = (date) => date.toISOString().slice(0, 10);
const round2 = (value) => Math.round(value * 100) / 100;

/** Small deterministic hash so the same record always dresses the same way. */
const pick = (list, ...seeds) => list[seeds.reduce((acc, seed) => (acc * 31 + seed) % 9973, 7) % list.length];

/**
 * The eight seeded setups, mirrored from SETUP_SEEDS in useSetups.js
 * (importing that module would drag Firebase in here). Same rule for the
 * ids: `default_` + the slug of the legacy `strategy` value.
 */
const SEED_DEFINITIONS = [
  ['Breakout', 'Breakout'],
  ['SMC', 'SMC'],
  ['ICT', 'ICT'],
  ['Scalp', 'Scalp'],
  ['Swing', 'Swing'],
  ['S/R Bounce', 'S/R'],
  ['Liquidity sweep', null],
  ['News fade', null],
];

const CREATED_AT = '2026-07-12T09:00:00.000Z';

export const DEMO_SETUPS = SEED_DEFINITIONS.map(([name, legacy], index) => {
  const slug = slugifySetupName(legacy ?? name);
  return {
    id: `default_${slug}`,
    name,
    slug,
    isDefault: true,
    archived: false,
    mergedInto: null,
    sortOrder: index,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
});

const setupByName = Object.fromEntries(DEMO_SETUPS.map((setup) => [setup.name, setup]));

/** Which setups a desk reaches for in each session — deliberately uneven. */
const SETUP_POOLS = {
  london: ['Breakout', 'Liquidity sweep', 'SMC', 'Breakout', 'S/R Bounce', 'ICT'],
  ny: ['ICT', 'Breakout', 'News fade', 'S/R Bounce', 'Scalp'],
  asia: ['Scalp', 'S/R Bounce', 'Scalp', 'SMC'],
};

/** The legacy single-hub `session` string the log form would have stored. */
const LEGACY_SESSION = {
  Sydney: 'Sydney',
  Tokyo: 'Tokyo',
  London: 'London',
  NY: 'NewYork',
  SydneyTokyo: 'Tokyo',
  TokyoLondon: 'London',
  LondonNY: 'NewYork',
};

const NOTES = {
  london: {
    win: [
      'London open drive, retest held, by the book.',
      'Swept the Asia high, reclaimed it, ran to the session high.',
      'Clean break of the 08:00 range. Partials at 1R, rest to target.',
      'Order block at the London low held to the tick.',
      'Pre-fix push faded. Short into the 10:30 fix worked.',
      'Sold the failed breakout above yesterday’s high. Patient fill.',
      'Second test of the overnight low. Took it, held it.',
    ],
    loss: [
      'Early. In before the sweep finished, stopped, then it went.',
      'Chased the open. Should have waited for the retest.',
      'Stop too tight for the spread at 08:00.',
      'Range day, no follow-through. Cut at full stop.',
      'Fought the trend after the fix. No counter-trend before 10:00.',
      'Data at 09:30 went straight through the stop. Flat before prints.',
    ],
  },
  ny: {
    win: [
      'NY continuation off the London high. Held to the close of the hour.',
      'Faded the 13:30 spike back into value. Second try paid.',
      'Pullback to VWAP after the open, ran with the London trend.',
      'Short into the NY lunch fade. Target at 15:00.',
      'Equities opened heavy, gold bid. Took the continuation.',
    ],
    loss: [
      'Late to the move. Bought the top of the NY push.',
      'Chopped in the lunch range. Size right, timing wrong.',
      'Tried to reverse the trend after the data. Stopped cleanly.',
      'Two attempts at the same level. The second was revenge. Logged it.',
      'Nothing after 15:00 is worth the risk. Proved it again.',
    ],
  },
  asia: {
    win: [
      'Tokyo range scalp, bounced off the overnight low.',
      'Sydney low held a third time. Took the bounce to mid-range.',
    ],
    loss: [
      'Asia breakout with nothing behind it. Never trust it.',
      'Range scalp against the drift. Stopped by two ticks.',
      'Low liquidity, wide spread. Should not be trading here.',
      'Tokyo open fake-out. The real move came in London.',
    ],
  },
};

const MOODS_BEFORE = ['Good', 'Neutral', 'Good', 'Excellent', 'Neutral', 'Bad'];
const CONVICTION = ['High', 'Medium', 'High', 'Medium', 'Low'];
const TIMEFRAMES = { london: ['M15', 'M5', 'M15', 'H1'], ny: ['M5', 'M15', 'M5'], asia: ['M5', 'M15'] };
const STRUCTURES = ['Trending', 'Ranging', 'Breakout', 'Reversal', 'Consolidation'];
const CONFLUENCE = ['S/R Level', 'Trend Follow', 'SMC', 'ICT', 'EMA Cross', 'News', 'Fib Level', 'Order Block', 'Liquidity'];

/**
 * Slow grind higher over the quarter with a little daily noise — real-looking,
 * not modelled. The base sits just under where spot gold printed when these
 * captures were first taken (the dashboard's market strip is live), so the
 * recent-activity table and the live chart read as the same market.
 */
function entryPriceFor(day, hour) {
  const drift = (day - 1) * 2.6;
  const wave = 14 * Math.sin(day * 0.9) + 6 * Math.cos(day * 2.3 + hour);
  const intraday = (hour - 9) * 1.4;
  return round2(4478 + drift + wave + intraday);
}

/**
 * One trade from one sample row. Prices and size are chosen so that
 * |entry − sl| × lots × 100 is exactly RISK_PER_R and exit lands exactly r
 * stops away — so the stored P&L, the realised R the session table derives
 * from the stop, and the landing page's R all agree to the cent.
 */
function buildTrade(sample, index) {
  const { day, hour, session, r } = sample;
  const date = dateForDay(day);
  const dayKey = isoDay(date);
  const isWin = r > 0;
  const direction = pick(['BUY', 'BUY', 'SELL', 'BUY', 'SELL'], day, hour, 3) ;
  const sign = direction === 'BUY' ? 1 : -1;
  const lots = pick([0.5, 1, 0.5, 0.5, 1], day, hour, 11);
  const stopDistance = round2(2.5 / lots);

  const entry = entryPriceFor(day, hour);
  const exit = round2(entry + sign * r * stopDistance);
  const sl = round2(entry - sign * stopDistance);
  const plannedR = isWin ? Math.max(r, 1) : pick([2, 2.5, 3, 2], day, hour, 5);
  const tp = round2(entry + sign * plannedR * stopDistance);
  const diff = round2(sign * (exit - entry));
  const pnl = round2(diff * lots * XAUUSD_OZ_PER_LOT);

  const openMinute = pick([4, 12, 18, 25, 33, 41, 47, 52], day, hour, 13);
  const holdMinutes = session === 'asia'
    ? pick([38, 55, 70, 95], day, hour, 17)
    : pick([45, 65, 80, 110, 140, 175], day, hour, 19);
  const openTime = new Date(date.getTime() + hour * 3_600_000 + openMinute * 60_000);
  const closeTime = new Date(openTime.getTime() + holdMinutes * 60_000);
  const openIso = openTime.toISOString();
  const closeIso = closeTime.toISOString();
  const resolved = resolveSessionAt(openTime);

  const setup = setupByName[pick(SETUP_POOLS[session], day, hour, 23)];
  const noteBank = NOTES[session][isWin ? 'win' : 'loss'];
  const hasNote = pick([true, true, true, true, false], day, hour, 29);
  const structure = isWin
    ? pick(['Trending', 'Breakout', 'Trending', 'Reversal'], day, hour, 31)
    : pick(STRUCTURES, day, hour, 31);

  return {
    id: `showcase-trade-${String(index + 1).padStart(3, '0')}`,
    date: dayKey,
    direction,
    type: direction.toLowerCase(),
    market: 'GOLD',
    symbol: 'XAUUSD',
    entry,
    exit,
    openPrice: entry,
    closePrice: exit,
    lots,
    sl,
    tp,
    rr: round2(plannedR),
    pips: computePips(diff),
    pnl,
    netPnl: pnl,
    commission: 0,
    swap: 0,
    outcome: outcomeForPnl(pnl),
    status: 'closed',
    source: 'BROKER_METAAPI',
    brokerType: 'mt5',
    brokerServer: BROKER_SERVER,
    accountId: BROKER_ACCOUNT_ID,
    openTime: openIso,
    closeTime: closeIso,
    timestamp: openIso,
    entryTimestampUtc: openIso,
    sessionCode: resolved?.code ?? null,
    sessionSource: 'broker',
    sessionEngineVersion: SESSION_ENGINE_VERSION,
    sessionResolvedAt: closeIso,
    session: LEGACY_SESSION[resolved?.code] ?? '',
    setupId: setup.id,
    strategy: setup.name,
    note: hasNote ? pick(noteBank, day, hour, 37) : '',
    riskPercent: 1,
    maxDailyLoss: null,
    autoRR: null,
    preTradeMood: pick(MOODS_BEFORE, day, hour, 41),
    confidence: pick([6, 7, 8, 7, 9, 5], day, hour, 43),
    conviction: pick(CONVICTION, day, hour, 47),
    postReflect: '',
    timeframe: pick(TIMEFRAMES[session], day, hour, 53),
    setupGrade: isWin ? pick(['A+', 'A', 'A', 'B'], day, hour, 59) : pick(['B', 'C', 'A', 'B'], day, hour, 59),
    marketStructure: [structure],
    confluenceFactors: [pick(CONFLUENCE, day, hour, 61), pick(CONFLUENCE, day, hour, 67)].filter(
      (factor, position, list) => list.indexOf(factor) === position,
    ),
    screenshots: [],
    syncedAt: closeIso,
    createdAt: closeIso,
    updatedAt: closeIso,
  };
}

/** Newest first, the order the trade listener delivers in. */
export const DEMO_TRADE_DOCS = DEMO_TRADES
  .map(buildTrade)
  .sort((a, b) => (a.date === b.date ? b.openTime.localeCompare(a.openTime) : b.date.localeCompare(a.date)));

export const DEMO_NET_PNL = round2(DEMO_TRADE_DOCS.reduce((sum, trade) => sum + trade.pnl, 0));

/** Keyed by ISO day; `mood` is the journal's 1–5 scale. */
export const DEMO_JOURNALS = {
  '2026-08-21': {
    mood: 5,
    text: 'Good close to the week. London open drive was textbook: waited for the retest and let it run. NY continuation paid as well. Two trades, two wins, done by 15:00.\n\nBoth came in the first hour of their session. Nothing after 15:00 all week was worth the risk.',
  },
  '2026-08-20': {
    mood: 2,
    text: 'Two losses, both late. The 11:00 London trade was a range day and I knew it by 10:00. The 16:00 NY trade was boredom.\n\nRule for tomorrow: nothing after 15:00 UTC.',
  },
  '2026-08-19': {
    mood: 4,
    text: 'The 03:00 Asia scalp is a mistake I keep repeating. Low liquidity, wide spread, no edge. London made up for it: swept the Asia high, reclaimed, ran 2.5R.\n\nThe numbers say the same thing every month. The edge is London, the bleed is Asia.',
  },
  '2026-08-18': {
    mood: 3,
    text: 'Stopped early in London before the move went. Took the second entry at the NY open instead, 1.7R. Patience in the second half of the day.',
  },
  '2026-08-17': {
    mood: 4,
    text: 'Monday. Skipped nothing I should have skipped, except Asia again. London order block at 08:00 held to the tick.',
  },
  '2026-08-14': {
    mood: 4,
    text: 'Solid London. Gave a third of it back at 14:00 chasing the NY push. Week closed green regardless.\n\nWeekend: review the 14:00 to 16:00 NY window. It keeps costing.',
  },
  '2026-08-13': {
    mood: 3,
    text: 'Small Tokyo scalp worked, London did not. Entered the breakout without the retest and paid for it. Nothing wrong with the read, everything wrong with the entry.',
  },
  '2026-08-12': {
    mood: 3,
    text: 'Lost the London trade to a tight stop around the 09:30 print. NY pullback was clean. Net small green.',
  },
  '2026-08-11': {
    mood: 4,
    text: 'Best London trade of the month: clean break of the 08:00 range, partials at 1R, rest to 2.9R. Then gave one R back at the NY open trying to do it twice.',
  },
};

export const DEMO_BROKER_ACCOUNTS = [
  {
    id: BROKER_ACCOUNT_ID,
    accountName: 'IC Markets — Live',
    brokerType: 'mt5',
    platform: 'mt5',
    server: BROKER_SERVER,
    login: '5104••••',
    isActive: true,
    managedByWorker: true,
    syncJobState: 'idle',
    lastSyncTime: '2026-08-21T15:42:00.000Z',
    lastSyncStatus: 'success',
    lastSyncError: null,
    tradeCount: DEMO_TRADE_DOCS.length,
    createdAt: CREATED_AT,
    updatedAt: '2026-08-21T15:42:00.000Z',
  },
];

/** users/{uid}: plan, consent, wallet and the counters the layout reads. */
export const DEMO_USER_DOC = {
  email: DEMO_EMAIL,
  displayName: DEMO_DISPLAY_NAME,
  firstName: 'Demo',
  lastName: 'Desk',
  country: 'GB',
  createdAt: CREATED_AT,
  updatedAt: DEMO_NOW,
  plan: 'pro',
  planExpiry: '2027-08-12T00:00:00.000Z',
  isTrial: false,
  agreedToTerms: true,
  agreedAt: CREATED_AT,
  proLegalAccepted: true,
  proLegalAcceptedAt: CREATED_AT,
  proLegalVersion: '1.0.4',
  refundPolicyAcknowledged: true,
  walletBalance: START_BALANCE,
  monthlyGoal: 2500,
  totalTradesLogged: DEMO_TRADE_DOCS.length,
  totalJournalsLogged: Object.keys(DEMO_JOURNALS).length,
  lastTradeTime: DEMO_TRADE_DOCS[0].closeTime,
  mt5SyncEnabled: true,
  lastBrokerSync: '2026-08-21T15:42:00.000Z',
  lastBrokerSyncStatus: 'success',
  lastBrokerSyncCount: DEMO_TRADE_DOCS.length,
};

export const DEMO_DATASET = Object.freeze({
  uid: DEMO_UID,
  user: DEMO_USER_DOC,
  trades: DEMO_TRADE_DOCS,
  journals: DEMO_JOURNALS,
  setups: DEMO_SETUPS,
  brokerAccounts: DEMO_BROKER_ACCOUNTS,
});
