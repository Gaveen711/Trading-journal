# Graph Report - xaujournal  (2026-08-22)

## Corpus Check
- 254 files · ~443,517 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1766 nodes · 3700 edges · 141 communities (91 shown, 50 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4cd310a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- disciplineRules.js
- BrokerSync.jsx
- button.tsx
- scripts
- cn
- devDependencies
- sidebar.tsx
- [[...route]].ts
- useToast
- overrides
- PricingPage.jsx
- LandingPage.jsx
- AppRoutes.jsx
- ManageSetupsDialog.jsx
- compilerOptions
- seo.js
- SettingsPage.jsx
- components.json
- goldSessions.js
- HistoryPage.jsx
- firebaseTradeRepository.test.js
- DataTable.jsx
- FirebaseBrokerRepository.js
- AnalyticsPage.jsx
- DashboardLayout.jsx
- sessionEngine.js
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
- disciplineRules.test.js
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- ToastContext.jsx
- FirebaseWalletRepository.js
- check-bundle-budget.mjs
- vite.config.js
- SetupCombobox.jsx
- PublicVisuals.jsx
- vercel.json
- firebase.d.ts
- tradeConfig.js
- _entitlementMiddleware.test.js
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- dependencies
- firebase
- @firecms/neat
- _middleware.ts
- app/AuthenticatedApp.jsx
- Production Operations & Maintenance Guide — xaujournal
- @google-cloud/storage
- hono
- lucide-react
- @radix-ui/react-slot
- XAU Journal × MetaApi — Architecture
- _entitlementMiddleware.ts
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
- migrate-performance-data.mjs
- DashboardRightSidebar.jsx
- SECURITY-AUDIT-2026-08.md
- Run xaujournal (dev)
- Run xaujournal (dev)
- 🛡️ Maintenance & Security Post-Deployment Checklist
- 🚀 Project Scope
- XAU Journal Architecture
- BrokerRepository
- TradeRepository
- marketData.js
- _tradeService.ts
- BrokerSync
- rules/graphify.md
- workflows/graphify.md
- C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out
- H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset
- tradeAnalytics.js
- html2canvas
- H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox
- metaapi.cloud-sdk
- H-03 — Rate limiting keys on a client-suppliable header
- M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection
- EditTradeModal.submit.test.jsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons
- package.json
- tradeAnalyticsSessions.test.js
- alert.tsx
- useBrokerAccounts.adopt.test.jsx
- AnalyticsPage.disciplineLock.test.jsx
- HistoryPage.setupWiring.test.jsx
- utils.ts
- DashboardLayout.sidebarWiring.test.js
- ManageSetupsDialog
- clsx
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- globals
- jsdom
- postcss
- @tailwindcss/postcss
- @testing-library/jest-dom
- @testing-library/react
- @testing-library/user-event
- @types/react
- @types/react-dom
- @vitejs/plugin-react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 205 edges
2. `Button()` - 27 edges
3. `AnalyticsPage()` - 23 edges
4. `useToast()` - 21 edges
5. `resolveSessionAt()` - 20 edges
6. `tradeAnalyticsDelta()` - 19 edges
7. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
8. `overrides` - 18 edges
9. `isPaidPlan()` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `isSyncAllowed()` --calls--> `hasPaidAccess()`  [EXTRACTED]
  api/_auth.ts → src/lib/entitlements.js
- `persistBrokerTrades()` --calls--> `analyticsDeltaForTrades()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `tradeAnalyticsDelta()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `deletionPatch()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_credentialFields.js
- `migrateBrokerJobs()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_credentialFields.js

## Import Cycles
- None detected.

## Communities (141 total, 50 thin omitted)

### Community 0 - "disciplineRules.js"
Cohesion: 0.13
Nodes (12): LogTradeUseCase, earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), dayKeyMidnightMs(), ORDINAL_SUFFIXES, positionKey(), preciseMoments() (+4 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.23
Nodes (9): BrokerLogo(), BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BROKERS, getBrokerLogoUrl(), LOCAL_BROKER_LOGO_FILES, POPULAR_BROKER_IDS (+1 more)

### Community 2 - "button.tsx"
Cohesion: 0.08
Nodes (31): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+23 more)

### Community 3 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, admin:grant, admin:list, build, build:budget, dev, lint, migrate:broker-privacy (+6 more)

### Community 4 - "cn"
Cohesion: 0.07
Nodes (38): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Field(), FieldContent() (+30 more)

### Community 5 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, eslint, @eslint/js, devDependencies, autoprefixer, eslint, @eslint/js, tailwindcss (+15 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.08
Nodes (29): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), Sidebar() (+21 more)

### Community 7 - "[[...route]].ts"
Cohesion: 0.10
Nodes (31): resend, DELETE, Env, GET, handleBrokerAdd(), handleRemindExpiry(), handleRevokeExpired(), handleRouteError() (+23 more)

### Community 8 - "useToast"
Cohesion: 0.24
Nodes (7): CurrencyConverter(), ratesCache, useToast(), CURRENCIES, todayStr(), entryDateLabel(), JournalPage()

### Community 9 - "overrides"
Cohesion: 0.11
Nodes (18): overrides, axios, braces, cross-spawn, crypto-js, elliptic, esbuild, fast-xml-parser (+10 more)

### Community 10 - "PricingPage.jsx"
Cohesion: 0.12
Nodes (20): PricingPage, PublicFooter(), NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), CTALink(), Panel() (+12 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.06
Nodes (37): useMonthTrades(), bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow() (+29 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (17): AppRoutes(), BlogsPage, ContactPage, LandingPage, NotFoundPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage (+9 more)

### Community 13 - "ManageSetupsDialog.jsx"
Cohesion: 0.21
Nodes (14): EmptyState(), EMPTY_LIST, EMPTY_MAP, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+6 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.10
Nodes (26): PageSEO(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema(), buildFAQSchema() (+18 more)

### Community 16 - "SettingsPage.jsx"
Cohesion: 0.21
Nodes (6): ACCENT_TEMPLATES, accentTemplateName(), getAuthErrorMessage(), SettingsPage(), toRuleDraft(), toast

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "goldSessions.js"
Cohesion: 0.14
Nodes (28): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+20 more)

### Community 19 - "HistoryPage.jsx"
Cohesion: 0.19
Nodes (11): SectionCard(), Input(), toDate(), toMillis(), chip(), DetailField(), formatTradeTime(), getTimestampMs() (+3 more)

### Community 20 - "firebaseTradeRepository.test.js"
Cohesion: 0.18
Nodes (3): fake, logTrade, repository

### Community 21 - "DataTable.jsx"
Cohesion: 0.18
Nodes (14): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Table(), TableBody() (+6 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.27
Nodes (6): FirebaseBrokerRepository, adoptBrokerCallable(), callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "AnalyticsPage.jsx"
Cohesion: 0.09
Nodes (35): DirectionCell(), StatCard(), PRIMARY_SESSIONS, primarySessionForCode(), SESSION_LABELS, dayMatchesInstant(), deriveSessionStats(), getTradeSessionCode() (+27 more)

### Community 24 - "DashboardLayout.jsx"
Cohesion: 0.09
Nodes (26): useSessionBrokerAccounts(), useSessionWallet(), DashboardLayout(), Logo(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup() (+18 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.13
Nodes (24): baseTrade, CODE_HUBS, EMPTY, HUB_ORDER, HUB_PRIORITY, hubWindowMs(), isDeskOpenAt(), isWeekendRestAt() (+16 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "LogTradePage.jsx"
Cohesion: 0.10
Nodes (19): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroup(), ToggleGroupContext, ToggleGroupItem() (+11 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.19
Nodes (11): BlogArticlePage, TextLink(), articles, articles, getArticle(), studyArticles, studyCategories, articles (+3 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.16
Nodes (3): SubscriptionRepository, ResetTradesUseCase, FirebaseSubscriptionRepository

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.16
Nodes (9): AnalyticsPage, BrokerSync, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage (+1 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "_firebase.js"
Cohesion: 0.21
Nodes (8): db, isDbReady(), app, mockKvStore, args, list, revoke, uid

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.22
Nodes (11): Login, db, storage, app, auth, facebookProvider, firebaseConfig, googleProvider (+3 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.33
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "disciplineRules.test.js"
Cohesion: 0.06
Nodes (47): AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, createAppServices(), APPLIED_PATCH (+39 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.18
Nodes (11): DELTA_CLASS, DELTA_SIGN, TONE_CLASS, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+3 more)

### Community 42 - "ToastContext.jsx"
Cohesion: 0.24
Nodes (7): actionIn(), BY_ID, CATALOG, rowFor(), TRADES, ToastContext, ToastProvider()

### Community 44 - "check-bundle-budget.mjs"
Cohesion: 0.25
Nodes (8): budgets, directory, eager, eagerKb, files, gzipKb(), html, htmlPath

### Community 45 - "vite.config.js"
Cohesion: 0.28
Nodes (7): CHART_VENDOR, __dirname, EAGER_FORBIDDEN, manualChunks(), normalizeId(), packageOf(), REACT_VENDOR

### Community 46 - "SetupCombobox.jsx"
Cohesion: 0.13
Nodes (22): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+14 more)

### Community 47 - "PublicVisuals.jsx"
Cohesion: 0.31
Nodes (10): arcPath(), CANDLES, DIAL, DIAL_SESSIONS, fmt(), point(), REPLAY, SessionDial() (+2 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "_entitlementMiddleware.test.js"
Cohesion: 0.13
Nodes (16): ACTIVE_PRO, expire(), FREE, FUTURE, get(), GRACE, incr(), LAPSED_GRACE (+8 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 58 - "_middleware.ts"
Cohesion: 0.28
Nodes (7): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware

### Community 59 - "app/AuthenticatedApp.jsx"
Cohesion: 0.06
Nodes (32): App(), AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AuthSyncFailure(), LinkPeek(), ScrollProgress(), clearUxState() (+24 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "_entitlementMiddleware.ts"
Cohesion: 0.25
Nodes (12): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), isSyncAllowed(), verifyIdToken(), assertPro(), ProGateOptions, requireAuth() (+4 more)

### Community 83 - "consolidateBrokerConnect"
Cohesion: 0.26
Nodes (11): deletionPatch(), AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect() (+3 more)

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenario, Fix, Fix, Fix, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, checkJs, lib, noEmit, paths, strict, types (+7 more)

### Community 86 - "migrate-performance-data.mjs"
Cohesion: 0.17
Nodes (17): ACCOUNT_CREDENTIAL_FIELDS, USER_CREDENTIAL_FIELDS, initAdmin(), apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts() (+9 more)

### Community 87 - "DashboardRightSidebar.jsx"
Cohesion: 0.05
Nodes (57): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+49 more)

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

### Community 96 - "marketData.js"
Cohesion: 0.06
Nodes (53): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+45 more)

### Community 97 - "_tradeService.ts"
Cohesion: 0.14
Nodes (19): addSessionDelta(), persistBrokerTrades(), now(), chunkedDbGetAll(), handleCloseTradeSync(), handleOpenTradeSync(), isoOrNull(), dateContradicts() (+11 more)

### Community 98 - "BrokerSync"
Cohesion: 0.36
Nodes (5): BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), getFriendlyErrorMessage()

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.19
Nodes (18): CLOSE_FIELDS, closeMoment(), emptySessionAnalytics(), emptySessionBucket(), emptySessionDelta(), ENTRY_FIELDS, finiteOrNull(), firstMoment() (+10 more)

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 118 - "tradeAnalyticsSessions.test.js"
Cohesion: 0.20
Nodes (14): migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), emptyDelta(), emptyTradeAnalytics(), getTradeOutcome(), number(), SESSION_ANALYTICS_VERSION (+6 more)

### Community 119 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 121 - "AnalyticsPage.disciplineLock.test.jsx"
Cohesion: 0.47
Nodes (4): dayKeyAgo(), h, renderPage(), trade()

### Community 122 - "HistoryPage.setupWiring.test.jsx"
Cohesion: 0.33
Nodes (4): archiveSetup, createSetup, SETUPS, TRADE

### Community 123 - "utils.ts"
Cohesion: 0.11
Nodes (10): SQUARE_STATE, StatusSquare(), Badge(), badgeVariants, Checkbox(), CustomSelect(), DatePicker(), Spinner() (+2 more)

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

### Community 125 - "ManageSetupsDialog"
Cohesion: 0.60
Nodes (5): effectiveSlug(), findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed()

## Knowledge Gaps
- **512 isolated node(s):** `checks`, `checks`, `Env`, `Variables`, `WEB_VITAL_NAMES` (+507 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `EmptyState.jsx`, `sidebar.tsx`, `LogTradePage.jsx`, `SectionCard.jsx`, `useToast`, `ManageSetupsDialog.jsx`, `SetupCombobox.jsx`, `goldSessions.js`, `HistoryPage.jsx`, `alert.tsx`, `DataTable.jsx`, `DashboardRightSidebar.jsx`, `AnalyticsPage.jsx`, `DashboardLayout.jsx`, `utils.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `BrokerSync.jsx`, `PricingPage.jsx`, `SettingsPage.jsx`, `FirebaseBrokerRepository.js`, `DashboardRightSidebar.jsx`, `DashboardLayout.jsx`, `app/AuthenticatedApp.jsx`, `createAppServices.js`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `sessionEngine.js` to `disciplineRules.js`, `_tradeService.ts`, `tradeAnalytics.js`, `goldSessions.js`, `AnalyticsPage.jsx`, `DashboardRightSidebar.jsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `checks`, `checks`, `Env` to the rest of the system?**
  _512 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1341991341991342 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08418367346938775 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._