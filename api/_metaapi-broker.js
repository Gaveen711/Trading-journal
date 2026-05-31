// MetaApi.cloud — MT4/MT5 broker login & deal history (server-side only)

const MetaApi = require('metaapi.cloud-sdk');

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
function normalizeDeal(deal, ctx) {
  const type = String(deal.type || '').toLowerCase();
  const isBuy = type.includes('buy') || deal.type === 'DEAL_TYPE_BUY';
  const closeTime = deal.time ? new Date(deal.time) : new Date();
  const price = Number(deal.price ?? deal.closePrice ?? 0);
  const volume = Number(deal.volume ?? deal.lots ?? 0);
  const profit = Number(deal.profit ?? deal.pnl ?? 0);
  const commission = Number(deal.commission ?? 0);
  const swap = Number(deal.swap ?? 0);
  const netPnl = profit + commission + swap;
  const ticket = String(deal.id ?? deal.ticket ?? deal.dealId ?? `${closeTime.getTime()}`);
  const openPrice = Number(deal.openPrice ?? price);
  const diff = isBuy ? price - openPrice : openPrice - price;
  const pips = Math.round(diff / 0.1);

  return {
    positionId: String(deal.positionId ?? deal.position ?? ticket),
    closeDealTicket: ticket,
    symbol: deal.symbol || 'XAUUSD',
    direction: isBuy ? 'buy' : 'sell',
    lots: volume,
    closePrice: price,
    openPrice,
    closeTime: closeTime.toISOString(),
    openTime: deal.openTime ? new Date(deal.openTime).toISOString() : closeTime.toISOString(),
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
    outcome: netPnl > 0.01 ? 'WIN' : netPnl < -0.01 ? 'LOSS' : 'BE',
  };
}

/**
 * Create/deploy MetaApi cloud account and return MetaApi account id.
 */
async function provisionMetaApiAccount({ login, password, server, brokerType }) {
  const api = getApi();
  const platform = brokerType === 'mt4' ? 'mt4' : 'mt5';
  const loginStr = String(login);

  const existing = await api.metatraderAccountApi.getAccountsWithInfiniteScroll();
  const match = existing.find(
    (a) => String(a.login) === loginStr && a.server === server && a.platform === platform
  );
  if (match) {
    const account = await api.metatraderAccountApi.getAccount(match.id);
    if (account.state !== 'DEPLOYED') await account.deploy();
    await account.waitConnected(300);
    return account.id;
  }

  const account = await api.metatraderAccountApi.createAccount({
    name: `xaujournal-${loginStr}-${server}`,
    type: 'cloud',
    login: loginStr,
    password,
    server,
    platform,
    magic: 0,
    application: 'MetaApi',
  });

  await account.deploy();
  await account.waitConnected(300);
  return account.id;
}

/**
 * Fetch closed deals since optional fromDate.
 */
async function fetchMetaApiDeals(metaApiAccountId, fromDate = null) {
  const api = getApi();
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId);
  await account.waitConnected(300);

  const connection = account.getRPCConnection();
  await connection.connect();
  await connection.waitSynchronized();

  const start = fromDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const end = new Date();
  const deals = await connection.getDealsByTimeRange(start, end);

  const ctx = {
    brokerType: account.platform,
    server: account.server,
  };

  return (Array.isArray(deals) ? deals : []).map((d) => normalizeDeal(d, ctx));
}

async function fetchBrokerTrades(credentials, fromDate = null) {
  if (credentials.metaApiAccountId) {
    return fetchMetaApiDeals(credentials.metaApiAccountId, fromDate);
  }

  const metaApiAccountId = await provisionMetaApiAccount(credentials);
  return fetchMetaApiDeals(metaApiAccountId, fromDate);
}

async function deleteMetaApiAccount(metaApiAccountId) {
  const api = getApi();
  try {
    await api.metatraderAccountApi.removeAccount(metaApiAccountId);
  } catch (err) {
    console.error(`Failed to delete MetaApi account ${metaApiAccountId}:`, err.message || err);
  }
}

module.exports = {
  provisionMetaApiAccount,
  fetchMetaApiDeals,
  fetchBrokerTrades,
  deleteMetaApiAccount
};

