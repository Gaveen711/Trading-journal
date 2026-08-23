# Graph Report - xaujournal  (2026-08-23)

## Corpus Check
- 286 files · ~496,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1753 nodes · 3675 edges · 138 communities (87 shown, 51 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99babf7d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- disciplineRules.js
- BrokerSync.jsx
- AppDialog.jsx
- scripts
- cn
- devDependencies
- sidebar.tsx
- _security.ts
- tradeUtils.js
- overrides
- PricingPage.jsx
- LandingPage.jsx
- AppRoutes.jsx
- HistoryPage.jsx
- compilerOptions
- seo.js
- SettingsPage.resetTerminal.test.jsx
- components.json
- goldSessions.js
- ManageSetupsDialog.jsx
- firebaseTradeRepository.test.js
- DataTable.jsx
- FirebaseBrokerRepository.js
- AnalyticsPage.jsx
- DashboardLayout.jsx
- sessionEngine.js
- MEDIUM
- utils.ts
- BlogArticlePage.jsx
- createAppServices.js
- _tradeService.ts
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- EmptyState.jsx
- app/AuthenticatedApp.jsx
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- marketData.test.js
- FirebaseWalletRepository.js
- check-bundle-budget.mjs
- vite.config.js
- useSetups.js
- _metaapi-broker.js
- vercel.json
- firebase.d.ts
- tradeConfig.js
- _entitlementMiddleware.test.js
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- dependencies
- firebase
- @firecms/neat
- [[...route]].ts
- App.jsx
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
- migrate-broker-credential-privacy.mjs
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
- FirebaseTradeRepository.js
- LiveMarketWidget.jsx
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
- LiveMarketWidget.test.jsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons
- package.json
- tradeAnalyticsDelta
- LogTradePage.discipline.test.jsx
- useBrokerAccounts.adopt.test.jsx
- AnalyticsPage.disciplineLock.test.jsx
- HistoryPage.setupWiring.test.jsx
- DataTable.test.jsx
- DashboardLayout.sidebarWiring.test.js
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
1. `cn()` - 207 edges
2. `Button()` - 27 edges
3. `AnalyticsPage()` - 23 edges
4. `useToast()` - 21 edges
5. `resolveSessionAt()` - 20 edges
6. `tradeAnalyticsDelta()` - 19 edges
7. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
8. `isPaidPlan()` - 18 edges
9. `compilerOptions` - 18 edges
10. `overrides` - 18 edges

## Surprising Connections (you probably didn't know these)
- `persistBrokerTrades()` --calls--> `analyticsDeltaForTrades()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `tradeAnalyticsDelta()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `normalizeDeal()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_metaapi-broker.js → src/lib/sessionEngine.js
- `isSyncAllowed()` --calls--> `hasPaidAccess()`  [EXTRACTED]
  api/_auth.ts → src/lib/entitlements.js
- `deletionPatch()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_credentialFields.js

## Import Cycles
- None detected.

## Communities (138 total, 51 thin omitted)

### Community 0 - "disciplineRules.js"
Cohesion: 0.08
Nodes (24): sameRules(), useDisciplineSettings(), earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), clampRuleValue(), dayKeyMidnightMs(), DEFAULT_DISCIPLINE_RULES (+16 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.08
Nodes (24): AnalyticsPage, AuthenticatedRoutes(), BrokerSync, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage (+16 more)

### Community 2 - "AppDialog.jsx"
Cohesion: 0.09
Nodes (26): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+18 more)

### Community 3 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, admin:grant, admin:list, build, build:budget, dev, lint, migrate:broker-privacy (+6 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (39): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+31 more)

### Community 5 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, eslint, @eslint/js, devDependencies, autoprefixer, eslint, @eslint/js, tailwindcss (+15 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.08
Nodes (29): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), Sidebar() (+21 more)

### Community 7 - "_security.ts"
Cohesion: 0.15
Nodes (17): handleRemindExpiry(), handleTradeWebhook(), assertCron(), assertRequiredConfig(), escapeHtml(), hashToken(), isRecaptchaConfigured(), isValidAccountId() (+9 more)

### Community 8 - "tradeUtils.js"
Cohesion: 0.14
Nodes (22): DirectionCell(), CurrencyConverter(), ratesCache, CURRENCIES, useMonthTrades(), primarySessionForCode(), getTradeSessionCode(), isLongDirection() (+14 more)

### Community 9 - "overrides"
Cohesion: 0.11
Nodes (18): overrides, axios, braces, cross-spawn, crypto-js, elliptic, esbuild, fast-xml-parser (+10 more)

### Community 10 - "PricingPage.jsx"
Cohesion: 0.10
Nodes (22): BlogsPage, ContactPage, PricingPage, PublicFooter(), PublicNavbar(), Arrow(), CTAButton(), CTALink() (+14 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.06
Nodes (35): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), RECORD (+27 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (18): AppRoutes(), AuthenticatedApp, BlogArticlePage, LandingPage, Login, NotFoundPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS (+10 more)

### Community 13 - "HistoryPage.jsx"
Cohesion: 0.08
Nodes (37): useSessionBrokerAccounts(), useSessionWallet(), DashboardLayout(), ToastContext, useToast(), AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+29 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.11
Nodes (26): PageSEO(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema(), buildFAQSchema() (+18 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "goldSessions.js"
Cohesion: 0.13
Nodes (29): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+21 more)

### Community 19 - "ManageSetupsDialog.jsx"
Cohesion: 0.12
Nodes (17): EMPTY_LIST, EMPTY_MAP, BentoCard(), BentoGrid(), BentoIcon, Button(), buttonVariants, Input() (+9 more)

### Community 20 - "firebaseTradeRepository.test.js"
Cohesion: 0.18
Nodes (3): fake, logTrade, repository

### Community 21 - "DataTable.jsx"
Cohesion: 0.23
Nodes (12): DataTable(), hideClass(), isEnd(), Skeleton(), Table(), TableBody(), TableCaption(), TableCell() (+4 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.27
Nodes (6): FirebaseBrokerRepository, adoptBrokerCallable(), callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "AnalyticsPage.jsx"
Cohesion: 0.10
Nodes (26): TradeShareCard, readTokens(), resolveChartTheme(), seriesColor(), TOKEN_NAMES, deriveSessionStats(), getTradeStrategyTags(), isTradeAnalyticsEligible() (+18 more)

### Community 24 - "DashboardLayout.jsx"
Cohesion: 0.09
Nodes (23): Logo(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+15 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.13
Nodes (23): isSpotPollingPaused(), CODE_HUBS, EMPTY, HUB_ORDER, HUB_PRIORITY, hubWindowMs(), isDeskOpenAt(), isWeekendRestAt() (+15 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "utils.ts"
Cohesion: 0.15
Nodes (13): SQUARE_STATE, StatusSquare(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroup() (+5 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.23
Nodes (9): articles, articles, getArticle(), studyArticles, studyCategories, articles, removeJsonLd(), BlogArticlePage() (+1 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.16
Nodes (3): SubscriptionRepository, ResetTradesUseCase, FirebaseSubscriptionRepository

### Community 30 - "_tradeService.ts"
Cohesion: 0.18
Nodes (14): now(), handleCloseTradeSync(), handleOpenTradeSync(), isoOrNull(), TradeEntity, LogTradeUseCase, computePips(), isGoldSymbol() (+6 more)

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
Cohesion: 0.29
Nodes (8): db, app, auth, facebookProvider, firebaseConfig, googleProvider, fetchCountry(), Login()

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "app/AuthenticatedApp.jsx"
Cohesion: 0.07
Nodes (41): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext (+33 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.18
Nodes (12): SectionCard(), DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, Card(), CardAction(), CardContent() (+4 more)

### Community 42 - "marketData.test.js"
Cohesion: 0.15
Nodes (13): getMarketDataHealth(), PROXY_DOWN_AFTER_FAILURES, PROXY_SKIP_WINDOW_MS, subscribeMarketDataHealth(), useMarketDataHealth(), driveProxyDown(), httpStatus(), isProxyUrl() (+5 more)

### Community 44 - "check-bundle-budget.mjs"
Cohesion: 0.25
Nodes (8): budgets, directory, eager, eagerKb, files, gzipKb(), html, htmlPath

### Community 45 - "vite.config.js"
Cohesion: 0.28
Nodes (7): CHART_VENDOR, __dirname, EAGER_FORBIDDEN, manualChunks(), normalizeId(), packageOf(), REACT_VENDOR

### Community 46 - "useSetups.js"
Cohesion: 0.32
Nodes (11): compareSetups(), effectiveSlug(), findSlugOwner(), lookup(), nextSortOrder(), SEED_DEFINITIONS, seedDefaults(), SETUP_SEEDS (+3 more)

### Community 47 - "_metaapi-broker.js"
Cohesion: 0.26
Nodes (14): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+6 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "_entitlementMiddleware.test.js"
Cohesion: 0.13
Nodes (16): ACTIVE_PRO, expire(), FREE, FUTURE, get(), GRACE, incr(), LAPSED_GRACE (+8 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 58 - "[[...route]].ts"
Cohesion: 0.13
Nodes (19): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware, resend (+11 more)

### Community 59 - "App.jsx"
Cohesion: 0.06
Nodes (32): App(), AuthSyncFailure(), LinkPeek(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders() (+24 more)

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

### Community 87 - "DashboardRightSidebar.jsx"
Cohesion: 0.05
Nodes (46): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE (+38 more)

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
Cohesion: 0.17
Nodes (23): ABORTED, beginShared(), chartQuery(), directJson(), fetchSpotPrice(), fetchYahooChart(), health, inFlight (+15 more)

### Community 97 - "FirebaseTradeRepository.js"
Cohesion: 0.12
Nodes (18): addSessionDelta(), persistBrokerTrades(), baseTrade, chunkedDbGetAll(), dateContradicts(), ENTRY_TIERS, entryInstant(), FirebaseTradeRepository (+10 more)

### Community 98 - "LiveMarketWidget.jsx"
Cohesion: 0.27
Nodes (11): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+3 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.11
Nodes (32): effectiveSlug(), findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed(), CLOSE_FIELDS, closeMoment(), dayMatchesInstant() (+24 more)

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "LiveMarketWidget.test.jsx"
Cohesion: 0.24
Nodes (3): mountWidget(), selectTimeframe(), settle()

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 118 - "tradeAnalyticsDelta"
Cohesion: 0.17
Nodes (18): apply, args, main(), maxUsers, migrateAnalytics(), migrateBrokerJobs(), mode, startAfterBrokerPath (+10 more)

### Community 119 - "LogTradePage.discipline.test.jsx"
Cohesion: 0.40
Nodes (3): dayKeyAgo(), h, trade()

### Community 121 - "AnalyticsPage.disciplineLock.test.jsx"
Cohesion: 0.47
Nodes (4): dayKeyAgo(), h, renderPage(), trade()

### Community 122 - "HistoryPage.setupWiring.test.jsx"
Cohesion: 0.33
Nodes (4): archiveSetup, createSetup, SETUPS, TRADE

### Community 123 - "DataTable.test.jsx"
Cohesion: 0.40
Nodes (3): baseProps, columns, rows

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

## Knowledge Gaps
- **508 isolated node(s):** `BentoIcon`, `SidebarContextProps`, `ProGateOptions`, `Env`, `Variables` (+503 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `AppDialog.jsx`, `EmptyState.jsx`, `sidebar.tsx`, `tradeUtils.js`, `SectionCard.jsx`, `HistoryPage.jsx`, `goldSessions.js`, `ManageSetupsDialog.jsx`, `AnalyticsPage.jsx`, `DataTable.jsx`, `DashboardRightSidebar.jsx`, `DashboardLayout.jsx`, `utils.ts`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `BrokerSync.jsx`, `PricingPage.jsx`, `HistoryPage.jsx`, `FirebaseBrokerRepository.js`, `DashboardRightSidebar.jsx`, `DashboardLayout.jsx`, `App.jsx`, `createAppServices.js`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `_tradeService.ts` to `FirebaseTradeRepository.js`, `tradeAnalytics.js`, `tradeUtils.js`, `_metaapi-broker.js`, `goldSessions.js`, `DashboardRightSidebar.jsx`, `sessionEngine.js`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `BentoIcon`, `SidebarContextProps`, `ProGateOptions` to the rest of the system?**
  _508 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0796221322537112 - nodes in this community are weakly interconnected._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07957957957957958 - nodes in this community are weakly interconnected._
- **Should `AppDialog.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._