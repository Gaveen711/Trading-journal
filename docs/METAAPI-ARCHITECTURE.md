# XAU Journal × MetaApi — Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  XAU Journal (React / Vite)                                     │
│  • User: server, account ID, password, MT4/MT5                  │
│  • Firebase Auth ID token only — never sees METAAPI_TOKEN       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + Bearer <Firebase ID token>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (pick one — same responsibilities)                     │
│  A) Vercel API  →  /api/connect-broker  (current default)       │
│  B) Firebase CF →  connectBroker callable (optional)            │
│  • METAAPI_TOKEN in env only                                    │
│  • Verify Firebase ID token → uid                               │
│  • Pro plan gate                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │ MetaApi REST / RPC SDK
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  MetaApi Cloud                                                  │
│  • createAccount → deploy → waitConnected                       │
│  • getDealsByTimeRange (closed deals)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │ MT4/MT5 protocol
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Broker server (IC Markets, Exness, FTMO, …)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ normalized deals
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Firestore                                                      │
│  users/{uid}/brokerAccounts/{id}  — connection metadata         │
│  users/{uid}/trades/{id}          — journal entries             │
└─────────────────────────────────────────────────────────────────┘
```

## Security rule

| Data | Where it lives |
|------|----------------|
| `METAAPI_TOKEN` | Vercel env or Firebase Functions config **only** |
| MT password | Sent once over HTTPS → encrypted in Firestore → used server-side for MetaApi |
| Firebase ID token | Client → backend on every request |

Never put `METAAPI_TOKEN` in `VITE_*` or client bundle.

## UI flow (Sync page)

1. User opens **App → Sync → Broker Login** tab (`MT5SyncSetup` → `BrokerConnect`).
2. Selects platform (MT4/MT5), broker preset or custom server, login, password.
3. Clicks **Connect & sync** → loading state (1–3 min first time).
4. Backend provisions MetaApi account, pulls last ~90 days of closed deals.
5. Success toast → trades appear in journal via Firestore listener (`useTrades`).

## Firestore schema

### `users/{uid}/brokerAccounts/{accountId}`

```js
{
  accountName: "ICMarketsSC-Demo · 12345678",
  brokerType: "mt5",
  server: "ICMarketsSC-Demo",
  login: "12345678",
  encryptedPassword: "<base64>",      // upgrade to KMS in production
  metaApiAccountId: "<metaapi-uuid>",
  isActive: true,
  lastSyncTime: Timestamp,
  lastSyncStatus: "success" | "failed" | "pending",
  tradeCount: 42,
  createdAt, updatedAt
}
```

### `users/{uid}/trades/{tradeId}`

Broker-synced docs use id `broker_{accountId}_{dealTicket}` and fields aligned with manual trades (`date`, `pnl`, `lots`, `market: "GOLD"`, `source: "BROKER_METAAPI"`, …).

## Backend (Firebase Cloud Functions)

| Callable | Purpose |
|----------|---------|
| `connectBroker` | Create/reuse MetaApi account, save `metaApiAccountId` on user doc, initial sync |
| `syncBrokerTrades` | Re-pull closed deals (last 90 days) |

Client: `BrokerConnect.jsx` → `httpsCallable('connectBroker')` — **never** sends `META_API_TOKEN`.

Legacy Vercel routes (`/api/connect-broker`) still exist but are not used when Functions are deployed.

## Environment variables

```bash
# Server only (Vercel + Firebase Functions)
META_API_TOKEN=...

# Client (Vite)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=auth.xaujournal.com
VITE_FIREBASE_PROJECT_ID=xaujournal-0429
```

## Deploy checklist

1. [MetaApi](https://app.metaapi.cloud) — create token, enable API access.
2. Vercel — add `METAAPI_TOKEN` to project env, redeploy.
3. Firebase Console — Auth authorized domains: `xaujournal.com`, `www.xaujournal.com`, `localhost`.
4. (Optional) Deploy Functions: `cd functions && npm i && firebase deploy --only functions`.
5. Cron: `api/cron/broker-sync-poller.js` for periodic re-sync (Vercel cron).

## Code map

| Layer | File |
|-------|------|
| UI | `src/components/BrokerConnect.jsx` |
| MetaApi logic | `api/metaapi-broker.js` |
| Connect API | `api/connect-broker.js` |
| Ongoing sync | `api/broker-login-sync.js` |
| Firebase CF | `functions/index.js` — `connectBroker`, `syncBrokerTrades` |
