/* ————————————————————————————————————————————————————————————
   In-memory repositories for the dev-only showcase.

   Each one implements the abstract interface in src/core/domain/repositories
   with the snapshot semantics the hooks were written against the Firebase
   adapters for: listeners get their first delivery on a microtask (never
   synchronously inside subscribe), user-doc listeners receive a docSnap with
   `.exists()`, `.data()` and `.metadata.fromCache`, the catalog listener a
   QuerySnapshot-like object. Writes mutate the store and re-deliver, so the
   pages' own handlers (log, edit, delete, save a note) work against the
   dataset as they would against Firestore — just without persistence.
   ———————————————————————————————————————————————————————————— */

import { BrokerRepository } from '../core/domain/repositories/BrokerRepository.js';
import { JournalRepository } from '../core/domain/repositories/JournalRepository.js';
import { SubscriptionRepository } from '../core/domain/repositories/SubscriptionRepository.js';
import { TradeRepository } from '../core/domain/repositories/TradeRepository.js';
import { WalletRepository } from '../core/domain/repositories/WalletRepository.js';

const clone = (value) => (value === undefined ? value : JSON.parse(JSON.stringify(value)));

/** Date desc, then entry time desc — Firestore's order plus a stable tiebreak. */
function byDateDesc(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  const left = a.openTime || a.timestamp || '';
  const right = b.openTime || b.timestamp || '';
  return left === right ? 0 : left < right ? 1 : -1;
}

/** A listener set whose deliveries always happen off the subscribing stack. */
function channel() {
  const listeners = new Set();
  return {
    subscribe(listener, deliverNow) {
      listeners.add(listener);
      queueMicrotask(() => {
        if (listeners.has(listener)) deliverNow(listener);
      });
      return () => listeners.delete(listener);
    },
    publish(deliver) {
      listeners.forEach((listener) => deliver(listener));
    },
  };
}

function docSnapshot(id, data) {
  return {
    id,
    exists: () => data !== null,
    data: () => (data === null ? undefined : clone(data)),
    metadata: { fromCache: false, hasPendingWrites: false },
  };
}

function querySnapshot(docs) {
  const items = docs.map((item) => ({ id: item.id, data: () => clone(item) }));
  return {
    docs: items,
    size: items.length,
    empty: items.length === 0,
    metadata: { fromCache: false, hasPendingWrites: false },
    docChanges: () => items.map((doc) => ({ type: 'added', doc })),
  };
}

/**
 * One mutable copy of the dataset shared by the five repositories, plus a
 * readiness flag the showcase shell exposes to the capture script once the
 * trade listener has delivered.
 */
export function createShowcaseStore(dataset) {
  const state = {
    uid: dataset.uid,
    user: clone(dataset.user),
    trades: clone(dataset.trades).sort(byDateDesc),
    journals: clone(dataset.journals),
    setups: clone(dataset.setups),
    brokerAccounts: clone(dataset.brokerAccounts),
  };
  const channels = {
    user: channel(),
    trades: channel(),
    setups: channel(),
    accounts: channel(),
  };
  const readyListeners = new Set();
  let ready = false;
  const markReady = () => {
    if (ready) return;
    ready = true;
    readyListeners.forEach((listener) => listener());
  };
  let nextId = state.trades.length + 1;

  return {
    state,
    channels,
    nextTradeId: () => `showcase-trade-${String(nextId++).padStart(3, '0')}`,
    markReady,
    isReady: () => ready,
    subscribeReady(listener) {
      readyListeners.add(listener);
      return () => readyListeners.delete(listener);
    },
    publishUser() {
      channels.user.publish((listener) => listener(docSnapshot(state.uid, state.user)));
    },
    publishTrades() {
      channels.trades.publish((listener) => listener());
    },
  };
}

export class InMemoryTradeRepository extends TradeRepository {
  constructor(store) {
    super();
    this.store = store;
  }

  #page(cursorIndex, pageSize) {
    const { trades } = this.store.state;
    const slice = trades.slice(cursorIndex, cursorIndex + pageSize);
    const end = cursorIndex + slice.length;
    return {
      trades: clone(slice),
      cursor: slice.length ? { index: end } : null,
      hasMore: slice.length === pageSize && end < trades.length,
    };
  }

  subscribeToTrades(_userId, onUpdate, _onError, pageSize = 100) {
    const deliver = (listener) => {
      const page = this.#page(0, pageSize);
      listener(page.trades, false, { cursor: page.cursor, hasMore: page.hasMore });
    };
    const listener = () => deliver(onUpdate);
    return this.store.channels.trades.subscribe(listener, () => {
      deliver(onUpdate);
      this.store.markReady();
    });
  }

  async getTradesPage(_userId, cursor, pageSize = 100) {
    return this.#page(cursor?.index ?? 0, pageSize);
  }

  subscribeToTradesInRange(_userId, startDate, endDate, onUpdate) {
    const deliver = () => {
      onUpdate(clone(this.store.state.trades.filter((trade) => trade.date >= startDate && trade.date <= endDate)));
    };
    return this.store.channels.trades.subscribe(deliver, deliver);
  }

  async addTrade(_userId, tradeData) {
    const id = this.store.nextTradeId();
    const trade = clone({ ...tradeData, id, timestamp: tradeData.timestamp ?? new Date() });
    if (trade.timestamp && typeof trade.timestamp !== 'string') trade.timestamp = new Date(trade.timestamp).toISOString();
    this.store.state.trades = [...this.store.state.trades, trade].sort(byDateDesc);
    this.store.state.user.totalTradesLogged = (this.store.state.user.totalTradesLogged || 0) + 1;
    this.store.publishTrades();
    this.store.publishUser();
    return { id };
  }

  async removeTrade(_userId, tradeId) {
    this.store.state.trades = this.store.state.trades.filter((trade) => trade.id !== tradeId);
    this.store.state.user.totalTradesLogged = Math.max(0, (this.store.state.user.totalTradesLogged || 0) - 1);
    this.store.publishTrades();
    this.store.publishUser();
  }

  async editTrade(_userId, tradeId, updatedData) {
    const { id: _drop, ...patch } = updatedData;
    this.store.state.trades = this.store.state.trades
      .map((trade) => (trade.id === tradeId ? { ...trade, ...clone(patch) } : trade))
      .sort(byDateDesc);
    this.store.publishTrades();
    return patch;
  }

  async resetTrades() {
    this.store.state.trades = [];
    this.store.state.user.totalTradesLogged = 0;
    this.store.publishTrades();
    this.store.publishUser();
  }
}

export class InMemoryJournalRepository extends JournalRepository {
  constructor(store) {
    super();
    this.store = store;
  }

  async loadJournals() {
    return clone(this.store.state.journals);
  }

  async saveJournalEntry(_userId, date, text, mood, isNew, wasPresent) {
    const { journals, user } = this.store.state;
    if (text.trim()) {
      journals[date] = { text, mood };
      if (isNew) user.totalJournalsLogged = (user.totalJournalsLogged || 0) + 1;
    } else {
      delete journals[date];
      if (wasPresent) user.totalJournalsLogged = Math.max(0, (user.totalJournalsLogged || 0) - 1);
    }
    this.store.publishUser();
  }

  async deleteEntry(_userId, date, wasPresent) {
    delete this.store.state.journals[date];
    if (wasPresent) {
      const { user } = this.store.state;
      user.totalJournalsLogged = Math.max(0, (user.totalJournalsLogged || 0) - 1);
    }
    this.store.publishUser();
  }

  async deleteEntries(_userId, dates) {
    dates.forEach((date) => { delete this.store.state.journals[date]; });
    const { user } = this.store.state;
    user.totalJournalsLogged = Math.max(0, (user.totalJournalsLogged || 0) - dates.length);
    this.store.publishUser();
  }
}

export class InMemoryWalletRepository extends WalletRepository {
  constructor(store) {
    super();
    this.store = store;
  }

  async getWalletData() {
    const { walletBalance = 0, monthlyGoal = 1000 } = this.store.state.user;
    return { walletBalance, monthlyGoal };
  }

  async updateBalance(_userId, newBalance) {
    this.store.state.user.walletBalance = newBalance;
    this.store.publishUser();
  }

  async updateMonthlyGoal(_userId, newGoal) {
    this.store.state.user.monthlyGoal = newGoal;
    this.store.publishUser();
  }
}

export class InMemorySubscriptionRepository extends SubscriptionRepository {
  constructor(store) {
    super();
    this.store = store;
  }

  subscribeToUserDoc(_userId, onUpdate) {
    const { state } = this.store;
    return this.store.channels.user.subscribe(onUpdate, () => onUpdate(docSnapshot(state.uid, state.user)));
  }

  async recordProAcceptance() {
    Object.assign(this.store.state.user, {
      proLegalAccepted: true,
      proLegalAcceptedAt: new Date().toISOString(),
      proLegalVersion: '1.0.4',
      refundPolicyAcknowledged: true,
    });
    this.store.publishUser();
  }

  async agreeToTerms() {
    Object.assign(this.store.state.user, { agreedToTerms: true, agreedAt: new Date().toISOString() });
    this.store.publishUser();
  }
}

export class InMemoryBrokerRepository extends BrokerRepository {
  constructor(store) {
    super();
    this.store = store;
  }

  subscribeToUserDoc(_userId, onUpdate) {
    const { state } = this.store;
    return this.store.channels.user.subscribe(onUpdate, () => onUpdate(docSnapshot(state.uid, state.user)));
  }

  subscribeToAccounts(_userId, onUpdate) {
    const deliver = () => onUpdate(clone(this.store.state.brokerAccounts.filter((account) => account.isActive !== false)));
    return this.store.channels.accounts.subscribe(deliver, deliver);
  }

  async syncBrokerTrades() {
    const now = new Date().toISOString();
    this.store.state.brokerAccounts = this.store.state.brokerAccounts.map((account) => ({ ...account, lastSyncTime: now }));
    this.store.channels.accounts.publish((listener) => listener());
    return { success: true, message: 'Showcase account is already up to date.', tradeCount: this.store.state.trades.length };
  }

  async connectBroker({ accountId, server, platform }) {
    const account = {
      id: `showcase-${accountId}`,
      accountName: `${server} · ${accountId}`,
      brokerType: platform,
      platform,
      server,
      login: String(accountId),
      isActive: true,
      managedByWorker: true,
      lastSyncTime: new Date().toISOString(),
      lastSyncStatus: 'success',
      lastSyncError: null,
      tradeCount: 0,
    };
    this.store.state.brokerAccounts = [account];
    this.store.channels.accounts.publish((listener) => listener());
    return { accountId: account.id, message: 'Showcase broker connected.', tradeCount: 0 };
  }

  async disconnectBroker(accountId) {
    this.store.state.brokerAccounts = this.store.state.brokerAccounts.map((account) => (
      account.id === accountId ? { ...account, isActive: false } : account
    ));
    this.store.channels.accounts.publish((listener) => listener());
    return { message: 'Showcase broker disconnected.' };
  }
}

/**
 * The optional catalog seam `useSetups` consumes: `subscribe` delivers a
 * QuerySnapshot-like object, the writes stamp their own timestamps.
 */
export class InMemorySetupRepository {
  constructor(store) {
    this.store = store;
  }

  subscribe(_userId, onNext) {
    const deliver = () => onNext(querySnapshot(this.store.state.setups));
    return this.store.channels.setups.subscribe(deliver, deliver);
  }

  async create(_userId, data) {
    const id = `setup-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    this.store.state.setups = [...this.store.state.setups, { ...clone(data), id, createdAt: now, updatedAt: now }];
    this.store.channels.setups.publish((listener) => listener());
    return id;
  }

  async update(_userId, setupId, patch) {
    const now = new Date().toISOString();
    this.store.state.setups = this.store.state.setups.map((setup) => (
      setup.id === setupId ? { ...setup, ...clone(patch), updatedAt: now } : setup
    ));
    this.store.channels.setups.publish((listener) => listener());
  }

  async remove(_userId, setupId) {
    this.store.state.setups = this.store.state.setups.filter((setup) => setup.id !== setupId);
    this.store.channels.setups.publish((listener) => listener());
  }

  async seedDefaults() {
    // The showcase catalog is never empty, so this is never reached.
  }
}

/** Every repository the app services accept, sharing one store. */
export function createInMemoryRepositories(dataset) {
  const store = createShowcaseStore(dataset);
  return {
    store,
    tradeRepository: new InMemoryTradeRepository(store),
    journalRepository: new InMemoryJournalRepository(store),
    walletRepository: new InMemoryWalletRepository(store),
    subscriptionRepository: new InMemorySubscriptionRepository(store),
    brokerRepository: new InMemoryBrokerRepository(store),
    setupRepository: new InMemorySetupRepository(store),
  };
}
