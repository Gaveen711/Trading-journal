 # XAU Journal Admin

Standalone Vite application for the private XAU Journal control room at
`https://admin.xaujournal.com`. This directory is deployed as its own Vercel
project; it is not bundled into the customer-facing application.

## Repository commands

Run these from the repository root:

```powershell
npm run dev        # public site on http://localhost:5173
npm run dev:admin  # admin UI on 4174 plus local admin API on 3000
npm run deploy     # build and deploy both Vercel projects to production
```

`npm run deploy` deploys the public project first (including its `/api` routes),
then the separate admin project. It does not deploy Firebase functions or rules;
use `npm run deploy:all -- --prod --with-firebase` only when that additional
Firebase deployment is intentionally required.

## Local development

Local data does not wait for an admin deployment. It follows this request path:

```text
browser http://127.0.0.1:4174/api/admin/*
  -> admin Vite proxy
  -> local Vercel runtime http://127.0.0.1:3000/api/admin/*
  -> Firebase Auth and Firestore through the local serverless function
```

If the admin Vite process or local Vercel runtime is missing, the admin shell can
still render while users and analytics fail. Use fixed ports so the UI cannot
silently connect to a different process.

1. Copy the Firebase **web-client** values into `admin-dashboard/.env.local`.
   Keep `VITE_ADMIN_DEV_API_BASE_URL=/api/admin`. Never put an Admin SDK key,
   service-account JSON, private key, or bearer token in that client env file or
   any `VITE_*` variable. The gitignored, server-only root `.env.local` must
   provide `FIREBASE_SERVICE_ACCOUNT` for the local API runtime.
2. Install once: `npm ci`, then `npm ci --prefix admin-dashboard`.
3. At the repository root, start the admin UI and local serverless API together:

   ```powershell
   npm run dev:admin
   ```

   `Ctrl+C` stops both processes. For diagnostics, `npm run dev:api` starts only
   the local API and `npm run admin:dev` starts only the admin Vite process.

4. The public site remains a separate command:

   ```powershell
   npm run dev
   ```

5. Open `http://127.0.0.1:4174/login`. Do not use `vite preview` to test the
   local proxy: preview serves the production build and does not use the dev
   server proxy.
6. Verify the shell and unauthenticated route boundary:

   ```powershell
   npm --prefix admin-dashboard run smoke:local -- --route-only
   ```

7. Verify the authenticated health endpoint:

   ```powershell
   npm --prefix admin-dashboard run smoke:local
   ```

   The smoke checker prompts for a short-lived Firebase ID token with hidden
   input, sends it only to the loopback admin origin, rejects redirects, and
   never prints it. `ADMIN_SMOKE_ID_TOKEN` is also accepted for controlled CI,
   but interactive input is safer for local work.

`vercel dev` executes the repository's current `api/` source locally, so an API
change can be tested before deployment. It still uses the configured Firebase
project: reads and mutations can touch real data unless the local Vercel/Firebase
environment points to staging. The launcher enables a process-local admin rate
limiter when Vercel KV is absent; that fallback is rejected in production, where
admin mutations continue to fail closed if KV is unavailable. Running plain root
`npm run dev` on port 5173 is for the public UI and proxies `/api` to
`VITE_API_TARGET`; it is not a local
serverless runtime and is not the admin default.

### Proxy overrides and diagnostics

The safe default is `ADMIN_DEV_PROXY_TARGET=http://127.0.0.1:3000`. This is a
server-only Vite variable and is not exposed to browser code. The target must be
a bare origin: no path, query, fragment, username, or password. Plain HTTP is
accepted only for loopback hosts.

For an exceptional direct HTTPS proxy target, set its exact hostname in
`ADMIN_DEV_PROXY_ALLOWED_HOSTS`; wildcards are not supported. Prefer the chained
local topology above because it keeps bearer tokens same-origin in the browser.
An absolute `VITE_ADMIN_DEV_API_BASE_URL` bypasses the admin proxy, but its
non-loopback hostname must still appear exactly in
`ADMIN_DEV_PROXY_ALLOWED_HOSTS`. The direct API must also end in `/api/admin`
and have a correct API CORS allowlist. These checks prevent a modified local
environment from sending an admin bearer token to an unapproved HTTPS host.

At startup, the admin Vite server prints its selected topology. The smoke check
then separates the common failure modes:

- UI failure: port 4174 is not serving the React shell.
- API route failure: the local Vercel runtime on port 3000 is missing, or
  `/api/admin/health` is not mounted.
- HTTP 401/403 during authenticated smoke: the API is reachable but the token,
  admin claim, verified email, or exact admin identity was rejected.
- HTTP 2xx: both the proxy chain and authenticated API boundary are working.

The admin client imports Firebase Auth only. It does not initialize Firestore
and must not write directly to Firestore. Data-changing operations belong behind
the authenticated admin API.

## Admission policy

The client admits a session only when all four checks pass:

- the Firebase UID is exactly `rbGsMM2A2EdhgKLKLf9y0dGJ7RY2`;
- the Firebase email is exactly `admin@xaujournal.com`;
- the email and token `email_verified` value are verified;
- the ID token has the custom claim `admin === true`.

These checks improve the user experience but are not an authorization boundary.
Every `/api/admin` handler must verify the Firebase ID token server-side and
repeat all four checks before reading or mutating data. Firestore rules deny
dashboard access from browser SDKs; the server API uses the Admin SDK and is the
only dashboard data boundary. The UID is an in-source defence-in-depth check;
never place it in a `VITE_*` environment variable or treat it as a secret.

Authentication uses browser-session persistence, accepts password-only sign-in,
and signs out after the configured idle period (15 minutes by default,
clamped to 5–60 minutes). A Firebase custom-claim change becomes visible after
an ID-token refresh; signing out and back in forces a fresh token. User-changing
API operations also require an `auth_time` no older than ten minutes. Until an
in-place reauthentication screen is added, sign out and sign back in before a
mutation when the dashboard reports `RECENT_AUTH_REQUIRED`.

## Admin API and CORS

Production defaults to `https://www.xaujournal.com/api/admin`; set
`VITE_ADMIN_API_BASE_URL=https://www.xaujournal.com/api/admin` explicitly in the
Vercel Production environment. The authenticated client sends a Firebase bearer
token in `Authorization` and sends JSON request bodies with `Content-Type:
application/json`.

CORS must be implemented on the `www.xaujournal.com` admin API routes, not on
this static project. Apply it only under `/api/admin`:

- allow `https://admin.xaujournal.com` in production;
- allow the explicit localhost admin origins used in development, such as
  `http://localhost:4174` and `http://127.0.0.1:4174`;
- compare the request `Origin` against that exact allowlist and echo it only on
  a match; never use `*`;
- answer `OPTIONS` preflight requests and allow only the methods each route
  needs;
- allow the `Authorization`, `Content-Type`, and `X-Request-Id` request headers;
- expose `X-Request-Id` and `Retry-After` so browser diagnostics can correlate failures;
- emit `Vary: Origin` on CORS responses;
- reject disallowed origins before route logic executes.

## Vercel project settings

Create a separate Vercel project with these settings:

- Root Directory: `admin-dashboard`
- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Domain: `admin.xaujournal.com`

Add every variable from `.env.example` to the appropriate Vercel environment.
Firebase web values are public client identifiers; never add an Admin SDK key,
service-account JSON, private key, or admin UID list to `VITE_*` variables.

Add `admin.xaujournal.com` to Firebase Authentication's authorized domains.
Keep localhost authorized only for development needs.

`vercel.json` provides SPA fallback routing, `X-Robots-Tag`, no-store caching,
and restrictive browser security headers. Validate the CSP after adding any new
external resource; do not loosen it globally to solve a single integration.

## Integration barrels

Authentication and Firebase exports are available from `src/auth` and
`src/firebase`. `src/App.tsx` consumes `AdminShell` and `LoadingState` from
`src/components/index.ts` and lazy-loads conventional named exports from
`src/pages/index.ts` for all feature routes.
