import { describe, it, expect, vi, beforeEach } from 'vitest';

// The repository is the last mile of the session write path: everything the
// LogTrade use case resolves has to survive into the document, and the
// sessionAnalytics aggregate has to move in lockstep with the v2 one on every
// path — including delete, where a missed correction drifts the aggregate
// permanently (the stored version still matches, so the lazy rebuild gate
// never fires to repair it).
//
// Firestore is faked at the SDK boundary rather than the repository boundary,
// so what these tests read is the literal payload that would be sent.
const fake = vi.hoisted(() => ({
  batch: { sets: [], updates: [], commits: 0 },
  tx: { updates: [], deletes: [] },
  stored: { data: null },
}));

vi.mock('../firebase.js', () => ({ db: { kind: 'db' } }));

vi.mock('firebase/firestore', () => {
  const pathOf = (args) => args.slice(1).join('/');
  return {
    collection: (...args) => ({ kind: 'collection', path: pathOf(args) }),
    doc: (...args) => (args[0]?.kind === 'collection'
      ? { kind: 'doc', id: 'generated_id', path: args[0].path + '/generated_id' }
      : { kind: 'doc', id: args.at(-1), path: pathOf(args) }),
    getDocs: vi.fn(),
    increment: (value) => ({ increment: value }),
    limit: () => ({}),
    onSnapshot: vi.fn(),
    orderBy: () => ({}),
    query: () => ({}),
    runTransaction: async (_db, run) => run({
      get: async () => ({ exists: () => fake.stored.data !== null, data: () => fake.stored.data }),
      update: (ref, payload) => { fake.tx.updates.push({ path: ref.path, payload }); },
      delete: (ref) => { fake.tx.deletes.push(ref.path); },
    }),
    serverTimestamp: () => ({ serverTimestamp: true }),
    startAfter: () => ({}),
    where: () => ({}),
    writeBatch: () => ({
      set: (ref, payload) => { fake.batch.sets.push({ path: ref.path, payload }); },
      update: (ref, payload) => { fake.batch.updates.push({ path: ref.path, payload }); },
      commit: async () => { fake.batch.commits += 1; },
    }),
  };
});

const { FirebaseTradeRepository } = await import('../data/repositories/FirebaseTradeRepository.js');
const { LogTradeUseCase } = await import('../core/usecases/LogTrade.js');
const { SESSION_CODES, SESSION_ENGINE_VERSION } = await import('../lib/sessionEngine.js');

const repository = new FirebaseTradeRepository();
const logTrade = new LogTradeUseCase(repository);

/** Firestore rejects undefined outright, and a rejected write fails the whole batch. */
function undefinedPaths(value, trail = '') {
  if (value === undefined) return [trail || '<root>'];
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => undefinedPaths(child, trail ? trail + '.' + key : key));
}

const manualTrade = (overrides = {}) => ({
  date: '2026-08-19',
  direction: 'BUY',
  entry: 2400,
  exit: 2410,
  lots: 0.1,
  sl: 2390,
  tp: 2430,
  session: 'London',
  setupId: 'default_breakout',
  strategy: 'Breakout',
  timestamp: new Date('2026-08-19T14:30:00Z'),
  ...overrides,
});

// A stored manual document as the log path leaves it: a Wednesday 14:30 UTC
// instant, which is the London/NY overlap.
const storedTrade = (overrides = {}) => ({
  id: 't1',
  date: '2026-08-19',
  direction: 'BUY',
  entry: 2400,
  exit: 2410,
  lots: 0.1,
  pnl: 100,
  outcome: 'WIN',
  session: 'London',
  entryTimestampUtc: '2026-08-19T14:30:00.000Z',
  sessionCode: 'LondonNY',
  sessionSource: 'manual-logtime',
  sessionEngineVersion: SESSION_ENGINE_VERSION,
  ...overrides,
});

const lastTradeWrite = () => fake.batch.sets.at(-1).payload;
const lastUserWrite = () => fake.batch.updates.at(-1).payload;
const txTradeWrite = () => fake.tx.updates.find((entry) => entry.path.includes('/trades/')).payload;
const txUserWrite = () => fake.tx.updates.find((entry) => !entry.path.includes('/trades/')).payload;

beforeEach(() => {
  fake.batch.sets.length = 0;
  fake.batch.updates.length = 0;
  fake.batch.commits = 0;
  fake.tx.updates.length = 0;
  fake.tx.deletes.length = 0;
  fake.stored.data = null;
});

describe('FirebaseTradeRepository session write paths', () => {
  it('persists the manual-log session fields and setupId onto the trade document', async () => {
    await logTrade.execute('u1', manualTrade());

    const written = lastTradeWrite();
    expect(written.entryTimestampUtc).toBe('2026-08-19T14:30:00.000Z');
    expect(written.sessionCode).toBe('LondonNY');
    expect(written.sessionSource).toBe('manual-logtime');
    expect(written.sessionEngineVersion).toBe(SESSION_ENGINE_VERSION);
    expect(written.setupId).toBe('default_breakout');
    // The one session field the storage-agnostic use case cannot supply.
    expect(written.sessionResolvedAt).toEqual({ serverTimestamp: true });
    expect(undefinedPaths(written)).toEqual([]);
    expect(fake.batch.commits).toBe(1);
  });

  it('stamps an enum member or null — never the Unknown analytics bucket', async () => {
    await logTrade.execute('u1', manualTrade());
    expect(SESSION_CODES).toContain(lastTradeWrite().sessionCode);

    // An unusable log instant resolves to nothing at all. firestore.rules pins
    // sessionCode to the six codes or null, so 'Unknown' here would fail the
    // trade write and take the whole batch down with it.
    await logTrade.execute('u1', manualTrade({ timestamp: 'not-an-instant' }));
    const written = lastTradeWrite();
    expect(written.sessionCode).toBeNull();
    expect(written.entryTimestampUtc).toBeNull();
    expect(undefinedPaths(written)).toEqual([]);
  });

  it('increments sessionAnalytics in the same user-doc write as the v2 analytics', async () => {
    await logTrade.execute('u1', manualTrade());

    const update = lastUserWrite();
    expect(fake.batch.updates).toHaveLength(1);
    expect(update.lastTradeTime).toEqual({ serverTimestamp: true });
    expect(update['analytics.tradeCount']).toEqual({ increment: 1 });
    expect(update['sessionAnalytics.buckets.LondonNY.tradeCount']).toEqual({ increment: 1 });
    expect(update['sessionAnalytics.buckets.LondonNY.wins']).toEqual({ increment: 1 });
    // Zero counters are dropped, so an untouched bucket writes no fields.
    expect(update['sessionAnalytics.buckets.Asia.tradeCount']).toBeUndefined();
    expect(undefinedPaths(update)).toEqual([]);
  });

  it('emits the -1 session correction inside the delete transaction', async () => {
    fake.stored.data = storedTrade();

    await repository.removeTrade('u1', 't1');

    expect(fake.tx.deletes).toEqual(['users/u1/trades/t1']);
    const update = txUserWrite();
    expect(fake.tx.updates).toHaveLength(1);
    expect(update['analytics.tradeCount']).toEqual({ increment: -1 });
    expect(update['sessionAnalytics.buckets.LondonNY.tradeCount']).toEqual({ increment: -1 });
    expect(update['sessionAnalytics.buckets.LondonNY.totalPnl']).toEqual({ increment: -100 });
    expect(update['sessionAnalytics.buckets.LondonNY.wins']).toEqual({ increment: -1 });
  });

  it('nulls entryTimestampUtc and falls back to the user session when an edit moves the date', async () => {
    fake.stored.data = storedTrade({ session: 'Tokyo' });

    await repository.editTrade('u1', 't1', { date: '2026-08-10', session: 'Tokyo', pnl: 100, outcome: 'WIN' });

    const patch = txTradeWrite();
    // A day string carries no instant, so the instant is retired rather than a
    // code being "recomputed" from a bare date.
    expect(patch.entryTimestampUtc).toBeNull();
    expect(patch.sessionCode).toBe('Asia');
    expect(patch.sessionSource).toBe('user');
    expect(patch.sessionEngineVersion).toBe(SESSION_ENGINE_VERSION);
    expect(patch.sessionResolvedAt).toEqual({ serverTimestamp: true });
    expect(undefinedPaths(patch)).toEqual([]);
  });

  it('writes both buckets when an edit moves a trade between sessions', async () => {
    fake.stored.data = storedTrade({ session: 'Tokyo' });

    await repository.editTrade('u1', 't1', { date: '2026-08-10', session: 'Tokyo', pnl: 100, outcome: 'WIN' });

    const update = txUserWrite();
    expect(update['sessionAnalytics.buckets.LondonNY.tradeCount']).toEqual({ increment: -1 });
    expect(update['sessionAnalytics.buckets.Asia.tradeCount']).toEqual({ increment: 1 });
    expect(update['sessionAnalytics.buckets.Asia.totalPnl']).toEqual({ increment: 100 });
    // The v2 correction is a no-op for a session-only move, and rides the same write.
    expect(update['analytics.tradeCount']).toEqual({ increment: 0 });
  });

  it('keeps the instant, and its provenance, when the edited date still matches it', async () => {
    fake.stored.data = storedTrade();

    await repository.editTrade('u1', 't1', { date: '2026-08-19', session: 'Tokyo', pnl: 100, outcome: 'WIN' });

    const patch = txTradeWrite();
    expect(patch.entryTimestampUtc).toBe('2026-08-19T14:30:00.000Z');
    expect(patch.sessionCode).toBe('LondonNY');
    expect(patch.sessionSource).toBe('manual-logtime');
    // The user's Session pick loses to a trusted instant, so nothing moves.
    expect(txUserWrite()['sessionAnalytics.buckets.Asia.tradeCount']).toBeUndefined();
  });

  it('falls through an uncoercible stored instant to the log-time tier', async () => {
    // A legacy or half-written document: the field is present but says nothing.
    // Writing it back verbatim would keep an unusable value alive forever.
    fake.stored.data = storedTrade({
      entryTimestampUtc: '',
      timestamp: '2026-08-19T02:00:00.000Z',
      sessionCode: null,
      sessionSource: null,
    });

    await repository.editTrade('u1', 't1', { date: '2026-08-19', session: 'London', pnl: 100, outcome: 'WIN' });

    const patch = txTradeWrite();
    expect(patch.entryTimestampUtc).toBe('2026-08-19T02:00:00.000Z');
    expect(patch.sessionCode).toBe('Asia');
    expect(patch.sessionSource).toBe('manual-logtime');
  });

  it('leaves the session tag alone when an edit cannot have moved it', async () => {
    fake.stored.data = storedTrade();

    await repository.editTrade('u1', 't1', { note: 'reviewed' });

    expect(txTradeWrite()).toEqual({ note: 'reviewed' });
    expect(Object.keys(txUserWrite()).some((key) => key.startsWith('sessionAnalytics.'))).toBe(false);
  });

  it('stores null rather than Unknown when a date edit leaves no user session to fall back on', async () => {
    fake.stored.data = storedTrade({ session: '' });

    await repository.editTrade('u1', 't1', { date: '2026-08-10', session: '', pnl: 100, outcome: 'WIN' });

    const patch = txTradeWrite();
    expect(patch.sessionCode).toBeNull();
    expect(patch.sessionSource).toBe('user');
    // The trade still has to land somewhere in the aggregate.
    expect(txUserWrite()['sessionAnalytics.buckets.Unknown.tradeCount']).toEqual({ increment: 1 });
  });

  it('returns the patch it applied, so a local cache does not keep a stale sessionCode', async () => {
    fake.stored.data = storedTrade({ session: 'Tokyo' });

    const applied = await repository.editTrade('u1', 't1', { date: '2026-08-10', session: 'Tokyo' });

    // Wider than the caller's payload: the tag is re-derived inside the
    // transaction, and getTradeSessionCode TRUSTS a version-matched stored code
    // over the instant — so a cache merging only `{date, session}` would keep
    // reporting this trade under LondonNY forever.
    expect(applied).toMatchObject({
      date: '2026-08-10',
      session: 'Tokyo',
      entryTimestampUtc: null,
      sessionCode: 'Asia',
      sessionSource: 'user',
      sessionEngineVersion: SESSION_ENGINE_VERSION,
    });
    // The audit stamp is a FieldValue sentinel, not a value any reader can use,
    // so it is withheld from the returned patch rather than cached as an object.
    expect(applied).not.toHaveProperty('sessionResolvedAt');
    expect(txTradeWrite().sessionResolvedAt).toEqual({ serverTimestamp: true });
  });
});
