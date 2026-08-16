---
name: run-xaujournal
description: Run, drive, and smoke-test the xaujournal web app (Vite + React + Firebase). Use when asked to run, start, or launch the dev server, screenshot or verify a page, or confirm a change works in the running app.
---

# Run xaujournal (dev)

xaujournal is a single-project Vite 6 + React 19 SPA (Firebase auth + Firestore; gold-trading journal). Dev server: `npm run dev` on port 5173. Agents drive it through the Codex Browser pane (`preview_start` reads `.Codex/launch.json`); the headless harness is `smoke.mjs` next to this file. All paths below are relative to the repo root.

## Prerequisites

- Node 18+ and `npm install`.
- `.env.local` at repo root with the Firebase web config: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Optional: `VITE_LEMON_SQUEEZY_CHECKOUT_URL_MONTHLY/_YEARLY`, `VITE_CURRENCY_API_KEY`, `VITE_API_TARGET`. Present on this machine — the SPA shell serves without them, but auth/data calls fail.

## Run (agent path)

1. `preview_start {name: "xaujournal-dev"}`.
   - If it errors with `Port 5173 is in use by "node.exe" … (not a preview server)`, the user's own `npm run dev` is already running. **Attach instead — do not kill their process:** `preview_start {url: "http://localhost:5173"}`.
2. Headless smoke check (4 checks, exit 0 = pass):

```bash
node .Codex/skills/run-xaujournal/smoke.mjs
```

   Against a second server instance: `BASE_URL=http://localhost:5174 node .Codex/skills/run-xaujournal/smoke.mjs`.
3. Drive with pane tools — `get_page_text` for content, `read_page {filter: "interactive"}` for refs, `computer` for input. Verified interactions:
   - The hero tape on `/` is a `slider` role: `left_click` on its ref scrubs to the clicked hour; `ArrowRight`/`ArrowLeft` step ±1 hour, and the desks/trades/hit-rate/net readouts refilter live (data derives from `src/lib/deskDemo.js`).
   - `/app` client-redirects to `/login?mode=signin` when signed out.
4. Screenshots require the Browser pane to be visible — when hidden they time out ("not compositing frames"). Verify with `read_page`/`get_page_text` instead.

## Auth gate (dashboard access)

Sign-in is Firebase email/password or Google popup. **Agents must not enter credentials.** To reach `/app` (the authenticated dashboard), ask the user to sign in once in the Browser pane — Firebase persists the session in the pane's browser profile, so `/app` stays reachable in later sessions until they sign out.

## Test

```bash
npm test
```

Runs `vitest run` (unit suites for trade analytics/utils, API broker persistence, etc.).

## Run (human path)

`npm run dev` → http://localhost:5173. If 5173 is taken, Vite prints `Port 5173 is in use, trying another one...` and boots on 5174+ (~700 ms startup).

## Gotchas

- **`/api` hits production.** `vite.config.js` proxies `/api` → `https://xaujournal.vercel.app` unless `VITE_API_TARGET` is set. Local UI actions that call `/api/*` (broker sync, checkout) touch the production backend.
- **Every route returns HTTP 200.** Routing and auth are client-side (React Router `Navigate`), so you cannot probe auth or 404s by status code — `smoke.mjs` proves the shell serves, not that a route renders. Use the pane for rendered-state checks.
- **`.Codex/launch.json` pins port 5173** (no `autoPort`), so `preview_start {name}` errors instead of reattaching when a non-preview process holds the port. Attach via `{url}` in that case.
- **Windows: don't `process.exit()` right after `fetch`.** It crashes Node with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c` — `smoke.mjs` sets `process.exitCode` instead. Reuse that pattern in any new script here.

## Troubleshooting

- `screenshot failed: … the Browser pane is not displayed` → pane is hidden. Use `read_page`/`get_page_text`, or ask the user to open the pane.
- `Preview not found` after a failed/denied navigate → the preview session dropped. Re-run `preview_start {url: "http://localhost:5173"}` (it reuses the pane).
- `smoke.mjs` fails with a connection error → no dev server on that port. Start one (agent path step 1, or `npm run dev`).
