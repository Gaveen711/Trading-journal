#!/usr/bin/env node
/**
 * Grants or revokes the `admin` custom claim.
 *
 *   node scripts/grant-admin.mjs <uid-or-email>            # grant
 *   node scripts/grant-admin.mjs <uid-or-email> --revoke   # revoke
 *   node scripts/grant-admin.mjs --list           # who currently has it
 *
 * The server-side admin API requires this claim in addition to the exact,
 * verified admin email. Firestore rules deliberately grant no direct browser
 * admin access, so API validation and audit logging cannot be bypassed.
 *
 * The claim reaches the client on the next ID-token refresh (within an hour, or
 * immediately after signing out and back in).
 *
 * Reads FIREBASE_SERVICE_ACCOUNT from .env.local, the same value the API uses.
 */
import dotenv from 'dotenv';

// Secrets live in .env.local (gitignored; `vercel env pull` writes it), which
// dotenv does not read by default. .env is loaded after as a fallback and does
// not override values already set. Both run before importing _firebase.js,
// which reads the environment when initAdmin() is called.
dotenv.config({ path: '.env.local' });
dotenv.config();

// Reuse the API's initialiser rather than re-implementing credential parsing.
// That value round-trips through Vercel and .env quoting, which mangles both
// the inner quotes and the private key's newlines; _firebase.js already
// normalises it, and a second copy of that logic is how implementations drift.
const { admin, isDbReady } = await import('../api/_firebase.js');

const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const list = args.includes('--list');
const identity = args.find((a) => !a.startsWith('--'));
const ADMIN_EMAIL = 'admin@xaujournal.com';
const ADMIN_UID = 'rbGsMM2A2EdhgKLKLf9y0dGJ7RY2';

if (!isDbReady()) {
  console.error('Firebase Admin failed to initialise. Check FIREBASE_SERVICE_ACCOUNT in .env.local.');
  console.error('Refresh it with: vercel env pull .env.local');
  process.exit(1);
}

async function main() {
  if (list) {
    const admins = [];
    let pageToken;
    do {
      const page = await admin.auth().listUsers(1000, pageToken);
      page.users.forEach((user) => {
        if (user.customClaims?.admin === true) admins.push(`${user.uid}  ${user.email || '(no email)'}`);
      });
      pageToken = page.pageToken;
    } while (pageToken);

    if (!admins.length) {
      console.log('No account currently holds the admin claim.');
      console.log(`Grant the designated admin account with: node scripts/grant-admin.mjs ${ADMIN_UID}`);
    } else {
      console.log(`${admins.length} admin account(s):`);
      admins.forEach((entry) => console.log('  ' + entry));
    }
    return;
  }

  if (!identity) {
    console.error('Usage: node scripts/grant-admin.mjs <uid-or-email> [--revoke]');
    console.error('       node scripts/grant-admin.mjs --list');
    process.exitCode = 1;
    return;
  }

  const user = identity.includes('@')
    ? await admin.auth().getUserByEmail(identity)
    : await admin.auth().getUser(identity);

  if (user.uid !== ADMIN_UID) {
    throw new Error(`Admin access may only be changed for UID ${ADMIN_UID}.`);
  }
  if (!revoke && user.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error(`Admin access may only be granted to ${ADMIN_EMAIL} (${ADMIN_UID}).`);
  }
  if (!revoke && user.emailVerified !== true) {
    throw new Error(`Verify ${ADMIN_EMAIL} in Firebase Auth before granting admin access.`);
  }

  await admin.auth().setCustomUserClaims(user.uid, revoke ? { admin: false } : { admin: true });

  console.log(`${revoke ? 'Revoked' : 'Granted'} admin for ${user.email || user.uid}.`);
  console.log('Takes effect on the next ID-token refresh — sign out and back in to apply now.');
  if (!revoke) {
    console.log('\nEnable multi-factor authentication on this account: it can read every user record.');
  }
}

// Windows: process.exit() straight after network I/O can abort the process
// (libuv async-handle assertion), so set exitCode and let Node drain.
main().catch((error) => {
  console.error('Failed:', error.message);
  process.exitCode = 1;
});
