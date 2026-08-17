import { describe, it, expect, afterEach } from 'vitest';
import {
  assertCron,
  escapeHtml,
  hashToken,
  isValidAccountId,
  isValidUid,
  timingSafeHexEqual,
  validateSyncPayload,
} from './_security.ts';
import { getClientIp } from './_ipUtils.ts';

/**
 * Regression tests for the audit findings.
 *
 * Each case asserts the *negative* — that a specific attack is refused. A test
 * that only proves the happy path still works would have passed against every
 * one of these bugs.
 */

/** Minimal Hono-like context: just the header lookup these helpers use. */
const contextWithHeaders = (headers = {}) => {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const responses = [];
  return {
    responses,
    req: { header: (name) => lower[String(name).toLowerCase()] },
    json: (body, status) => {
      responses.push({ body, status });
      return { body, status };
    },
  };
};

describe('assertCron (H-01: unauthenticated cron access)', () => {
  const originalSecret = process.env.CRON_SECRET;
  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it('refuses to run when CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET;
    const c = contextWithHeaders({ Authorization: 'Bearer anything' });
    const result = assertCron(c);
    expect(result).not.toBeNull();
    expect(result.status).toBe(503);
  });

  it('rejects the literal "Bearer undefined" that an unset secret would produce', () => {
    delete process.env.CRON_SECRET;
    const c = contextWithHeaders({ Authorization: 'Bearer undefined' });
    const result = assertCron(c);
    expect(result.status).toBe(503);
    expect(result.status).not.toBe(200);
  });

  it('refuses a secret shorter than 32 characters', () => {
    process.env.CRON_SECRET = 'short';
    const c = contextWithHeaders({ Authorization: 'Bearer short' });
    expect(assertCron(c).status).toBe(503);
  });

  it('rejects a wrong secret with 401', () => {
    process.env.CRON_SECRET = 'a'.repeat(40);
    const c = contextWithHeaders({ Authorization: 'Bearer ' + 'b'.repeat(40) });
    expect(assertCron(c).status).toBe(401);
  });

  it('accepts the configured secret via Authorization and x-cron-secret', () => {
    process.env.CRON_SECRET = 'a'.repeat(40);
    expect(assertCron(contextWithHeaders({ Authorization: 'Bearer ' + 'a'.repeat(40) }))).toBeNull();
    expect(assertCron(contextWithHeaders({ 'x-cron-secret': 'a'.repeat(40) }))).toBeNull();
  });
});

describe('getClientIp (H-03: rate-limit bucket spoofing)', () => {
  it('ignores a client-supplied x-real-ip', () => {
    const c = contextWithHeaders({ 'x-real-ip': '1.2.3.4' });
    expect(getClientIp(c)).not.toBe('1.2.3.4');
    expect(getClientIp(c)).toBe('unknown');
  });

  it('prefers the platform-authoritative x-vercel-forwarded-for', () => {
    const c = contextWithHeaders({
      'x-vercel-forwarded-for': '203.0.113.7',
      'x-real-ip': '1.2.3.4',
      'x-forwarded-for': '9.9.9.9, 203.0.113.7',
    });
    expect(getClientIp(c)).toBe('203.0.113.7');
  });

  it('takes the rightmost x-forwarded-for entry, not the caller-prepended one', () => {
    const c = contextWithHeaders({ 'x-forwarded-for': '1.2.3.4, 198.51.100.5' });
    expect(getClientIp(c)).toBe('198.51.100.5');
  });

  it('does not fall back to a loopback address that shares a bucket with local traffic', () => {
    expect(getClientIp(contextWithHeaders({}))).toBe('unknown');
  });
});

describe('escapeHtml (H-04 / M-08: HTML injection into outbound mail)', () => {
  it('neutralises a script tag', () => {
    expect(escapeHtml('<script>alert(1)</script>'))
      .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('neutralises an anchor used for phishing', () => {
    const injected = '<a href="https://evil.tld">Re-authenticate</a>';
    const escaped = escapeHtml(injected);
    expect(escaped).not.toContain('<a href');
    expect(escaped).toContain('&lt;a href=&quot;');
  });

  it('escapes attribute-breaking quotes', () => {
    expect(escapeHtml(`" onload="alert(1)`)).toBe('&quot; onload=&quot;alert(1)');
  });

  it('renders null and undefined as empty rather than the literal words', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('validateSyncPayload (M-04: Firestore document-path injection)', () => {
  const base = { event: 'open', positionId: '12345', symbol: 'XAUUSD' };

  it('accepts a well-formed payload', () => {
    expect(validateSyncPayload(base)).not.toBeNull();
  });

  it('rejects a positionId containing a path separator', () => {
    expect(validateSyncPayload({ ...base, positionId: 'a/deep/b' })).toBeNull();
  });

  it('rejects a positionId containing traversal segments', () => {
    expect(validateSyncPayload({ ...base, positionId: '../../users' })).toBeNull();
  });

  it('rejects an over-long positionId', () => {
    expect(validateSyncPayload({ ...base, positionId: 'a'.repeat(65) })).toBeNull();
  });

  it('rejects a non-string positionId', () => {
    expect(validateSyncPayload({ ...base, positionId: { toString: () => 'x' } })).toBeNull();
    expect(validateSyncPayload({ ...base, positionId: ['a'] })).toBeNull();
  });

  it('rejects an unknown event', () => {
    expect(validateSyncPayload({ ...base, event: 'delete' })).toBeNull();
    expect(validateSyncPayload({ ...base, event: undefined })).toBeNull();
  });

  it('rejects an over-long symbol and an over-long comment', () => {
    expect(validateSyncPayload({ ...base, symbol: 'X'.repeat(21) })).toBeNull();
    expect(validateSyncPayload({ ...base, comment: 'c'.repeat(501) })).toBeNull();
  });

  it('clamps numeric fields instead of trusting them', () => {
    const payload = validateSyncPayload({ ...base, lots: 1e9, profit: 1e12, price: -5 });
    expect(payload.lots).toBe(1000);
    expect(payload.profit).toBe(10_000_000);
    expect(payload.price).toBe(0);
  });

  it('coerces a non-finite number to zero rather than writing NaN', () => {
    const payload = validateSyncPayload({ ...base, lots: 'not-a-number' });
    expect(payload.lots).toBe(0);
  });

  it('normalises direction to BUY or SELL only', () => {
    expect(validateSyncPayload({ ...base, direction: 'sell' }).direction).toBe('SELL');
    expect(validateSyncPayload({ ...base, direction: 'nonsense' }).direction).toBe('BUY');
  });

  it('preserves every field the trade service consumes', () => {
    // Guards against a validator that silently drops an input the downstream
    // writer still reads — openPrice feeds the pips calculation on a close
    // event that has no prior open record.
    const payload = validateSyncPayload({
      ...base, event: 'close', openPrice: 2400.5, price: 2410, lots: 0.1,
      profit: 95, commission: -2, swap: -1, ticket: 'T1', time: '2026-08-16T10:00:00Z',
      comment: 'ok', source: 'mt5',
    });
    for (const field of ['positionId', 'symbol', 'direction', 'lots', 'price',
      'openPrice', 'profit', 'commission', 'swap', 'comment', 'ticket', 'time', 'source']) {
      expect(payload[field], `missing ${field}`).toBeDefined();
    }
    expect(payload.openPrice).toBe(2400.5);
  });

  it('leaves openPrice undefined when the caller omits it', () => {
    expect(validateSyncPayload(base).openPrice).toBeUndefined();
  });
});

describe('isValidUid / isValidAccountId (M-03 / M-04: path-shaped identifiers)', () => {
  it('accepts a normal Firebase UID', () => {
    expect(isValidUid('rbGsMM2A2EdhgKLKLf9y0dGJ7RY2')).toBe(true);
  });

  it('rejects identifiers containing a path separator', () => {
    expect(isValidUid('abc/def')).toBe(false);
    expect(isValidAccountId('broker_1/nested/doc')).toBe(false);
  });

  it('rejects empty and non-string values', () => {
    expect(isValidUid('')).toBe(false);
    expect(isValidUid(null)).toBe(false);
    expect(isValidUid(42)).toBe(false);
  });
});

describe('timingSafeHexEqual (M-03: webhook signature comparison)', () => {
  it('returns true only for an exact match', () => {
    expect(timingSafeHexEqual('abc123', 'abc123')).toBe(true);
    expect(timingSafeHexEqual('abc123', 'abc124')).toBe(false);
  });

  it('returns false on a length mismatch instead of throwing', () => {
    expect(() => timingSafeHexEqual('abc', 'abcdef')).not.toThrow();
    expect(timingSafeHexEqual('abc', 'abcdef')).toBe(false);
  });
});

describe('hashToken (M-02: API keys stored as document ids)', () => {
  it('produces a stable 64-char hex digest that is not the input', () => {
    const key = 'xau_' + 'ab'.repeat(24);
    const hashed = hashToken(key);
    expect(hashed).toMatch(/^[0-9a-f]{64}$/);
    expect(hashed).not.toContain(key);
    expect(hashToken(key)).toBe(hashed);
  });

  it('produces different digests for different keys', () => {
    expect(hashToken('xau_a')).not.toBe(hashToken('xau_b'));
  });
});
