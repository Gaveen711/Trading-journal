import { describe, it, expect, afterEach, vi } from 'vitest';

// assertEmailVerified/isEmailVerificationEnforced never touch Firebase; mock the
// admin module so importing _auth.ts does not pull in firebase-admin.
vi.mock('./_firebase.js', () => ({ admin: { auth: () => ({}) } }));

import { assertEmailVerified, isEmailVerificationEnforced } from './_auth.ts';

/**
 * Regression tests for email-verification enforcement (the deferral fix).
 *
 * The load-bearing guarantee is grandfathering: turning enforcement on must
 * never lock out an account that predates verification. That is asserted first
 * and most thoroughly, because getting it wrong locks paying customers out of
 * broker sync mid-subscription.
 */

/** Minimal context: emailVerified comes from c.get, and c.json records the reply. */
const ctx = (emailVerified) => {
  const store = { emailVerified };
  return {
    get: (key) => store[key],
    json: (body, status) => ({ body, status }),
  };
};

describe('assertEmailVerified — grandfathering (existing users never locked out)', () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;
  afterEach(() => {
    if (original === undefined) delete process.env.REQUIRE_EMAIL_VERIFICATION;
    else process.env.REQUIRE_EMAIL_VERIFICATION = original;
  });

  it('lets a legacy unverified account through (no requiresEmailVerification flag)', () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION; // enforcement ON by default
    // A pre-verification account: unverified email, but never flagged.
    const legacy = { plan: 'pro', requiresEmailVerification: undefined };
    expect(assertEmailVerified(ctx(false), legacy)).toBeNull();
  });

  it('lets a legacy account through even with the flag explicitly false', () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(assertEmailVerified(ctx(false), { requiresEmailVerification: false })).toBeNull();
  });

  it('lets any account through when userData is missing', () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(assertEmailVerified(ctx(false), null)).toBeNull();
    expect(assertEmailVerified(ctx(false), undefined)).toBeNull();
  });
});

describe('assertEmailVerified — new accounts are gated', () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;
  afterEach(() => {
    if (original === undefined) delete process.env.REQUIRE_EMAIL_VERIFICATION;
    else process.env.REQUIRE_EMAIL_VERIFICATION = original;
  });

  it('blocks a flagged account whose email is not verified', () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    const result = assertEmailVerified(ctx(false), { requiresEmailVerification: true });
    expect(result).not.toBeNull();
    expect(result.status).toBe(403);
    expect(result.body.code).toBe('email-unverified');
  });

  it('lets a flagged account through once its email is verified', () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(assertEmailVerified(ctx(true), { requiresEmailVerification: true })).toBeNull();
  });
});

describe('isEmailVerificationEnforced — default on, disable-able', () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;
  afterEach(() => {
    if (original === undefined) delete process.env.REQUIRE_EMAIL_VERIFICATION;
    else process.env.REQUIRE_EMAIL_VERIFICATION = original;
  });

  it('is on by default', () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(isEmailVerificationEnforced()).toBe(true);
  });

  it('is off only when explicitly set to the string "false"', () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'false';
    expect(isEmailVerificationEnforced()).toBe(false);
  });

  it('when disabled, never gates even a flagged unverified account', () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'false';
    expect(assertEmailVerified(ctx(false), { requiresEmailVerification: true })).toBeNull();
  });
});
