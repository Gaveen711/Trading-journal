# Admin Dashboard Adversarial Security Review — 2026-08-29

## Executive summary

This review found **no confirmed Critical vulnerability** in the inspected admin-dashboard path. The strongest existing controls are the server-side exact-identity check (UID, email, verified email, and admin claim), revoked-token verification, live Firebase user lookup, response and mutation allowlists, strict admin-origin CORS, a restrictive admin CSP, and Firestore rules that force administrative access through the server API.

One **High** risk remains after integration:

1. MFA and role separation are not yet enforced. Recent `auth_time` is now required for user mutations, but a recently stolen token still inherits the authority of the single superuser.

The original user-detail, analytics, status-normalization, degraded-state, and hard-deletion defects were remediated during integration. Remaining work is primarily cloud policy and operational maturity: MFA enforcement, role separation, append-only external audit retention, alerting, and the reviewed worker that completes pending deletion requests.

## Scope and limits

Inspected surfaces:

- `api/_admin.ts`, `api/_middleware.ts`, and API mounting code
- Admin authentication, API client, user directory/detail, analytics, and mutation flows
- `firestore.rules`
- `admin-dashboard/vercel.json`
- Existing admin API tests and security workflow
- Tracked-file names for likely credential artifacts

Not performed:

- No live attacks, production requests, account changes, or deployment
- No Firebase/Google Cloud console review, IAM policy review, MFA-policy verification, Vercel project-setting review, or log-retention verification
- No dynamic browser penetration test against a deployed environment
- No dynamic exploit scan of dependencies; however, `npm audit --omit=dev` completed for both root and admin lockfiles with zero reported production advisories
- No guarantee that “every vulnerability” was found; static review cannot prove absence of flaws in cloud configuration, dependencies, runtime data, or code outside the inspected admin path

The repository had concurrent implementation work in progress during this review. Unless a finding is explicitly described as historical, the evidence below describes the integrated state at final verification.

## Threat model

### Protected assets

- User identity and profile data
- Subscription, billing, and support-report data
- Trade and journal analytics
- Broker/API credentials and access tokens
- Firebase administrative authority
- Administrative audit records
- Account availability and recoverability

### Adversaries and failure modes

- An attacker with a stolen admin password or active Firebase ID token
- A malicious non-admin Firebase user attempting claim, email, UID, or IDOR bypasses
- A hostile website attempting CSRF/CORS abuse from a browser session
- A caller attempting mass assignment, identifier injection, pagination abuse, or error-oracle discovery
- A compromised admin browser origin attempting broader API access or data exfiltration
- An operator making a mistake while the API is stale, degraded, or partially failing
- Backend outages that interrupt non-atomic destructive operations
- A malicious or compromised administrator attempting to evade audit coverage

### Primary trust boundaries

1. Browser to Firebase Authentication
2. Admin browser to `/api/admin` using a bearer token
3. Admin API to Firebase Auth and Firestore through the Admin SDK
4. Admin API to audit storage, cache invalidation, and recursive deletion

## Findings

### Critical

No confirmed Critical finding was identified in the reviewed scope.

### High

#### H-01 — MFA and role separation remain unenforced

**Evidence**

- `admin-dashboard/src/auth/AuthContext.tsx:113-119` signs in with email and password and then performs admission checks.
- `admin-dashboard/src/auth/adminAdmission.ts:26-47` verifies the exact UID/email, email verification, and `admin === true`, but does not verify a second factor or recent authentication.
- The integrated API now checks `auth_time` and rejects user mutations after ten minutes without a fresh sign-in.
- The server records a second-factor claim when present, but does not require it because the Firebase/Google Cloud MFA enrollment policy was not available for verification.
- The browser idle timeout in `admin-dashboard/src/auth/AuthContext.tsx:126-164` does not constrain a token used directly against the API.

**Impact**

A recently stolen active token or compromised sole administrator account can still read permitted data and act within the recent-authentication window. The exact-UID design prevents horizontal privilege escalation but concentrates all authority in one identity.

**Remediation**

- Require MFA for the designated administrator in the identity provider and verify the expected second-factor signal server-side.
- Keep the integrated recent-`auth_time` gate and add an in-place reauthentication flow instead of requiring sign-out/sign-in.
- Introduce explicit roles/permissions such as `support.read`, `billing.manage`, `user.suspend`, and `user.delete`; deny by default.
- Require stronger step-up policy for deletion, credential/broker actions, and subscription changes than for read-only analytics.
- Alert on new device, unusual IP/ASN, repeated authorization failure, mass user reads, and destructive bursts.

**Verification**

The security suite now covers stale `auth_time`. Missing MFA evidence, insufficient role, and forced reauthentication still need tests after the cloud identity policy is defined.

#### H-02 — Remediated: hard user deletion was replaced with a recoverable request

**Evidence**

- The dashboard DELETE route now requires recent authentication, disables the Firebase Auth account, revokes API keys, preserves the user tree and billing/support records, and stores `deletionState: pending`.
- Reactivating the account clears the pending deletion state; revoked API keys are intentionally not restored.
- The UI calls this a deletion request rather than claiming that records were erased.

**Impact**

The unrecoverable data-loss path is removed. A mid-flight failure can still leave the account safely suspended with keys revoked before the pending marker is written; that state is recoverable and the UI treats the outcome as unconfirmed until refresh.

**Remediation**

- Complete the pending state with an idempotent, reviewed background erasure workflow.
- Record per-step state and a stable operation ID; retries must resume safely rather than repeat completed steps.
- Define retention for payments, reports, audit records, and anonymized analytics before implementing irreversible erasure.
- Provide an explicit recovery window and restore path where legally and operationally appropriate.
- Change UI language to acknowledge partial completion until the server returns a terminal operation state.
- Require recent authentication, a typed reason, and a second confirmation for hard erasure.

**Verification**

The regression suite verifies that trade data remains and API keys are revoked. Failure injection for every suspension/request step remains recommended before an irreversible erasure worker is introduced.

### Medium

#### M-01 — Partially remediated: actor-aware rate limiting is active

**Integrated controls**

- The child admin router authenticates first, then limits by verified admin UID.
- Mutations are limited to 30/minute, analytics reads to 60/minute, and other reads to 120/minute.
- Mutation routes fail closed with a structured 503 when the backing limiter is unavailable; reads continue in degraded mode and expose the condition through a response header.
- The documented loopback launcher can use a bounded process-local limiter when KV is absent. The fallback requires an explicit launcher flag and is rejected when `VERCEL_ENV=production`.

**Residual risk**

The limiter is actor-based rather than actor-and-IP based, and it relies on the same KV operational boundary as the application. Add IP/ASN anomaly signals, alerting on threshold approaches and 429s, and an independently controlled emergency procedure for limiter outages.

#### M-02 — Partially remediated: sensitive reads now create audit records

**Integrated controls**

- User-directory, user-detail, per-user analytics, and platform-analytics reads create audit records containing actor, action, target, time, outcome, and request ID.
- Mutations retain started/completed/failed audit state and include authentication context.
- Browser clients cannot alter the audit collection under the inspected Firestore rules.

**Residual risk**

The logs remain in Firestore under the same server authority. Replicate them to a separately permissioned append-only sink, define retention, and alert on bulk reads, broad searches, repeated authorization failures, and destructive bursts.

#### M-03 — Remediated: structured errors and correlation IDs

Every admin response receives `X-Request-Id`. Safe errors use `{ error: { code, message, category, requestId } }`; internal exceptions, stack traces, Firebase messages, paths, secrets, query details, and upstream payloads are not returned. The client preserves categories, request IDs, timeout state, and retryability so operators can distinguish session, authorization, not-found, validation, rate-limit, and backend failures.

The legacy contract tests were updated and pass with the behavioral security suite.

#### M-04 — Remediated: filtering, pagination, dates, and payment status

User search, plan, and status filters are validated and enforced server-side with bounded scans and cursor pagination. Platform analytics validates inclusive ISO date ranges, normalizes payment status centrally, and treats `success`, `paid`, `completed`, and `succeeded` as settled. The same policy prevents deletion of settled payments. Per-user analytics is UID-scoped, sanitized, bounded, and paginated.

#### M-05 — Partially remediated: health and stale-state mutation locks

The authenticated health route checks the database path without exposing configuration. The UI distinguishes current, stale, partial, degraded, and unknown snapshots, displays generation/freshness information, and disables mutations during refresh, degraded connectivity, pending mutation, or unknown mutation outcome.

**Residual risk**

User updates do not yet carry an optimistic-concurrency version precondition. Add a revision/ETag and reject stale writes before expanding the dashboard to multiple simultaneous administrators.

### Low

#### L-01 — Planned login-history display needs explicit privacy minimization

**Evidence**

- `admin-dashboard/src/pages/UserDetailPage.tsx:61-62` is prepared to display device and raw IP history.
- The current `USER_FIELDS` allowlist in `api/_admin.ts:31-37` does not expose login history, so this is a forward-looking risk rather than a current API disclosure.

**Impact**

Raw IP/device history increases the sensitivity of a compromised admin session and may exceed the information needed for support workflows.

**Remediation**

- Return only a short, bounded history with coarse location/device information or masked IPs.
- Define retention, purpose, and access logging before exposing it.
- Do not expose authentication tokens, provider internals, credential hashes, or broker secrets as part of “full user details.”

#### L-02 — Production dependency audits are clean at verification time

`npm audit --omit=dev` reported zero production advisories for both the root and admin lockfiles on 2026-08-29. This is point-in-time evidence, not a guarantee against future disclosures. Keep the audit gate required before deployment and review lockfile changes in code review.

## Verified defensive controls

The following controls were present in the inspected code:

- Revocation-aware Firebase token verification (`verifyIdToken(token, true)`) and live-user state checks
- Exact UID, email, email-verification, and admin-claim authorization on the server
- Recent `auth_time` enforcement for user mutations, with a ten-minute maximum age
- Actor-aware admin limits for mutations, analytics, and other reads; mutations fail closed if the limiter is unavailable
- Self-disable/self-delete prevention and deletion protection for admin accounts
- Explicit response-field and mutation-field allowlists
- Required 10–500 character, two-word Unicode-aware mutation reasons and append-only client rules for admin audit records
- Request IDs, structured safe errors, and request-ID-linked read/mutation audit records
- Recoverable deletion requests that disable Auth, revoke API keys, preserve records, and expose pending state
- Identifier, body-size, enum, date, number, and pagination validation helpers
- Production admin CORS restricted to `https://admin.xaujournal.com`; the admin origin is not added to unrelated API routes
- Bearer-header authentication rather than ambient cross-site cookies, materially reducing CSRF risk
- Restrictive admin CSP with `frame-ancestors 'none'`, `script-src 'self'`, no object sources, HSTS, no-store, and anti-framing headers
- No `dangerouslySetInnerHTML`, direct `innerHTML`, `eval`, or `new Function` sink found in the inspected admin source
- Firestore browser rules deny access to payments, settings, API keys, and admin audit logs; administrative access is routed through the server
- No tracked `.env`, service-account, or obvious credential artifact was identified by the filename check; this is not a substitute for a full history secret scan

These controls reduce CSRF, IDOR, mass-assignment, direct Firestore bypass, destructive-retry, and common reflected/stored XSS risk. They do not replace MFA, role separation, independent audit retention, optimistic concurrency, a reviewed erasure worker, or runtime monitoring.

## Regression-test coverage added

New contract suite: `api/_admin.security.test.js`

Behavioral cases cover:

- Wrong UID, email, verification state, or admin claim
- Disabled/renamed/unverified live account and revoked token behavior
- Safe error shape and non-leakage of verifier/backend details
- `X-Request-Id` on success and error responses
- Required mutation reasons before side effects/audit writes
- Stale `auth_time` rejection before user mutation side effects
- `success` payment deletion protection
- Recoverable user-deletion requests that preserve journal data and revoke API keys
- Canonical UID lookup and safe 404
- User response allowlists excluding credentials, tokens, and custom claims
- Server-side user search/plan/status filtering
- Maximum page-size enforcement
- Malformed/reversed analytics date ranges
- Settlement normalization including `success`
- Canonical `GET /users/:uid/analytics` route and cross-user isolation

Final focused result after integration:

```text
npx vitest run api/_admin.test.js api/_admin.security.test.js --reporter=dot
Test files: 2 passed
Tests:      43 passed
```

The complete repository run also passed 63 files and 715 tests. Known test-only React `act(...)` and missing-test-secret console warnings remain noisy but did not fail the suite.

## Recommended remediation order

1. Enforce MFA in Firebase/Google Cloud and verify the second-factor signal server-side.
2. Introduce least-privilege roles instead of one unrestricted superuser identity.
3. Replicate audit events to a separately permissioned append-only sink with retention and alerts.
4. Design and threat-model an idempotent worker for reviewed pending deletion requests before adding irreversible erasure.
5. Add optimistic-concurrency preconditions to user mutations.
6. Add IP/ASN anomaly detection, abuse alerts, and a full secret-history scan in CI.
7. Repeat audits, all tests, typechecks, builds, and authenticated smoke tests before production deployment.
