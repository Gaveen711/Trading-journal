// @vitest-environment jsdom
//
// Spec §D-2 / §6 backfill matrix: the broker `login` is the field `syncAccount`
// refuses to run without, and until this release it existed only in this
// browser's localStorage. Clearing storage or opening the app on a second
// device therefore killed sync silently while the UI kept showing the account
// as connected. Phase 2 shipped the server side (POST /api/broker-login-sync
// {action:'adopt'}) with no client caller at all — these tests pin the client
// half: one POST per account per mount, server truth never overwritten, and the
// local copy drained the moment the listener shows a server login.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const harness = vi.hoisted(() => ({ services: null }));

vi.mock('../../app/di/AppServicesContext.jsx', () => ({
  useAppServices: () => harness.services,
}));

vi.mock('../../firebaseAuth.js', () => ({
  auth: { currentUser: { uid: 'u1', getIdToken: async () => 'id-token' } },
}));

const { useBrokerAccounts } = await import('../useBrokerAccounts');
const { adoptBrokerCallable } = await import('../../lib/brokerSync.js');

const USER = { uid: 'u1' };
const LOCAL_KEY = `xau-broker-accounts-${USER.uid}`;

// What this device stored before the migration: metadata only, never a secret.
const localEntry = (overrides = {}) => ({
  id: 'broker_1',
  accountName: 'ICMarkets-Live',
  platform: 'mt5',
  server: 'ICMarkets-Live',
  login: '12345678',
  managedByWorker: true,
  ...overrides,
});

// A server doc written before `login` was persisted: the key is simply absent.
const serverDoc = (overrides = {}) => ({
  id: 'broker_1',
  accountName: 'ICMarkets-Live',
  brokerType: 'mt5',
  server: 'ICMarkets-Live',
  isActive: true,
  lastSyncStatus: 'success',
  ...overrides,
});

let emitAccounts;
let adoptSpy;
let disconnectSpy;

const readLocal = () => {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : null;
};

function mountHook(initialAccounts) {
  harness.services = {
    auth: {
      currentUser: USER,
      onAuthStateChanged: (callback) => {
        callback(USER);
        return () => {};
      },
    },
    brokerRepository: {
      subscribeToUserDoc: (_uid, onUpdate) => {
        onUpdate({ exists: () => false, data: () => ({}) });
        return () => {};
      },
      subscribeToAccounts: (_uid, onUpdate) => {
        emitAccounts = onUpdate;
        onUpdate(initialAccounts);
        return () => {};
      },
      adoptBrokerAccount: adoptSpy,
      disconnectBroker: disconnectSpy,
      connectBroker: vi.fn(),
      syncBrokerTrades: vi.fn(),
    },
  };
  return renderHook(() => useBrokerAccounts());
}

const only = (view) => view.result.current.accounts[0];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  emitAccounts = null;
  adoptSpy = vi.fn().mockResolvedValue({ ok: true, adopted: true });
  disconnectSpy = vi.fn().mockResolvedValue({ ok: true });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useBrokerAccounts — one-shot login adoption', () => {
  it('adopts the local login onto a server doc that has none, then drains localStorage', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry()]));

    const view = mountHook([serverDoc()]);

    await waitFor(() => expect(adoptSpy).toHaveBeenCalledTimes(1));
    expect(adoptSpy).toHaveBeenCalledWith('broker_1', '12345678');
    // §6: "localStorage entry dropped when listener shows login" — the local
    // copy has served its purpose the moment the server owns it.
    await waitFor(() => expect(readLocal()).toBeNull());
    // Until the adopted doc echoes back, the account still renders with the
    // login this device supplied: sync must not break mid-migration.
    expect(only(view).login).toBe('12345678');
    expect(only(view).requiresReconnect).toBe(false);
  });

  it('never adopts when the server doc already carries a login, and still drains', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry()]));

    const view = mountHook([serverDoc({ login: '12345678' })]);

    await waitFor(() => expect(readLocal()).toBeNull());
    expect(adoptSpy).not.toHaveBeenCalled();
    expect(only(view).login).toBe('12345678');
  });

  it('lets the server login win over a diverged local copy (server-wins merge)', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry({ login: '11111111' })]));

    const view = mountHook([serverDoc({ login: '22222222' })]);

    await waitFor(() => expect(readLocal()).toBeNull());
    expect(adoptSpy).not.toHaveBeenCalled();
    expect(only(view).login).toBe('22222222');
  });

  it('fires at most one POST per account per mount, even for snapshots arriving mid-flight', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry()]));
    let settle;
    adoptSpy.mockImplementation(() => new Promise((resolve) => { settle = resolve; }));

    mountHook([serverDoc()]);
    await waitFor(() => expect(adoptSpy).toHaveBeenCalledTimes(1));

    // Two more listener events land before the first request settles. The guard
    // is recorded before the await precisely so these cannot double-fire.
    await act(async () => {
      emitAccounts([serverDoc()]);
      emitAccounts([serverDoc()]);
    });
    expect(adoptSpy).toHaveBeenCalledTimes(1);

    await act(async () => { settle({ ok: true, adopted: true }); });
    await waitFor(() => expect(readLocal()).toBeNull());
    expect(adoptSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps server truth and clears the stale local copy on a 409 login-mismatch', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry({ login: '11111111' })]));
    const conflict = Object.assign(new Error('Broker account already has a different login'), {
      status: 409,
      code: 'login-mismatch',
    });
    adoptSpy.mockRejectedValue(conflict);

    const view = mountHook([serverDoc()]);

    await waitFor(() => expect(adoptSpy).toHaveBeenCalledTimes(1));
    // The server said it already owns a different login: this device's copy is
    // the stale one, and it is never written over the server's.
    await waitFor(() => expect(readLocal()).toBeNull());

    await act(async () => { emitAccounts([serverDoc({ login: '87654321' })]); });
    expect(only(view).login).toBe('87654321');
    expect(adoptSpy).toHaveBeenCalledTimes(1);
  });

  it('does not retry in-session after a transport failure, and keeps the local copy', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry()]));
    adoptSpy.mockRejectedValue(new Error('Failed to fetch'));

    const view = mountHook([serverDoc()]);

    await waitFor(() => expect(adoptSpy).toHaveBeenCalledTimes(1));
    // Offline: the local login is the only thing keeping sync alive on this
    // device, so it stays until an adoption actually succeeds.
    expect(readLocal()).toHaveLength(1);
    expect(only(view).login).toBe('12345678');

    await act(async () => { emitAccounts([serverDoc()]); });
    await act(async () => { emitAccounts([serverDoc()]); });
    expect(adoptSpy).toHaveBeenCalledTimes(1);
    expect(readLocal()).toHaveLength(1);
  });

  it('leaves legacy records alone — no adopt, still requiresReconnect', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([
      localEntry({ id: 'legacy_1', managedByWorker: false }),
    ]));

    const view = mountHook([]);

    await waitFor(() => expect(view.result.current.loading).toBe(false));
    expect(adoptSpy).not.toHaveBeenCalled();
    expect(readLocal()).toHaveLength(1);
    expect(only(view)).toMatchObject({ id: 'legacy_1', requiresReconnect: true, managedByWorker: false });
  });

  it('does not adopt an account this device holds no login for', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry({ login: '' })]));

    const view = mountHook([serverDoc()]);

    await waitFor(() => expect(view.result.current.loading).toBe(false));
    expect(adoptSpy).not.toHaveBeenCalled();
    expect(only(view).login).toBeNull();
  });
});

describe('useBrokerAccounts.removeAccount — offline tolerance preserved', () => {
  it('removes the account locally even when the remote disconnect fails', async () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([localEntry()]));
    disconnectSpy.mockRejectedValue(new Error('Failed to fetch'));

    const view = mountHook([serverDoc({ login: '12345678' })]);
    await waitFor(() => expect(view.result.current.accounts).toHaveLength(1));

    let result;
    await act(async () => { result = await view.result.current.removeAccount('broker_1'); });

    expect(result.message).toMatch(/removed from this device/i);
    expect(view.result.current.accounts).toHaveLength(0);
    expect(readLocal()).toBeNull();
    expect(view.result.current.error).toBeNull();
  });
});

describe('adoptBrokerCallable', () => {
  const okResponse = () => ({ ok: true, status: 200, json: async () => ({ ok: true, adopted: true }) });

  it('posts the adopt action with the account id and login', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchSpy);

    await expect(adoptBrokerCallable('broker_1', '12345678')).resolves.toEqual({ ok: true, adopted: true });

    const [path, init] = fetchSpy.mock.calls[0];
    expect(path).toBe('/api/broker-login-sync');
    expect(JSON.parse(init.body)).toEqual({ action: 'adopt', accountId: 'broker_1', login: '12345678' });
    // The password never belongs on this path.
    expect(init.body).not.toContain('password');
    vi.unstubAllGlobals();
  });

  it('surfaces the stable error code and status from the route, not just its prose', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Broker account already has a different login', code: 'login-mismatch' }),
    }));

    // Without this the hook could only tell a conflict from an outage by
    // matching on the message text.
    await expect(adoptBrokerCallable('broker_1', '12345678')).rejects.toMatchObject({
      code: 'login-mismatch',
      status: 409,
      message: 'Broker account already has a different login',
    });
    vi.unstubAllGlobals();
  });
});
