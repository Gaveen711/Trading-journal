// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  accountsKey,
  clearBrokerCredentials,
  readLocalAccounts,
  readSessionPassword,
  secretKey,
  writeLocalAccounts,
  writeSessionPassword,
} from './brokerCredentials.js';

/**
 * Regression tests for C-01: broker trading passwords persisted in
 * localStorage and surviving sign-out.
 *
 * The assertions are deliberately about what must NOT be on disk.
 */

const UID = 'user_abc123';
const OTHER_UID = 'user_xyz789';

describe('brokerCredentials', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('password is never written to localStorage', () => {
    it('stores account metadata without a password field', () => {
      writeLocalAccounts(UID, [
        { id: 'broker_1', accountName: 'ICM', platform: 'mt5', server: 'ICM-Live', login: '12345' },
      ]);
      const raw = localStorage.getItem(accountsKey(UID));
      expect(raw).not.toContain('password');
      expect(raw).not.toContain('hunter2');
    });

    it('keeps the session password out of localStorage entirely', () => {
      writeSessionPassword(UID, 'broker_1', 'hunter2');
      const everyLocalValue = Object.keys(localStorage).map((k) => localStorage.getItem(k)).join('|');
      expect(everyLocalValue).not.toContain('hunter2');
      expect(readSessionPassword(UID, 'broker_1')).toBe('hunter2');
    });
  });

  describe('legacy credential migration', () => {
    it('strips a password left by an older build and rewrites the record', () => {
      // Exactly the shape the previous implementation persisted.
      localStorage.setItem(accountsKey(UID), JSON.stringify([
        { id: 'broker_1', accountName: 'ICM', platform: 'mt5', server: 'ICM-Live', login: '12345', password: 'hunter2' },
      ]));

      const accounts = readLocalAccounts(UID);

      expect(accounts[0]).not.toHaveProperty('password');
      // The strip is persisted, so the secret leaves disk on first read.
      expect(localStorage.getItem(accountsKey(UID))).not.toContain('hunter2');
      // Non-secret metadata survives, so the account list still renders.
      expect(accounts[0].login).toBe('12345');
      expect(accounts[0].server).toBe('ICM-Live');
    });

    it('tolerates malformed stored JSON without throwing', () => {
      localStorage.setItem(accountsKey(UID), 'not json{');
      expect(() => readLocalAccounts(UID)).not.toThrow();
      expect(readLocalAccounts(UID)).toEqual([]);
    });

    it('tolerates a stored value that is not an array', () => {
      localStorage.setItem(accountsKey(UID), JSON.stringify({ id: 'broker_1' }));
      expect(readLocalAccounts(UID)).toEqual([]);
    });
  });

  describe('clearBrokerCredentials', () => {
    it('removes both the metadata and the session password', () => {
      writeLocalAccounts(UID, [{ id: 'broker_1', login: '12345' }]);
      writeSessionPassword(UID, 'broker_1', 'hunter2');

      clearBrokerCredentials(UID);

      expect(localStorage.getItem(accountsKey(UID))).toBeNull();
      expect(sessionStorage.getItem(secretKey(UID))).toBeNull();
      expect(readSessionPassword(UID, 'broker_1')).toBeNull();
    });

    it('removes credentials left by a different identity on this device', () => {
      // The shared-machine case: someone else signed in here earlier.
      writeLocalAccounts(OTHER_UID, [{ id: 'broker_9', login: '99999' }]);
      writeSessionPassword(OTHER_UID, 'broker_9', 'their-password');

      clearBrokerCredentials(UID);

      expect(localStorage.getItem(accountsKey(OTHER_UID))).toBeNull();
      expect(sessionStorage.getItem(secretKey(OTHER_UID))).toBeNull();
    });

    it('sweeps stale blobs even when the signing-out uid is unknown', () => {
      writeLocalAccounts(OTHER_UID, [{ id: 'broker_9', login: '99999' }]);
      writeSessionPassword(OTHER_UID, 'broker_9', 'their-password');

      clearBrokerCredentials(undefined);

      expect(localStorage.getItem(accountsKey(OTHER_UID))).toBeNull();
      expect(sessionStorage.getItem(secretKey(OTHER_UID))).toBeNull();
    });

    it('leaves unrelated app state alone', () => {
      localStorage.setItem('xau-theme', 'dark');
      localStorage.setItem('xau-remembered-email', 'trader@example.com');
      writeLocalAccounts(UID, [{ id: 'broker_1' }]);

      clearBrokerCredentials(UID);

      expect(localStorage.getItem('xau-theme')).toBe('dark');
      expect(localStorage.getItem('xau-remembered-email')).toBe('trader@example.com');
    });
  });

  describe('readSessionPassword', () => {
    it('returns null for an account with no held credential', () => {
      writeSessionPassword(UID, 'broker_1', 'hunter2');
      expect(readSessionPassword(UID, 'broker_other')).toBeNull();
    });

    it('returns null for a different user', () => {
      writeSessionPassword(UID, 'broker_1', 'hunter2');
      expect(readSessionPassword(OTHER_UID, 'broker_1')).toBeNull();
    });
  });
});
