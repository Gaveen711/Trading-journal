import type { Context } from 'hono'
import {
  analyticsDeltaForTrades,
  deriveSessionStats,
  getTradeOutcome,
  getTradeSessionCode,
  getTradeSetupKey,
  isTradeAnalyticsEligible,
  SESSION_BUCKETS,
  tradePnlValue,
} from '../src/lib/tradeAnalytics.js'
import { AdminHttpError } from './_adminErrors.js'
import type { AdminDependencies } from './_admin.js'
import {
  isSettledPaymentStatus,
  normalizedPaymentStatus,
  SETTLED_PAYMENT_STATUSES,
} from './_adminPolicy.js'

const MAX_ANALYTICS_TRADES = 500
const MAX_SETUP_DOCS = 200
const MAX_PLATFORM_DOCS = 2000
const TRADE_FIELDS = [
  'date', 'direction', 'type', 'entry', 'exit', 'lots', 'pnl', 'netPnl',
  'pips', 'outcome', 'status', 'setupId', 'sessionCode', 'session',
  'entryTimestampUtc', 'openTime', 'closeTime', 'timestamp', 'source',
  'symbol', 'rr', 'swap', 'strategy', 'setup',
] as const

export type AdminDateRange = {
  fromDay: string
  toDay: string
  fromDate: Date
  toExclusive: Date
}

function record(value: unknown): Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {}
}

function number(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isoDay(value: unknown): string | null {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null
  }
  let date: Date | null = null
  if (value instanceof Date) date = value
  else if (typeof (value as any)?.toDate === 'function') date = (value as any).toDate()
  else if (typeof value === 'string' || typeof value === 'number') date = new Date(value)
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null
}

function parseDay(value: string, field: string): string {
  if (value.length > 40) throw new AdminHttpError(400, `${field} is invalid`, 'INVALID_DATE_RANGE')
  const day = isoDay(value)
  if (!day) throw new AdminHttpError(400, `${field} must be an ISO date`, 'INVALID_DATE_RANGE')
  return day
}

export function parseAdminDateRange(c: Context): AdminDateRange | null {
  const rawFrom = c.req.query('from')
  const rawTo = c.req.query('to')
  if (!rawFrom && !rawTo) return null
  if (!rawFrom || !rawTo) {
    throw new AdminHttpError(400, 'from and to must be supplied together', 'INVALID_DATE_RANGE')
  }
  const fromDay = parseDay(rawFrom, 'from')
  const toDay = parseDay(rawTo, 'to')
  const fromDate = new Date(`${fromDay}T00:00:00.000Z`)
  const toInclusive = new Date(`${toDay}T00:00:00.000Z`)
  if (fromDate > toInclusive) throw new AdminHttpError(400, 'from must not be after to', 'INVALID_DATE_RANGE')
  const days = Math.round((toInclusive.getTime() - fromDate.getTime()) / 86_400_000) + 1
  if (days > 366) throw new AdminHttpError(400, 'Date range cannot exceed 366 days', 'INVALID_DATE_RANGE')
  return { fromDay, toDay, fromDate, toExclusive: new Date(toInclusive.getTime() + 86_400_000) }
}

function scalarPublicValue(value: any): string | number | boolean | null | undefined {
  if (value === null) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  if (typeof value?.toDate === 'function') {
    const date = value.toDate()
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined
  }
  return undefined
}

function analyticsTrade(doc: any): Record<string, any> {
  const source = record(doc.data())
  const trade: Record<string, any> = { id: doc.id }
  for (const field of TRADE_FIELDS) {
    const value = scalarPublicValue(source[field])
    if (value !== undefined) trade[field] = value
  }
  if (Array.isArray(source.strategies)) {
    trade.strategies = source.strategies
      .filter((entry: unknown): entry is string => typeof entry === 'string')
      .map((entry: string) => entry.slice(0, 128))
      .slice(0, 10)
  }
  return trade
}

function recentSetupLabel(trade: Record<string, any>): string {
  for (const value of [trade.setupId, trade.setup, trade.strategy, trade.strategies?.[0]]) {
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 128)
  }
  return 'untagged'
}

function publicRecentTrade(doc: any): Record<string, any> {
  const trade = analyticsTrade(doc)
  const rawDirection = String(trade.direction || trade.type || '').toUpperCase()
  const openedAt = scalarPublicValue(trade.entryTimestampUtc ?? trade.openTime ?? trade.timestamp)
  const closedAt = scalarPublicValue(trade.closeTime ?? trade.date)
  return {
    id: trade.id,
    ...(typeof trade.symbol === 'string' ? { symbol: trade.symbol.slice(0, 32) } : {}),
    status: String(trade.status || '').toLowerCase() === 'open' ? 'open' : 'closed',
    direction: ['BUY', 'LONG'].includes(rawDirection)
      ? 'BUY'
      : ['SELL', 'SHORT'].includes(rawDirection) ? 'SELL' : 'UNKNOWN',
    outcome: getTradeOutcome(trade),
    ...(openedAt !== undefined ? { openedAt } : {}),
    ...(closedAt !== undefined ? { closedAt } : {}),
    pnl: tradePnlValue(trade),
    ...(typeof trade.pips === 'number' ? { pips: trade.pips } : {}),
    setup: recentSetupLabel(trade),
    session: getTradeSessionCode(trade),
  }
}

function cursorFingerprint(range: AdminDateRange | null): string {
  return `${range?.fromDay || ''}:${range?.toDay || ''}`
}

function encodeTradeCursor(date: string, id: string, fingerprint: string): string {
  return Buffer.from(JSON.stringify({ v: 1, date, id, fingerprint }), 'utf8').toString('base64url')
}

function decodeTradeCursor(raw: string | undefined, fingerprint: string): { date: string; id: string } | null {
  if (!raw) return null
  if (raw.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(raw)) {
    throw new AdminHttpError(400, 'Invalid pageToken', 'INVALID_PAGE_TOKEN')
  }
  try {
    const value = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (
      value?.v !== 1
      || value.fingerprint !== fingerprint
      || typeof value.date !== 'string'
      || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)
      || typeof value.id !== 'string'
      || value.id.length < 1
      || value.id.length > 128
      || /[\/\u0000-\u001f]/.test(value.id)
    ) throw new Error('invalid cursor')
    return { date: value.date, id: value.id }
  } catch {
    throw new AdminHttpError(400, 'Invalid pageToken', 'INVALID_PAGE_TOKEN')
  }
}

function tradeQuery(deps: AdminDependencies, uid: string, range: AdminDateRange | null): any {
  let query: any = deps.db.collection('users').doc(uid).collection('trades')
  if (range) {
    query = query.where('date', '>=', range.fromDay).where('date', '<=', range.toDay)
  }
  return query
    .orderBy('date', 'desc')
    .orderBy(deps.admin.firestore.FieldPath.documentId(), 'desc')
}

function aggregateSummary(trades: Record<string, any>[]) {
  const aggregate = analyticsDeltaForTrades(trades)
  const tradeCount = number(aggregate.tradeCount)
  const wins = number(aggregate.wins)
  const grossLoss = number(aggregate.grossLoss)
  return {
    tradeCount,
    totalPnl: number(aggregate.totalPnl),
    totalPips: number(aggregate.totalPips),
    wins,
    losses: number(aggregate.losses),
    breakEven: number(aggregate.breakEven),
    longs: number(aggregate.longs),
    shorts: number(aggregate.shorts),
    grossProfit: number(aggregate.grossProfit),
    grossLoss,
    winRate: tradeCount ? wins / tradeCount : null,
    profitFactor: grossLoss > 0 ? number(aggregate.grossProfit) / grossLoss : null,
    expectancy: tradeCount ? number(aggregate.totalPnl) / tradeCount : null,
  }
}

function storedSummary(value: unknown) {
  const source = record(value)
  const tradeCount = number(source.tradeCount)
  const grossLoss = number(source.grossLoss)
  return {
    tradeCount,
    totalPnl: number(source.totalPnl),
    totalPips: number(source.totalPips),
    wins: number(source.wins),
    losses: number(source.losses),
    breakEven: number(source.breakEven),
    longs: number(source.longs),
    shorts: number(source.shorts),
    grossProfit: number(source.grossProfit),
    grossLoss,
    winRate: tradeCount ? number(source.wins) / tradeCount : null,
    profitFactor: grossLoss > 0 ? number(source.grossProfit) / grossLoss : null,
    expectancy: tradeCount ? number(source.totalPnl) / tradeCount : null,
  }
}

function addBreakdownValue(target: Map<string, any>, key: string, trade: Record<string, any>): void {
  const current = target.get(key) || { key, tradeCount: 0, totalPnl: 0, wins: 0, losses: 0, breakEven: 0 }
  current.tradeCount += 1
  current.totalPnl += tradePnlValue(trade)
  const outcome = getTradeOutcome(trade)
  if (outcome === 'WIN') current.wins += 1
  else if (outcome === 'LOSS') current.losses += 1
  else current.breakEven += 1
  target.set(key, current)
}

function finishBreakdown(target: Map<string, any>, names: Map<string, string> = new Map()) {
  return [...target.values()]
    .map((entry) => ({
      ...entry,
      name: names.get(entry.key) || (entry.key === 'untagged' ? 'Untagged' : entry.key),
      winRate: entry.tradeCount ? entry.wins / entry.tradeCount : null,
      expectancy: entry.tradeCount ? entry.totalPnl / entry.tradeCount : null,
    }))
    .sort((a, b) => b.tradeCount - a.tradeCount || a.name.localeCompare(b.name))
    .slice(0, 100)
}

function timeSeries(trades: Record<string, any>[]) {
  const days = new Map<string, any>()
  trades.filter(isTradeAnalyticsEligible).forEach((trade) => {
    const day = isoDay(trade.date || trade.entryTimestampUtc || trade.timestamp)
    if (!day) return
    const current = days.get(day) || { date: day, tradeCount: 0, totalPnl: 0, wins: 0, losses: 0, breakEven: 0 }
    current.tradeCount += 1
    current.totalPnl += tradePnlValue(trade)
    const outcome = getTradeOutcome(trade)
    if (outcome === 'WIN') current.wins += 1
    else if (outcome === 'LOSS') current.losses += 1
    else current.breakEven += 1
    days.set(day, current)
  })
  let cumulativePnl = 0
  return [...days.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => {
      cumulativePnl += entry.totalPnl
      return { ...entry, cumulativePnl }
    })
    .slice(-366)
}

export async function getUserAnalytics(
  c: Context,
  deps: AdminDependencies,
  uid: string,
  pageLimit: number,
) {
  const range = parseAdminDateRange(c)
  const fingerprint = cursorFingerprint(range)
  const cursor = decodeTradeCursor(c.req.query('pageToken'), fingerprint)
  const userDoc = await deps.db.collection('users').doc(uid).get()
  const userData = userDoc.exists ? record(userDoc.data()) : {}
  const storedJournalCount = Number(userData.totalJournalsLogged)
  const hasStoredJournalCount = !range
    && Number.isInteger(storedJournalCount)
    && storedJournalCount >= 0
  let journalQuery: any = deps.db.collection('users').doc(uid).collection('journals')
  if (range) {
    journalQuery = journalQuery
      .where(deps.admin.firestore.FieldPath.documentId(), '>=', range.fromDay)
      .where(deps.admin.firestore.FieldPath.documentId(), '<=', range.toDay)
  }
  const journalCountPromise = hasStoredJournalCount
    ? Promise.resolve(null)
    : journalQuery.count().get()
  const [scanSnapshot, setupSnapshot, journalCountSnapshot] = await Promise.all([
    tradeQuery(deps, uid, range).limit(MAX_ANALYTICS_TRADES + 1).get(),
    deps.db.collection('users').doc(uid).collection('setups')
      .orderBy(deps.admin.firestore.FieldPath.documentId())
      .limit(MAX_SETUP_DOCS + 1)
      .get(),
    journalCountPromise,
  ])
  const scanDocs = scanSnapshot.docs.slice(0, MAX_ANALYTICS_TRADES)
  const scannedTrades = scanDocs.map(analyticsTrade)
  const scanPartial = scanSnapshot.docs.length > MAX_ANALYTICS_TRADES
  const setupPartial = setupSnapshot.docs.length > MAX_SETUP_DOCS
  const setupDocs = setupSnapshot.docs.slice(0, MAX_SETUP_DOCS)
  const setupsById = new Map<string, Record<string, any>>()
  const setupNames = new Map<string, string>()
  setupDocs.forEach((doc: any) => {
    const source = record(doc.data())
    const setup = {
      id: doc.id,
      name: typeof source.name === 'string' ? source.name.slice(0, 64) : doc.id,
      slug: typeof source.slug === 'string' ? source.slug.slice(0, 80) : null,
      archived: source.archived === true,
      mergedInto: typeof source.mergedInto === 'string' ? source.mergedInto : null,
      createdAt: source.createdAt,
    }
    setupsById.set(doc.id, setup)
    setupNames.set(doc.id, setup.name)
  })

  const eligibleTrades = scannedTrades.filter(isTradeAnalyticsEligible)
  const setupBuckets = new Map<string, any>()
  const sessionBuckets = new Map<string, any>()
  eligibleTrades.forEach((trade) => {
    addBreakdownValue(setupBuckets, getTradeSetupKey(trade, setupsById), trade)
    addBreakdownValue(sessionBuckets, getTradeSessionCode(trade), trade)
  })

  let recentQuery = tradeQuery(deps, uid, range)
  if (cursor) recentQuery = recentQuery.startAfter(cursor.date, cursor.id)
  const recentSnapshot = await recentQuery.limit(pageLimit + 1).get()
  const recentDocs = recentSnapshot.docs.slice(0, pageLimit)
  const lastRecent = recentDocs.at(-1)
  const nextPageToken = recentSnapshot.docs.length > pageLimit && lastRecent
    ? encodeTradeCursor(String(lastRecent.get('date')), lastRecent.id, fingerprint)
    : undefined

  const canUseStoredSummary = !range && scanPartial && Object.keys(record(userData.analytics)).length > 0
  let sessions = finishBreakdown(sessionBuckets)
  const storedSessions = record(userData.sessionAnalytics).buckets
  if (!range && scanPartial && storedSessions && typeof storedSessions === 'object') {
    sessions = SESSION_BUCKETS.map((key: string) => {
      const bucket = record(storedSessions[key])
      const stats = deriveSessionStats(bucket)
      return {
        key,
        name: key,
        tradeCount: stats.tradeCount,
        totalPnl: stats.netPnl,
        wins: number(bucket.wins),
        losses: number(bucket.losses),
        breakEven: number(bucket.breakEven),
        winRate: stats.winRate,
        expectancy: stats.expectancy,
      }
    })
      .filter((entry: any) => entry.tradeCount > 0)
      .sort((a: any, b: any) => b.tradeCount - a.tradeCount)
  }
  const partial = scanPartial || setupPartial
  const journalCount = hasStoredJournalCount
    ? storedJournalCount
    : Number(journalCountSnapshot?.data().count || 0)
  const summary = canUseStoredSummary ? storedSummary(userData.analytics) : aggregateSummary(scannedTrades)

  return {
    data: {
      summary: { ...summary, journalCount },
      timeSeries: timeSeries(scannedTrades),
      setups: finishBreakdown(setupBuckets, setupNames),
      sessions,
      recentTrades: recentDocs.map(publicRecentTrade),
      ...(nextPageToken ? { nextPageToken } : {}),
      generatedAt: new Date().toISOString(),
      freshness: {
        status: partial ? 'partial' : 'fresh',
        summarySource: canUseStoredSummary ? 'stored_user_aggregate' : 'bounded_trade_scan',
        scannedTrades: scanDocs.length,
        tradeScanLimit: MAX_ANALYTICS_TRADES,
        setupCatalogComplete: !setupPartial,
        journalCountSource: hasStoredJournalCount ? 'stored_user_aggregate' : 'firestore_count',
        range: range ? { from: range.fromDay, to: range.toDay } : null,
      },
    },
  }
}

async function boundedRangeDocs(deps: AdminDependencies, collection: string, range: AdminDateRange) {
  const snapshot = await deps.db.collection(collection)
    .where('createdAt', '>=', range.fromDate)
    .where('createdAt', '<', range.toExclusive)
    .orderBy('createdAt')
    .limit(MAX_PLATFORM_DOCS + 1)
    .get()
  return { docs: snapshot.docs.slice(0, MAX_PLATFORM_DOCS), partial: snapshot.docs.length > MAX_PLATFORM_DOCS }
}

function platformSeries(users: any[], payments: any[], reports: any[]) {
  const days = new Map<string, any>()
  const day = (value: unknown) => {
    const key = isoDay(value)
    if (!key) return null
    const current = days.get(key) || {
      date: key,
      newUsers: 0,
      payments: 0,
      settledPayments: 0,
      failedPayments: 0,
      revenue: 0,
      openedReports: 0,
      resolvedReports: 0,
    }
    days.set(key, current)
    return current
  }
  users.forEach((doc) => { const row = day(doc.get('createdAt')); if (row) row.newUsers += 1 })
  payments.forEach((doc) => {
    const row = day(doc.get('createdAt'))
    if (!row) return
    row.payments += 1
    if (isSettledPaymentStatus(doc.get('status'))) {
      row.settledPayments += 1
      row.revenue += number(doc.get('amount'))
    }
    if (normalizedPaymentStatus(doc.get('status')) === 'failed') row.failedPayments += 1
  })
  reports.forEach((doc) => {
    const row = day(doc.get('createdAt'))
    if (!row) return
    row.openedReports += 1
    if (String(doc.get('status') || '').toLowerCase() === 'resolved') row.resolvedReports += 1
  })
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export async function getPlatformAnalytics(c: Context, deps: AdminDependencies) {
  const range = parseAdminDateRange(c)
  if (!range) {
    const users = deps.db.collection('users')
    const payments = deps.db.collection('payments')
    const reports = deps.db.collection('reports')
    const settledPayments = payments.where('status', 'in', SETTLED_PAYMENT_STATUSES)
    const aggregateField = deps.admin.firestore.AggregateField
    const revenuePromise = aggregateField?.sum && typeof settledPayments.aggregate === 'function'
      ? settledPayments.aggregate({ total: aggregateField.sum('amount') }).get()
      : Promise.resolve(null)
    const count = async (query: any) => Number((await query.count().get()).data().count || 0)
    const [usersTotal, free, pro, grace, paymentsTotal, paymentsSettled, paymentsFailed, reportsOpen, reportsResolved, revenueSnapshot] = await Promise.all([
      count(users), count(users.where('plan', '==', 'free')), count(users.where('plan', '==', 'pro')),
      count(users.where('plan', '==', 'grace')), count(payments), count(settledPayments),
      count(payments.where('status', '==', 'failed')), count(reports.where('status', '==', 'open')),
      count(reports.where('status', '==', 'resolved')), revenuePromise,
    ])
    const revenueValue = revenueSnapshot?.data?.().total
    return { data: {
      users: { total: usersTotal, free, pro, grace },
      payments: { total: paymentsTotal, settled: paymentsSettled, failed: paymentsFailed, revenue: Number.isFinite(revenueValue) ? revenueValue : null },
      reports: { open: reportsOpen, resolved: reportsResolved },
      timeSeries: [],
      range: null,
      generatedAt: new Date().toISOString(),
      freshness: { status: 'fresh', semantics: 'all_time_aggregates' },
    } }
  }

  const [userResult, paymentResult, reportResult] = await Promise.all([
    boundedRangeDocs(deps, 'users', range),
    boundedRangeDocs(deps, 'payments', range),
    boundedRangeDocs(deps, 'reports', range),
  ])
  const plans = { free: 0, pro: 0, grace: 0 }
  userResult.docs.forEach((doc: any) => {
    const plan = String(doc.get('plan') || 'free').toLowerCase()
    if (Object.prototype.hasOwnProperty.call(plans, plan)) plans[plan as keyof typeof plans] += 1
  })
  let settled = 0
  let failed = 0
  let revenue = 0
  paymentResult.docs.forEach((doc: any) => {
    const status = normalizedPaymentStatus(doc.get('status'))
    if (isSettledPaymentStatus(status)) {
      settled += 1
      revenue += number(doc.get('amount'))
    }
    if (status === 'failed') failed += 1
  })
  let open = 0
  let resolved = 0
  reportResult.docs.forEach((doc: any) => {
    const status = String(doc.get('status') || '').toLowerCase()
    if (status === 'open') open += 1
    if (status === 'resolved') resolved += 1
  })
  const partial = userResult.partial || paymentResult.partial || reportResult.partial
  return { data: {
    users: { total: userResult.docs.length, ...plans },
    payments: { total: paymentResult.docs.length, settled, failed, revenue },
    reports: { open, resolved },
    timeSeries: platformSeries(userResult.docs, paymentResult.docs, reportResult.docs),
    range: { from: range.fromDay, to: range.toDay, timezone: 'UTC', field: 'createdAt' },
    generatedAt: new Date().toISOString(),
    freshness: {
      status: partial ? 'partial' : 'fresh',
      scanLimitPerCollection: MAX_PLATFORM_DOCS,
      sampled: { users: userResult.docs.length, payments: paymentResult.docs.length, reports: reportResult.docs.length },
    },
  } }
}
