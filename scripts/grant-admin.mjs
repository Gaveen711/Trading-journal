#!/usr/bin/env node
/**
 * Grants or revokes the `admin` custom claim.
 *
 *   node scripts/grant-admin.mjs <uid>            # grant
 *   node scripts/grant-admin.mjs <uid> --revoke   # revoke
 *   node scripts/grant-admin.mjs --list           # who currently has it
 *
 * firestore.rules trusts `request.auth.token.admin == true` and nothing else.
 * It used to also trust a hardcoded UID, which meant admin access could not be
 * withdrawn without editing and redeploying the rules — no off-switch during an
 * incident. A claim is revoked by rerunning this with --revoke.
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
const uid = args.find((a) => !a.startsWith('--'));

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
      console.log('Grant one with: node scripts/grant-admin.mjs <uid>');
    } else {
      console.log(`${admins.length} admin account(s):`);
      admins.forEach((entry) => console.log('  ' + entry));
    }
    return;
  }

  if (!uid) {
    console.error('Usage: node scripts/grant-admin.mjs <uid> [--revoke]');
    console.error('       node scripts/grant-admin.mjs --list');
    process.exitCode = 1;
    return;
  }

  const user = await admin.auth().getUser(uid);
  await admin.auth().setCustomUserClaims(uid, revoke ? { admin: false } : { admin: true });

  console.log(`${revoke ? 'Revoked' : 'Granted'} admin for ${user.email || uid}.`);
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
