import { describe, expect, it } from 'vitest';
import { getEntitlements, hasPaidAccess, isPaidPlan } from './entitlements.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-08-17T12:00:00Z');

describe('hasPaidAccess', () => {
  it('grants lifetime pro with no expiry', () => {
    expect(hasPaidAccess({ plan: 'pro' }, NOW)).toBe(true);
  });

  it('grants pro with a future expiry and denies a lapsed one', () => {
    expect(hasPaidAccess({ plan: 'pro', planExpiry: new Date(NOW + DAY).toISOString() }, NOW)).toBe(true);
    expect(hasPaidAccess({ plan: 'pro', planExpiry: new Date(NOW - DAY).toISOString() }, NOW)).toBe(false);
  });

  it('grants grace only while graceUntil is in the future', () => {
    expect(hasPaidAccess({ plan: 'grace', graceUntil: new Date(NOW + DAY).toISOString() }, NOW)).toBe(true);
    expect(hasPaidAccess({ plan: 'grace', graceUntil: new Date(NOW - DAY).toISOString() }, NOW)).toBe(false);
    expect(hasPaidAccess({ plan: 'grace' }, NOW)).toBe(false);
  });

  it('honors a server-written graceUntil on an expired pro plan', () => {
    const userDoc = {
      plan: 'pro',
      planExpiry: new Date(NOW - DAY).toISOString(),
      graceUntil: new Date(NOW + DAY).toISOString(),
    };
    expect(hasPaidAccess(userDoc, NOW)).toBe(true);
  });

  it('denies free plans and empty docs', () => {
    expect(hasPaidAccess({ plan: 'free' }, NOW)).toBe(false);
    expect(hasPaidAccess({}, NOW)).toBe(false);
    expect(hasPaidAccess(null, NOW)).toBe(false);
  });
});

describe('isPaidPlan', () => {
  it('trusts the expiry-validated plan strings published by useSubscription', () => {
    expect(isPaidPlan('pro')).toBe(true);
    expect(isPaidPlan('grace')).toBe(true);
    expect(isPaidPlan('free')).toBe(false);
    expect(isPaidPlan(undefined)).toBe(false);
  });
});

describe('getEntitlements', () => {
  it('gives grace users the same paid affordances as pro', () => {
    const grace = getEntitlements({ plan: 'grace', graceUntil: new Date(NOW + DAY).toISOString() }, NOW);
    expect(grace.isPaid).toBe(true);
    expect(grace.canExportCsv).toBe(true);
    expect(grace.canSyncBroker).toBe(true);
    expect(grace.isGrace).toBe(true);
  });

  it('reports lapsed accounts as unpaid without grace', () => {
    const lapsed = getEntitlements({ plan: 'pro', planExpiry: new Date(NOW - DAY).toISOString() }, NOW);
    expect(lapsed.isPaid).toBe(false);
    expect(lapsed.canExportCsv).toBe(false);
  });
});
