# Graph Report - xaujournal  (2026-08-17)

## Corpus Check
- 223 files · ~385,374 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1431 nodes · 2825 edges · 113 communities (75 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f57fb1cb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- BrokerSync.jsx
- PricingPage.jsx
- tradeAnalytics.js
- cn
- devDependencies
- sidebar.tsx
- _security.ts
- AnalyticsPage.jsx
- overrides
- BlogsPage.jsx
- LandingPage.jsx
- AppRoutes.jsx
- JournalPage.jsx
- compilerOptions
- seo.js
- app/AuthenticatedApp.jsx
- components.json
- FooterNav.jsx
- HistoryPage.jsx
- field.tsx
- DataTable.jsx
- FirebaseBrokerRepository.js
- CalendarPage.jsx
- DashboardLayout.jsx
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
- EmptyState.jsx
- alert.tsx
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- db
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
- rules/graphify.md
- workflows/graphify.md
- C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out
- H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset
- clsx
- html2canvas
- H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox
- metaapi.cloud-sdk
- H-03 — Rate limiting keys on a client-suppliable header
- M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection
- utils.ts
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
3. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
4. `useToast()` - 19 edges
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
- `handleCloseTradeSync()` --calls--> `computePips()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/goldContract.js
- `handleCloseTradeSync()` --calls--> `outcomeForPnl()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/goldContract.js

## Import Cycles
- None detected.

## Communities (113 total, 38 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.16
Nodes (20): isSyncAllowed(), now(), resend, DELETE, Env, GET, handleRevokeExpired(), handleTradeWebhook() (+12 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.12
Nodes (17): Login, BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS (+9 more)

### Community 2 - "PricingPage.jsx"
Cohesion: 0.08
Nodes (33): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+25 more)

### Community 3 - "tradeAnalytics.js"
Cohesion: 0.08
Nodes (25): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), apply, args, main(), maxUsers, migrateAnalytics() (+17 more)

### Community 4 - "cn"
Cohesion: 0.08
Nodes (30): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), PopoverContent(), PopoverDescription() (+22 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies (+39 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.08
Nodes (29): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), Sidebar() (+21 more)

### Community 7 - "_security.ts"
Cohesion: 0.17
Nodes (13): handleRemindExpiry(), assertCron(), assertRequiredConfig(), escapeHtml(), isRecaptchaConfigured(), isValidAccountId(), isValidUid(), RecaptchaResult (+5 more)

### Community 8 - "AnalyticsPage.jsx"
Cohesion: 0.13
Nodes (26): CurrencyConverter(), ratesCache, DashboardRightSidebar(), TradeShareCard, CURRENCIES, getTradeStrategyTags(), calcPnl(), formatCompact() (+18 more)

### Community 9 - "overrides"
Cohesion: 0.05
Nodes (38): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+30 more)

### Community 10 - "BlogsPage.jsx"
Cohesion: 0.13
Nodes (17): BlogsPage, ContactPage, PublicFooter(), NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), Panel() (+9 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.07
Nodes (35): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), RECORD (+27 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (18): AppRoutes(), BlogArticlePage, LandingPage, NotFoundPage, PricingPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage (+10 more)

### Community 13 - "JournalPage.jsx"
Cohesion: 0.17
Nodes (17): SectionCard(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+9 more)

### Community 14 - "compilerOptions"
Cohesion: 0.05
Nodes (37): compilerOptions, allowJs, checkJs, lib, noEmit, paths, strict, types (+29 more)

### Community 15 - "seo.js"
Cohesion: 0.11
Nodes (26): PageSEO(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema(), buildFAQSchema() (+18 more)

### Community 16 - "app/AuthenticatedApp.jsx"
Cohesion: 0.09
Nodes (36): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext (+28 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.14
Nodes (28): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+20 more)

### Community 19 - "HistoryPage.jsx"
Cohesion: 0.15
Nodes (12): CustomSelect(), formatSignedNumber(), toDate(), toMillis(), ShareTradeModal, chip(), DetailField(), formatTradeTime() (+4 more)

### Community 20 - "field.tsx"
Cohesion: 0.15
Nodes (13): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+5 more)

### Community 21 - "DataTable.jsx"
Cohesion: 0.18
Nodes (14): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Table(), TableBody() (+6 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.30
Nodes (5): FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "CalendarPage.jsx"
Cohesion: 0.23
Nodes (10): CalendarPage, DirectionCell(), StatCard(), DatePicker(), useMonthTrades(), isLongDirection(), pad2(), CalendarPage() (+2 more)

### Community 24 - "DashboardLayout.jsx"
Cohesion: 0.08
Nodes (24): SQUARE_STATE, StatusSquare(), ACCENT_TEMPLATES, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem() (+16 more)

### Community 25 - "_middleware.ts"
Cohesion: 0.28
Nodes (7): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "LogTradePage.jsx"
Cohesion: 0.14
Nodes (16): LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, Tabs(), TabsContent(), TabsList(), tabsListVariants (+8 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.23
Nodes (9): articles, articles, getArticle(), studyArticles, studyCategories, articles, removeJsonLd(), BlogArticlePage() (+1 more)

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.18
Nodes (8): AnalyticsPage, BrokerSync, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage, SettingsPage

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
Cohesion: 0.43
Nodes (5): app, auth, facebookProvider, firebaseConfig, googleProvider

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.18
Nodes (11): DELTA_CLASS, DELTA_SIGN, TONE_CLASS, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+3 more)

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
Cohesion: 0.13
Nodes (13): ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, GRADES, MOODS, SESSION_OPTIONS, STRATEGY_OPTIONS, STRUCTURES (+5 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 58 - "_metaapi-broker.js"
Cohesion: 0.13
Nodes (22): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+14 more)

### Community 59 - "App.jsx"
Cohesion: 0.08
Nodes (26): App(), AuthSyncFailure(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders(), isPublicNavbarPath() (+18 more)

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

### Community 86 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.35
Nodes (9): ACCOUNT_CREDENTIAL_FIELDS, USER_CREDENTIAL_FIELDS, initAdmin(), apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts() (+1 more)

### Community 87 - "EditTradeModal.jsx"
Cohesion: 0.28
Nodes (10): EditTradeModal(), ToastContext, useToast(), FREE_SUBSCRIPTION, useSubscription(), getEntitlements(), hasPaidAccess(), isPaidPlan() (+2 more)

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

### Community 109 - "utils.ts"
Cohesion: 0.15
Nodes (10): Badge(), badgeVariants, BentoCard(), BentoGrid(), BentoIcon, Checkbox(), ToggleGroupContext, ToggleGroupItem() (+2 more)

## Knowledge Gaps
- **444 isolated node(s):** `Env`, `Variables`, `WEB_VITAL_NAMES`, `WEB_VITAL_RATINGS`, `GET` (+439 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `PricingPage.jsx`, `EmptyState.jsx`, `alert.tsx`, `sidebar.tsx`, `AnalyticsPage.jsx`, `SectionCard.jsx`, `JournalPage.jsx`, `utils.ts`, `app/AuthenticatedApp.jsx`, `FooterNav.jsx`, `DashboardRightSidebar.jsx`, `HistoryPage.jsx`, `DataTable.jsx`, `field.tsx`, `CalendarPage.jsx`, `DashboardLayout.jsx`, `LogTradePage.jsx`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `computePips()` connect `_metaapi-broker.js` to `[[...route]].ts`, `AnalyticsPage.jsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Button()` connect `PricingPage.jsx` to `cn`, `sidebar.tsx`, `AnalyticsPage.jsx`, `utils.ts`, `JournalPage.jsx`, `DashboardRightSidebar.jsx`, `HistoryPage.jsx`, `DataTable.jsx`, `CalendarPage.jsx`, `DashboardLayout.jsx`, `LogTradePage.jsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `Env`, `Variables`, `WEB_VITAL_NAMES` to the rest of the system?**
  _444 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Should `PricingPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07910014513788098 - nodes in this community are weakly interconnected._
- **Should `tradeAnalytics.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07755102040816327 - nodes in this community are weakly interconnected._