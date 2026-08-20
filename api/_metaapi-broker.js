// MetaApi.cloud — MT4/MT5 broker login & deal history (server-side only)

import MetaApi from 'metaapi.cloud-sdk/esm-node';
import { computePips, outcomeForPnl, isGoldSymbol } from '../src/lib/goldContract.js';
// sessionEngine.js, not goldSessions.js — goldSessions.js imports React.
import { SESSION_ENGINE_VERSION, resolveSessionAt } from '../src/lib/sessionEngine.js';

let apiClient = null;

function getApi() {
  const token = process.env.METAAPI_TOKEN;
  if (!token) {
    throw new Error('Broker sync is not configured (METAAPI_TOKEN missing on server).');
  }
  if (!apiClient) apiClient = new MetaApi(token);
  return apiClient;
}

/** Map MetaApi deal → xaujournal trade document */
const finiteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const validDate = (value, fallback = new Date()) => {
  const parsed = value ? new Date(value) : fallback;
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const isBuyDeal = (deal) => String(deal?.type || '').toUpperCase() === 'DEAL_TYPE_BUY';
const isTradeDeal = (deal) => ['DEAL_TYPE_BUY', 'DEAL_TYPE_SELL'].includes(String(deal?.type || '').toUpperCase());

function normalizeDeal(deal, ctx, entryDeal = null) {
  const isBuy = entryDeal ? isBuyDeal(entryDeal) : !isBuyDeal(deal);
  const closeTime = validDate(deal.time);
  const price = finiteNumber(deal.price ?? deal.closePrice);
  const volume = finiteNumber(deal.volume ?? deal.lots);
  const profit = finiteNumber(deal.profit ?? deal.pnl);
  const commission = finiteNumber(deal.commission);
  const swap = finiteNumber(deal.swap);
  const netPnl = profit + commission + swap;
  const positionId = String(deal.positionId ?? deal.position ?? deal.id ?? deal.ticket ?? closeTime.getTime());
  const ticket = String(deal.id ?? deal.ticket ?? deal.dealId ?? `${positionId}_${closeTime.getTime()}`);
  const rawOpenPrice = entryDeal?.price ?? deal.openPrice;
  const openPrice = rawOpenPrice == null ? null : finiteNumber(rawOpenPrice, null);
  const openTime = entryDeal?.time
    ? validDate(entryDeal.time, closeTime).toISOString()
    : deal.openTime
      ? validDate(deal.openTime, closeTime).toISOString()
      : null;
  const diff = openPrice == null ? null : (isBuy ? price - openPrice : openPrice - price);
  // Gold pip math only applies to gold: a EURUSD deal on the same account
  // used to get pips wrong by orders of magnitude.
  const pips = diff == null || !isGoldSymbol(deal.symbol || 'XAUUSD') ? null : computePips(diff);
  // Canonical entry instant (§2.2): openTime, falling back to closeTime for
  // MT4 deals that carry no entry. sessionCode stays in the rules enum-or-null;
  // 'Unknown' is an analytics bucket and is never stored on a document.
  // sessionResolvedAt is stamped by persistBrokerTrades — no timestamp factory here.
  const entryTimestampUtc = openTime ?? closeTime.toISOString();
  const sessionCode = resolveSessionAt(entryTimestampUtc)?.code ?? null;

  return {
    positionId,
    closeDealTicket: ticket,
    symbol: deal.symbol || 'XAUUSD',
    direction: isBuy ? 'BUY' : 'SELL',
    type: isBuy ? 'buy' : 'sell',
    lots: volume,
    closePrice: price,
    openPrice,
    closeTime: closeTime.toISOString(),
    openTime,
    date: closeTime.toISOString().split('T')[0],
    pnl: profit,
    commission,
    swap,
    netPnl,
    pips,
    status: 'closed',
    source: 'BROKER_METAAPI',
    brokerType: ctx.brokerType,
    brokerServer: ctx.server,
    market: 'GOLD',
    outcome: outcomeForPnl(netPnl),
    entryTimestampUtc,
    sessionCode,
    sessionSource: 'broker',
    sessionEngineVersion: SESSION_ENGINE_VERSION,
  };
}

const combineEntryDeals = (previous, next) => {
  if (!previous || isBuyDeal(previous) !== isBuyDeal(next)) return next;
  const previousVolume = finiteNumber(previous.volume);
  const nextVolume = finiteNumber(next.volume);
  const totalVolume = previousVolume + nextVolume;
  if (totalVolume <= 0) return next;
  return {
    ...next,
    price: ((finiteNumber(previous.price) * previousVolume) + (finiteNumber(next.price) * nextVolume)) / totalVolume,
    volume: totalVolume,
    time: previous.time || next.time,
  };
};

export function normalizeMetaApiDeals(deals, ctx) {
  const entries = new Map();
  const normalized = [];
  const sortedDeals = [...(Array.isArray(deals) ? deals : [])]
    .sort((a, b) => validDate(a.time, new Date(0)) - validDate(b.time, new Date(0)));

  for (const deal of sortedDeals) {
    if (!isTradeDeal(deal)) continue;
    const entryType = String(deal.entryType || '').toUpperCase();
    const positionKey = String(deal.positionId ?? deal.position ?? deal.id ?? deal.ticket ?? '');
    const previousEntry = entries.get(positionKey) || null;

    if (entryType === 'DEAL_ENTRY_IN') {
      entries.set(positionKey, combineEntryDeals(previousEntry, deal));
      continue;
    }

    if (!entryType || ['DEAL_ENTRY_OUT', 'DEAL_ENTRY_OUT_BY', 'DEAL_ENTRY_INOUT'].includes(entryType)) {
      normalized.push(normalizeDeal(deal, ctx, previousEntry));
    } else {
      continue;
    }

    if (entryType === 'DEAL_ENTRY_INOUT') {
      entries.set(positionKey, deal);
    } else if (previousEntry) {
      const remainingVolume = finiteNumber(previousEntry.volume) - finiteNumber(deal.volume);
      if (remainingVolume > 0.0000001) entries.set(positionKey, { ...previousEntry, volume: remainingVolume });
      else entries.delete(positionKey);
    }
  }

  return normalized;
}

/**
 * Create a short-lived MetaApi account used only for the current request.
 *
 * Never reuse an existing provider account here: doing so would turn a transient
 * credential exchange into persistent provider-side access.
 */
export async function provisionMetaApiAccount({ login, password, server, brokerType }) {
  const api = getApi();
  const platform = brokerType === 'mt4' ? 'mt4' : 'mt5';
  const loginStr = String(login);

  const account = await api.metatraderAccountApi.createAccount({
    name: 'xaujournal-transient-' + Date.now(),
    type: 'cloud',
    login: loginStr,
    password,
    server,
    platform,
    magic: 0,
    application: 'MetaApi',
    reliability: 'regular',
  });

  await account.deploy();
  await account.waitConnected(300);
  return account.id;
}

/**
 * Fetch closed deals since optional fromDate.
 */
export async function fetchMetaApiDeals(metaApiAccountId, fromDate = null) {
  const api = getApi();
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId);
  await account.waitConnected(300);

  const connection = account.getRPCConnection();
  await connection.connect();
  try {
    await connection.waitSynchronized();

    const start = fromDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = new Date();
    const deals = await connection.getDealsByTimeRange(start, end);

    const ctx = {
      brokerType: account.platform,
      server: account.server,
    };

    const rawDeals = Array.isArray(deals) ? deals : deals?.deals ?? [];
    return normalizeMetaApiDeals(rawDeals, ctx);
  } finally {
    try {
      await connection.close();
    } catch {
      // The sync result is still usable if provider-side cleanup fails.
    }
  }
}

export async function fetchBrokerTrades(credentials, fromDate = null) {
  const metaApiAccountId = await provisionMetaApiAccount(credentials);
  try {
    return await fetchMetaApiDeals(metaApiAccountId, fromDate);
  } finally {
    // Removing the temporary provider account destroys its stored broker secret.
    // Cleanup failures are surfaced because silent failure would violate the
    // client-managed credential policy.
    await deleteMetaApiAccount(metaApiAccountId);
  }
}

export async function deleteMetaApiAccount(metaApiAccountId) {
  const api = getApi();
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await api.metatraderAccountApi.removeAccount(metaApiAccountId);
      return;
    } catch (err) {
      lastError = err;
    }
  }
  console.error('[metaapi-cleanup] Temporary provider account removal failed');
  throw lastError || new Error('Temporary provider account removal failed');
}

