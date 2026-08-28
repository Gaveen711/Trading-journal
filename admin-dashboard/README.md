# XAU Journal Admin

Standalone Vite application for the private XAU Journal control room at
`https://admin.xaujournal.com`. This directory is deployed as its own Vercel
project; it is not bundled into the customer-facing application.

## Local development

1. Copy `.env.example` to `.env.local` and fill in the Firebase web-app values.
2. Keep `VITE_ADMIN_DEV_API_BASE_URL=/api/admin` for local development. The
   admin Vite server proxies that path to the public Vite server on port 5173.
3. Run `npm ci` at the repository root and `npm ci --prefix admin-dashboard` once.
4. Start the public app with `npm run dev` in one terminal.
5. Start the admin app with `npm run admin:dev` in another terminal.
6. Open `http://localhost:4174/login` for the admin and `http://localhost:5173/`
   for the public app.

The public Vite proxy uses `VITE_API_TARGET` from the root environment and may
point at a deployed backend by default. For authenticated local data, set that
variable to a safe Vercel preview backend after deploying the public project.
Treat local admin mutations as real data changes unless that target is
explicitly a staging project. Without a safe backend target, use the local
screen for layout and read-only checks only.

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
an ID-token refresh; signing out and back in forces a fresh token.

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
- allow the `Authorization` and `Content-Type` request headers;
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
