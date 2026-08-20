# Graph Report - xaujournal  (2026-08-17)

## Corpus Check
- 223 files · ~385,374 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1435 nodes · 2837 edges · 118 communities (82 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f57fb1cb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- BrokerSync.jsx
- button.tsx
- tradeAnalytics.js
- cn
- devDependencies
- DashboardLayout.jsx
- _security.ts
- tradeUtils.js
- overrides
- PricingPage.jsx
- LandingPage.jsx
- AppRoutes.jsx
- JournalPage.jsx
- compilerOptions
- seo.js
- AuthenticatedSessionContext.jsx
- components.json
- FooterNav.jsx
- HistoryPage.jsx
- field.tsx
- DataTable.jsx
- FirebaseBrokerRepository.js
- AnalyticsPage.jsx
- dropdown-menu.tsx
- _middleware.ts
- MEDIUM
- LogTradePage.jsx
- BlogArticlePage.jsx
- createAppServices.js
- AuthenticatedRoutes.jsx
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- utils.ts
- alert.tsx
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- app/AuthenticatedApp.jsx
- FirebaseWalletRepository.js
- check-bundle-budget.mjs
- vite.config.js
- tradeService.js
- PublicVisuals.jsx
- vercel.json
- firebase.d.ts
- tradeConfig.js
- DashboardRightSidebar.jsx
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- dependencies
- firebase
- @firecms/neat
- _metaapi-broker.js
- App.jsx
- Production Operations & Maintenance Guide — xaujournal
- @google-cloud/storage
- hono
- lucide-react
- @radix-ui/react-slot
- XAU Journal × MetaApi — Architecture
- _auth.ts
- react-chartjs-2
- react-dom
- react-router-dom
- resend
- tailwind-merge
- tw-animate-css
- @vercel/analytics
- @vercel/kv
- @vercel/speed-insights
- consolidateBrokerConnect
- HIGH
- compilerOptions
- migrate-broker-credential-privacy.mjs
- EditTradeModal.jsx
- SECURITY-AUDIT-2026-08.md
- Run xaujournal (dev)
- Run xaujournal (dev)
- 🛡️ Maintenance & Security Post-Deployment Checklist
- 🚀 Project Scope
- XAU Journal Architecture
- BrokerRepository
- grant-admin.mjs
- ToastContext.jsx
- BrokerSync
- useTrades.js
- rules/graphify.md
- workflows/graphify.md
- C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out
- H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset
- chart.js
- html2canvas
- H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox
- metaapi.cloud-sdk
- H-03 — Rate limiting keys on a client-suppliable header
- M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection
- bento-grid.tsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons

## God Nodes (most connected - your core abstractions)
1. `cn()` - 196 edges
2. `Button()` - 25 edges
3. `useToast()` - 19 edges
4. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
5. `overrides` - 18 edges
6. `isPaidPlan()` - 18 edges
7. `compilerOptions` - 18 edges
8. `tradeAnalyticsDelta()` - 17 edges
9. `scripts` - 14 edges
10. `formatSigned()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `isSyncAllowed()` --calls--> `hasPaidAccess()`  [EXTRACTED]
  api/_auth.ts → src/lib/entitlements.js
- `deletionPatch()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_credentialFields.js
- `migrateBrokerJobs()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_credentialFields.js
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_firebase.js
- `handleCloseTradeSync()` --calls--> `computePips()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/goldContract.js

## Import Cycles
- None detected.

## Communities (118 total, 36 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.16
Nodes (20): isSyncAllowed(), now(), resend, DELETE, Env, GET, handleRevokeExpired(), handleTradeWebhook() (+12 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.23
Nodes (9): BrokerLogo(), BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BROKERS, getBrokerLogoUrl(), LOCAL_BROKER_LOGO_FILES, POPULAR_BROKER_IDS (+1 more)

### Community 2 - "button.tsx"
Cohesion: 0.09
Nodes (28): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), ImageViewerModal(), OnboardingModal(), PricingModal() (+20 more)

### Community 3 - "tradeAnalytics.js"
Cohesion: 0.08
Nodes (25): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), apply, args, main(), maxUsers, migrateAnalytics() (+17 more)

### Community 4 - "cn"
Cohesion: 0.07
Nodes (32): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Checkbox(), CustomSelect() (+24 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies (+39 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.06
Nodes (45): useSessionBrokerAccounts(), ACCENT_TEMPLATES, DashboardLayout(), Logo(), buttonVariants, Sheet(), SheetContent(), SheetDescription() (+37 more)

### Community 7 - "_security.ts"
Cohesion: 0.17
Nodes (13): handleRemindExpiry(), assertCron(), assertRequiredConfig(), escapeHtml(), isRecaptchaConfigured(), isValidAccountId(), isValidUid(), RecaptchaResult (+5 more)

### Community 8 - "tradeUtils.js"
Cohesion: 0.19
Nodes (11): CurrencyConverter(), ratesCache, DatePicker(), CURRENCIES, formatCompact(), formatCurrencyCompact(), formatNumber(), formatPrice() (+3 more)

### Community 9 - "overrides"
Cohesion: 0.05
Nodes (38): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+30 more)

### Community 10 - "PricingPage.jsx"
Cohesion: 0.13
Nodes (18): BlogsPage, PricingPage, PublicFooter(), NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), CTALink() (+10 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.07
Nodes (35): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), RECORD (+27 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.09
Nodes (16): AuthenticatedApp, BlogArticlePage, ContactPage, LandingPage, Login, NotFoundPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS (+8 more)

### Community 13 - "JournalPage.jsx"
Cohesion: 0.17
Nodes (18): SectionCard(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+10 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.09
Nodes (30): PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema() (+22 more)

### Community 16 - "AuthenticatedSessionContext.jsx"
Cohesion: 0.23
Nodes (17): AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, useBrokerAccounts(), addAccount(), hasSessionCredential(), removeAccount(), syncAccount() (+9 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.13
Nodes (29): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+21 more)

### Community 19 - "HistoryPage.jsx"
Cohesion: 0.15
Nodes (15): TradeShareCard, Input(), getTradeStrategyTags(), formatSignedNumber(), toDate(), toMillis(), ShareTradeModal, chip() (+7 more)

### Community 20 - "field.tsx"
Cohesion: 0.15
Nodes (13): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+5 more)

### Community 21 - "DataTable.jsx"
Cohesion: 0.18
Nodes (14): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Table(), TableBody() (+6 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.30
Nodes (5): FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "AnalyticsPage.jsx"
Cohesion: 0.14
Nodes (17): AnalyticsPage, DirectionCell(), StatCard(), isLongDirection(), formatSigned(), pnlToneClass(), AnalyticsPage(), chip() (+9 more)

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 25 - "_middleware.ts"
Cohesion: 0.28
Nodes (7): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "LogTradePage.jsx"
Cohesion: 0.14
Nodes (16): SQUARE_STATE, StatusSquare(), LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, ToggleGroup(), ToggleGroupContext (+8 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.21
Nodes (10): TextLink(), articles, articles, getArticle(), studyArticles, studyCategories, articles, removeJsonLd() (+2 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.16
Nodes (3): SubscriptionRepository, ResetTradesUseCase, FirebaseSubscriptionRepository

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.16
Nodes (9): AuthenticatedRoutes(), BrokerSync, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage (+1 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "_firebase.js"
Cohesion: 0.46
Nodes (4): db, isDbReady(), app, mockKvStore

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.29
Nodes (8): db, app, auth, facebookProvider, firebaseConfig, googleProvider, fetchCountry(), Login()

### Community 37 - "utils.ts"
Cohesion: 0.22
Nodes (10): EmptyState(), Badge(), badgeVariants, Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia() (+2 more)

### Community 38 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.21
Nodes (11): DELTA_CLASS, DELTA_SIGN, TONE_CLASS, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+3 more)

### Community 42 - "app/AuthenticatedApp.jsx"
Cohesion: 0.18
Nodes (14): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AppServicesContext, AppServicesProvider(), useAppServices(), useSessionWallet(), createAppServices() (+6 more)

### Community 44 - "check-bundle-budget.mjs"
Cohesion: 0.25
Nodes (8): budgets, directory, eager, eagerKb, files, gzipKb(), html, htmlPath

### Community 45 - "vite.config.js"
Cohesion: 0.28
Nodes (7): CHART_VENDOR, __dirname, EAGER_FORBIDDEN, manualChunks(), normalizeId(), packageOf(), REACT_VENDOR

### Community 46 - "tradeService.js"
Cohesion: 0.52
Nodes (4): useTradeController(), getRemainingFreeTrades(), isProPlan(), submitTrade()

### Community 47 - "PublicVisuals.jsx"
Cohesion: 0.31
Nodes (10): arcPath(), CANDLES, DIAL, DIAL_SESSIONS, fmt(), point(), REPLAY, SessionDial() (+2 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "DashboardRightSidebar.jsx"
Cohesion: 0.12
Nodes (16): CONFIDENCE_SCALE, CONFLUENCE, GRADES, MOODS, SESSION_OPTIONS, STRATEGY_OPTIONS, STRUCTURES, TABS (+8 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, clsx, dotenv, firebase-functions, dependencies, @base-ui/react, clsx, dotenv (+1 more)

### Community 58 - "_metaapi-broker.js"
Cohesion: 0.13
Nodes (22): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+14 more)

### Community 59 - "App.jsx"
Cohesion: 0.08
Nodes (24): App(), AuthSyncFailure(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppRoutes(), isPublicNavbarPath() (+16 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "_auth.ts"
Cohesion: 0.48
Nodes (4): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), verifyIdToken()

### Community 83 - "consolidateBrokerConnect"
Cohesion: 0.22
Nodes (13): deletionPatch(), AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect() (+5 more)

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenario, Fix, Fix, Fix, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, checkJs, lib, noEmit, paths, strict, types (+7 more)

### Community 86 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.35
Nodes (9): ACCOUNT_CREDENTIAL_FIELDS, USER_CREDENTIAL_FIELDS, initAdmin(), apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts() (+1 more)

### Community 87 - "EditTradeModal.jsx"
Cohesion: 0.29
Nodes (10): EditTradeModal(), DashboardRightSidebar(), storage, getEntitlements(), hasPaidAccess(), isPaidPlan(), NOW, calcPnl() (+2 more)

### Community 88 - "SECURITY-AUDIT-2026-08.md"
Cohesion: 0.22
Nodes (8): Appendix — what remediation changed, Controls worth adding beyond individual fixes, Executive summary, LOW / INFORMATIONAL, Production-grade recommendations, Remediation status, What is already done well, xaujournal — Production Security Audit

### Community 89 - "Run xaujournal (dev)"
Cohesion: 0.22
Nodes (8): Auth gate (dashboard access), Gotchas, Prerequisites, Run (agent path), Run (human path), Run xaujournal (dev), Test, Troubleshooting

### Community 90 - "Run xaujournal (dev)"
Cohesion: 0.22
Nodes (8): Auth gate (dashboard access), Gotchas, Prerequisites, Run (agent path), Run (human path), Run xaujournal (dev), Test, Troubleshooting

### Community 91 - "🛡️ Maintenance & Security Post-Deployment Checklist"
Cohesion: 0.22
Nodes (8): 1. 🚨 Usage & Spend Alerts (CRITICAL), 2. 🔑 API Key Rotation Plan, 3. 🧹 Git History Scrubbing, 4. 🧪 Production Monitoring, Firebase Usage Alerts, 🛡️ Maintenance & Security Post-Deployment Checklist, Steps to Rotate:, Vercel Spend Alerts

### Community 92 - "🚀 Project Scope"
Cohesion: 0.22
Nodes (8): 1. Performance Terminal (The Execution Engine), 2. Cognitive Briefs (Journals), 3. Tiered Ecosystem (Subscription Logic), 4. Hardened Security Infrastructure, ⚖️ Compliance, 🚀 Project Scope, 🛠️ Tech Stack, xaujournal — Pro Trade Intelligence Terminal

### Community 93 - "XAU Journal Architecture"
Cohesion: 0.25
Nodes (7): Backend structure, Dependency rule, Extension rules, Frontend structure, Product map, Safe migration path, XAU Journal Architecture

### Community 95 - "grant-admin.mjs"
Cohesion: 0.33
Nodes (4): args, list, revoke, uid

### Community 96 - "ToastContext.jsx"
Cohesion: 0.31
Nodes (5): AppProviders(), ToastContext, ToastProvider(), ThemeContext, ThemeProvider()

### Community 97 - "BrokerSync"
Cohesion: 0.36
Nodes (5): BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), getFriendlyErrorMessage()

### Community 98 - "useTrades.js"
Cohesion: 0.83
Nodes (3): byDateDesc(), mergeTrades(), useTrades()

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "bento-grid.tsx"
Cohesion: 0.40
Nodes (3): BentoCard(), BentoGrid(), BentoIcon

## Knowledge Gaps
- **444 isolated node(s):** `checks`, `checks`, `Env`, `Variables`, `WEB_VITAL_NAMES` (+439 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `utils.ts`, `DashboardLayout.jsx`, `alert.tsx`, `SectionCard.jsx`, `JournalPage.jsx`, `bento-grid.tsx`, `FooterNav.jsx`, `DashboardRightSidebar.jsx`, `field.tsx`, `DataTable.jsx`, `EditTradeModal.jsx`, `AnalyticsPage.jsx`, `dropdown-menu.tsx`, `HistoryPage.jsx`, `LogTradePage.jsx`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `BrokerSync.jsx`, `DashboardLayout.jsx`, `PricingPage.jsx`, `JournalPage.jsx`, `DashboardRightSidebar.jsx`, `FirebaseBrokerRepository.js`, `EditTradeModal.jsx`, `App.jsx`, `createAppServices.js`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `computePips()` connect `_metaapi-broker.js` to `[[...route]].ts`, `tradeUtils.js`, `EditTradeModal.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `checks`, `checks`, `Env` to the rest of the system?**
  _444 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09494949494949495 - nodes in this community are weakly interconnected._
- **Should `tradeAnalytics.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07755102040816327 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07123034227567067 - nodes in this community are weakly interconnected._