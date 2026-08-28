# Admin console operations

## Security invariant

Admin access requires all four checks:

1. Firebase Authentication UID is exactly `rbGsMM2A2EdhgKLKLf9y0dGJ7RY2`.
2. Firebase Authentication reports a verified email.
3. The normalized email is exactly `admin@xaujournal.com`.
4. The ID token contains the custom claim `admin: true`.

The browser check exists only to present the correct screen. Every `/api/admin`
request repeats the checks with the Firebase Admin SDK. Firestore rules deny
direct client access to administrative data and mutations.

## Grant or revoke access

The account must already exist and be verified in Firebase Authentication.

```powershell
npm run admin:grant -- rbGsMM2A2EdhgKLKLf9y0dGJ7RY2
npm run admin:list
npm run admin:grant -- rbGsMM2A2EdhgKLKLf9y0dGJ7RY2 --revoke
```

Sign out and back in after a claim change so Firebase issues a fresh ID token.
Require multi-factor authentication on this account before production use.

## Vercel projects

The repository is deployed twice:

- Public product: repository root, existing build, `www.xaujournal.com`.
- Admin console: root directory `admin-dashboard`, build command `npm run build`, output
  directory `dist`, domain `admin.xaujournal.com`.

The admin project needs the public Firebase web configuration and:

```text
VITE_ADMIN_API_BASE_URL=https://www.xaujournal.com/api/admin
```

Never add a service account or an admin UID list to `VITE_*` variables. Vite
embeds those values in the browser bundle.

Add `admin.xaujournal.com` to Firebase Authentication's authorized domains.
The public API allows that exact origin for `/api/admin` and does not use a
wildcard CORS policy.

## Deployment order

1. Deploy the main API and canonical `firestore.rules` from this repository.
2. Grant the verified account's claim and sign in again.
3. Deploy the `admin-dashboard` Vercel project and attach `admin.xaujournal.com`.
4. Verify a non-admin account is rejected and no admin module appears in the
   public site's production bundle.
5. Verify each mutation records an `adminAuditLogs` document.

From the repository root, the deployment wrapper builds and deploys both
Vercel projects. Preview is the default; production requires `--prod`:

```powershell
npm run deploy:all -- --preview
npm run deploy:all -- --prod
npm run deploy:all -- --prod --with-firebase
```

The admin Vercel project must be linked once from `admin-dashboard/`, or the deployment
shell must have `VERCEL_ADMIN_PROJECT_ID` and `VERCEL_ADMIN_ORG_ID` set. Recent Vercel
CLI versions may keep that Git-aware link outside `.vercel/project.json`. Use
`--with-firebase` when the public API, Cloud Functions, Firestore rules, and
Storage rules also need deployment. Do not use `--with-firebase` until the
Firebase project and credentials are confirmed.

For local authenticated data, set the root `VITE_API_TARGET` to the public
Vercel preview URL, then start both Vite servers. The local admin client uses
`http://localhost:4174/api/admin`, which proxies through the public dev server
on port 5173 to that safe preview backend. Do not point it at production while
testing destructive actions.

## Retiring the old repository

Keep `D:\xaujournal-admin` unchanged until the new console passes production
verification. It must not deploy its copied Firestore rules. After cutover,
archive the repository and remove its Vercel deployment and environment access;
do not use it as a second source of truth.
