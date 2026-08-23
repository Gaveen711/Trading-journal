// The profile menu was duplicating navigation: Broker sync and Settings are
// both one click away in the sidebar, so the menu spent two of its four rows
// repeating them. It now carries what has no home in the nav — who you are
// signed in as, and the wallet.
//
// Rendering DashboardLayout would mean standing up auth, the DI container and
// four Firestore listeners, so this asserts the menu's contract against the
// source, the same way the sidebar wiring suite next to it does.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const LAYOUT = 'src/components/layout/DashboardLayout.jsx';

/** Strips `//` line comments so prose about a removed item cannot be counted. */
const withoutComments = (source) => source.replace(/^[ \t]*\/\/.*$/gm, '');

/** The body of `renderProfileMenu`, up to the notifications menu that follows it. */
function profileMenuSource() {
  const source = withoutComments(readFileSync(LAYOUT, 'utf8'));
  const start = source.indexOf('const renderProfileMenu =');
  expect(start, 'renderProfileMenu not found').toBeGreaterThan(-1);
  const end = source.indexOf('const notificationsMenu =', start);
  expect(end, 'notificationsMenu not found after renderProfileMenu').toBeGreaterThan(start);
  return source.slice(start, end);
}

describe('DashboardLayout — profile menu', () => {
  it('carries the identity block: avatar, name, email and plan', () => {
    const menu = profileMenuSource();
    expect(menu).toContain('userInitial');
    expect(menu).toContain('displayName');
    expect(menu).toContain('auth.currentUser?.email');
    expect(menu).toContain('planBadgeLabel');
  });

  it('shows the wallet balance and offers a top-up', () => {
    const menu = profileMenuSource();
    expect(menu).toContain('Wallet balance');
    expect(menu).toContain('formatCurrency(walletBalance');
    expect(menu).toContain('setWalletTopUpOpen(true)');
  });

  it('no longer repeats sidebar destinations', () => {
    const menu = profileMenuSource();
    // The nav owns these two; the menu linking to them again was the reason
    // it had nothing of its own to say.
    expect(menu).not.toContain("navigate('/app/sync')");
    expect(menu).not.toContain("navigate('/app/settings')");
  });

  it('keeps the two actions that are not navigation', () => {
    const menu = profileMenuSource();
    expect(menu).toContain('openPortal()');
    expect(menu).toContain('handleSignOut');
  });

  it('mounts one wallet dialog for the whole layout, not one per menu copy', () => {
    // renderProfileMenu runs twice — sidebar footer and mobile header — so a
    // dialog inside it would mount twice and fight over the same open state.
    const source = withoutComments(readFileSync(LAYOUT, 'utf8'));
    expect(source.match(/<WalletTopUpDialog/g) ?? []).toHaveLength(1);
    expect(profileMenuSource()).not.toContain('<WalletTopUpDialog');
  });
});

describe('SettingsPage — wallet moved out', () => {
  it('no longer owns a wallet card or the balance write', () => {
    const settings = withoutComments(readFileSync('src/pages/SettingsPage.jsx', 'utf8'));
    // Two entry points writing the same balance is how they drift apart.
    expect(settings).not.toContain('useSessionWallet');
    expect(settings).not.toContain('updateBalance');
    expect(settings).not.toContain('title="Wallet"');
  });
});
