# Graph Report - xaujournal  (2026-08-26)

## Corpus Check
- 286 files · ~496,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2024 nodes · 4214 edges · 163 communities (108 shown, 55 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b76cf22`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- disciplineRules.js
- BrokerSync.jsx
- button.tsx
- scripts
- cn
- devDependencies
- DashboardLayout.jsx
- clone
- ManageSetupsDialog.jsx
- overrides
- ContactPage.jsx
- Hero.jsx
- PricingPage.jsx
- HistoryPage.jsx
- compilerOptions
- LandingPage.jsx
- marketData.test.js
- components.json
- goldSessions.js
- SetupCombobox.jsx
- firebaseTradeRepository.test.js
- DataTable.jsx
- FirebaseBrokerRepository.js
- useToast
- dropdown-menu.tsx
- sessionEngine.js
- MEDIUM
- utils.ts
- BlogsPage.jsx
- db
- FirebaseTradeRepository.js
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
- compilerOptions
- JournalRepository
- useAppTheme
- class-variance-authority
- EmptyState.jsx
- _metaapi-broker.js
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- capture-shots.mjs
- createAppServices.js
- check-bundle-budget.mjs
- vite.config.js
- _entitlementMiddleware.ts
- demoData.js
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
- alert.tsx
- react-chartjs-2
- react-dom
- react-router-dom
- resend
- tailwind-merge
- tw-animate-css
- @vercel/analytics
- @vercel/kv
- @vercel/speed-insights
- app/AuthenticatedApp.jsx
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
- inMemoryRepositories.js
- LiveMarketWidget.jsx
- marketData.js
- _tradeService.ts
- AnalyticsPage.jsx
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
- useBrokerAccounts.js
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons
- package.json
- SettingsPage
- LogTradePage.discipline.test.jsx
- useBrokerAccounts.adopt.test.jsx
- ErrorBoundary.jsx
- HistoryPage.setupWiring.test.jsx
- BlogArticlePage.jsx
- DashboardLayout.sidebarWiring.test.js
- AuthenticatedRoutes.jsx
- clsx
- eslint-plugin-react-hooks
- ShowcaseApp.jsx
- badge.tsx
- toast.tsx
- postcss
- PublicSite.jsx
- @testing-library/jest-dom
- EditTradeModal.submit.test.jsx
- useSetups.js
- consolidateBrokerConnect
- @types/react-dom
- @vitejs/plugin-react
- LiveMarketWidget.test.jsx
- build-og.mjs
- FloatingDockNavigation.jsx
- TradeRepository
- DashboardLayout.profileMenu.test.js
- eslint
- sharp
- tailwindcss
- typescript-eslint
- vercel
- vite
- vitest
- shots/README.md
- useTrades.editTrade.test.jsx
- entitlements.js
- useAppServices
- tradeService.js
- InMemoryJournalRepository
- InMemoryBrokerRepository
- InMemorySubscriptionRepository

## God Nodes (most connected - your core abstractions)
1. `cn()` - 211 edges
2. `Button()` - 29 edges
3. `useToast()` - 23 edges
4. `AnalyticsPage()` - 23 edges
5. `resolveSessionAt()` - 22 edges
6. `tradeAnalyticsDelta()` - 19 edges
7. `formatCurrency()` - 19 edges
8. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
9. `overrides` - 18 edges
10. `isPaidPlan()` - 18 edges

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

## Communities (163 total, 55 thin omitted)

### Community 0 - "disciplineRules.js"
Cohesion: 0.08
Nodes (23): sameRules(), useDisciplineSettings(), earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), clampRuleValue(), dayKeyMidnightMs(), DEFAULT_DISCIPLINE_RULES (+15 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.09
Nodes (28): BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BrokerWall(), PLATFORMS, BROKER_CHIP_MARKS (+20 more)

### Community 2 - "button.tsx"
Cohesion: 0.06
Nodes (40): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+32 more)

### Community 3 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, admin:grant, admin:list, build, build:budget, dev, lint, migrate:broker-privacy (+8 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (41): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), BentoCard(), BentoGrid() (+33 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, @eslint/js, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer, @eslint/js (+17 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.06
Nodes (42): useSessionBrokerAccounts(), DashboardLayout(), Logo(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+34 more)

### Community 7 - "clone"
Cohesion: 0.13
Nodes (6): byDateDesc(), clone(), docSnapshot(), InMemorySetupRepository, InMemoryTradeRepository, querySnapshot()

### Community 8 - "ManageSetupsDialog.jsx"
Cohesion: 0.16
Nodes (17): effectiveSlug(), EMPTY_LIST, EMPTY_MAP, findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed(), actionIn() (+9 more)

### Community 9 - "overrides"
Cohesion: 0.11
Nodes (18): overrides, axios, braces, cross-spawn, crypto-js, elliptic, esbuild, fast-xml-parser (+10 more)

### Community 10 - "ContactPage.jsx"
Cohesion: 0.13
Nodes (20): ContactPage, BROKER_COUNTS, buildPayload(), COMING_SOON_NAMES, ContactPage(), describedBy(), EMPTY_FORM, FIELD_IDS (+12 more)

### Community 11 - "Hero.jsx"
Cohesion: 0.09
Nodes (28): Chapters, DESK_NAMES, initialRailId(), RAIL, RAIL_TO_DESK, ReadChapterRail(), SessionFigures(), signClass() (+20 more)

### Community 12 - "PricingPage.jsx"
Cohesion: 0.07
Nodes (27): AppRoutes(), AuthenticatedApp, isShowcaseRequested(), LandingPage, PricingPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage (+19 more)

### Community 13 - "HistoryPage.jsx"
Cohesion: 0.12
Nodes (25): EmptyState(), SectionCard(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter() (+17 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "LandingPage.jsx"
Cohesion: 0.10
Nodes (32): Proof(), STEPS, PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags() (+24 more)

### Community 16 - "marketData.test.js"
Cohesion: 0.17
Nodes (11): getMarketDataHealth(), subscribeMarketDataHealth(), useMarketDataHealth(), driveProxyDown(), httpStatus(), isProxyUrl(), NOW, route() (+3 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "goldSessions.js"
Cohesion: 0.11
Nodes (34): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+26 more)

### Community 19 - "SetupCombobox.jsx"
Cohesion: 0.20
Nodes (10): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+2 more)

### Community 20 - "firebaseTradeRepository.test.js"
Cohesion: 0.18
Nodes (3): fake, logTrade, repository

### Community 21 - "DataTable.jsx"
Cohesion: 0.16
Nodes (15): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Skeleton(), Table() (+7 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.27
Nodes (6): FirebaseBrokerRepository, adoptBrokerCallable(), callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "useToast"
Cohesion: 0.19
Nodes (7): toast, WalletTopUpDialog(), CurrencyConverter(), ratesCache, useToast(), Input(), CURRENCIES

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.11
Nodes (23): context, sdk, CODE_HUBS, EMPTY, HUB_ORDER, HUB_PRIORITY, hubWindowMs(), isDeskOpenAt() (+15 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "utils.ts"
Cohesion: 0.14
Nodes (14): DirectionCell(), SQUARE_STATE, StatusSquare(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger() (+6 more)

### Community 28 - "BlogsPage.jsx"
Cohesion: 0.10
Nodes (16): BlogsPage, Arrow(), articles, articles, studyArticles, studyCategories, articles, COUNTS (+8 more)

### Community 29 - "db"
Cohesion: 0.20
Nodes (3): SubscriptionRepository, FirebaseSubscriptionRepository, db

### Community 30 - "FirebaseTradeRepository.js"
Cohesion: 0.17
Nodes (14): TradeEntity, LogTradeUseCase, dateContradicts(), ENTRY_TIERS, entryInstant(), resolveEditedSession(), SESSION_EDIT_FIELDS, preciseMoments() (+6 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "_firebase.js"
Cohesion: 0.21
Nodes (8): db, isDbReady(), app, mockKvStore, args, list, revoke, uid

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "useAppTheme"
Cohesion: 0.22
Nodes (8): AppProviders(), Login, ThemeContext, ThemeProvider(), useAppTheme(), fetchCountry(), Login(), ShowcaseContent()

### Community 37 - "EmptyState.jsx"
Cohesion: 0.33
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "_metaapi-broker.js"
Cohesion: 0.22
Nodes (18): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+10 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.19
Nodes (11): DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, Card(), CardAction(), CardContent(), CardDescription() (+3 more)

### Community 42 - "capture-shots.mjs"
Cohesion: 0.14
Nodes (19): BASE_URL, BROWSERS, captureRoute(), Cdp, debug(), encode(), freePort(), launchBrowser() (+11 more)

### Community 43 - "createAppServices.js"
Cohesion: 0.16
Nodes (3): WalletRepository, ResetTradesUseCase, FirebaseWalletRepository

### Community 44 - "check-bundle-budget.mjs"
Cohesion: 0.25
Nodes (8): budgets, directory, eager, eagerKb, files, gzipKb(), html, htmlPath

### Community 45 - "vite.config.js"
Cohesion: 0.28
Nodes (7): CHART_VENDOR, __dirname, EAGER_FORBIDDEN, manualChunks(), normalizeId(), packageOf(), REACT_VENDOR

### Community 46 - "_entitlementMiddleware.ts"
Cohesion: 0.25
Nodes (12): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), isSyncAllowed(), verifyIdToken(), assertPro(), ProGateOptions, requireAuth() (+4 more)

### Community 47 - "demoData.js"
Cohesion: 0.10
Nodes (24): ANCHOR_UTC, buildTrade(), CONFLUENCE, CONVICTION, dateForDay(), DEMO_BROKER_ACCOUNTS, DEMO_JOURNALS, DEMO_NET_PNL (+16 more)

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
Cohesion: 0.09
Nodes (35): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware, resend (+27 more)

### Community 59 - "App.jsx"
Cohesion: 0.11
Nodes (21): App(), AuthSyncFailure(), LinkPeek(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), isPublicNavbarPath() (+13 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 83 - "app/AuthenticatedApp.jsx"
Cohesion: 0.20
Nodes (10): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AuthenticatedSessionProvider(), BrokerAccountsContext, useSessionWallet(), WalletContext, VerifyEmailBanner() (+2 more)

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
Cohesion: 0.11
Nodes (23): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), EMPTY_SETUPS, GRADES, legacySessionPrefill() (+15 more)

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

### Community 94 - "inMemoryRepositories.js"
Cohesion: 0.15
Nodes (5): BrokerRepository, channel(), createInMemoryRepositories(), createShowcaseStore(), InMemoryWalletRepository

### Community 95 - "LiveMarketWidget.jsx"
Cohesion: 0.21
Nodes (14): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+6 more)

### Community 96 - "marketData.js"
Cohesion: 0.15
Nodes (25): ABORTED, beginShared(), chartQuery(), directJson(), fetchSpotPrice(), fetchYahooChart(), health, inFlight (+17 more)

### Community 97 - "_tradeService.ts"
Cohesion: 0.13
Nodes (18): addSessionDelta(), persistBrokerTrades(), baseTrade, now(), chunkedDbGetAll(), handleTradeWebhook(), hashToken(), handleCloseTradeSync() (+10 more)

### Community 98 - "AnalyticsPage.jsx"
Cohesion: 0.07
Nodes (45): TradeShareCard, useMonthTrades(), readTokens(), resolveChartTheme(), seriesColor(), TOKEN_NAMES, primarySessionForCode(), deriveSessionStats() (+37 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.11
Nodes (35): migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), CLOSE_FIELDS, dayMatchesInstant(), emptyDelta(), emptySessionAnalytics(), emptySessionBucket() (+27 more)

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "useBrokerAccounts.js"
Cohesion: 0.32
Nodes (15): dropLocalAccount(), hasServerLogin(), useBrokerAccounts(), addAccount(), hasSessionCredential(), removeAccount(), syncAccount(), accountsKey() (+7 more)

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 118 - "SettingsPage"
Cohesion: 0.18
Nodes (6): ACCENT_TEMPLATES, accentTemplateName(), getAuthErrorMessage(), SettingsPage(), toRuleDraft(), toast

### Community 119 - "LogTradePage.discipline.test.jsx"
Cohesion: 0.40
Nodes (3): dayKeyAgo(), h, trade()

### Community 121 - "ErrorBoundary.jsx"
Cohesion: 0.15
Nodes (8): cardStyle, detailStyle, ErrorBoundary, eyebrowStyle, iconStyle, primaryButtonStyle, secondaryButtonStyle, shellStyle

### Community 122 - "HistoryPage.setupWiring.test.jsx"
Cohesion: 0.33
Nodes (4): archiveSetup, createSetup, SETUPS, TRADE

### Community 123 - "BlogArticlePage.jsx"
Cohesion: 0.15
Nodes (16): BlogArticlePage, NotFoundPage, getArticle(), BlogArticlePage(), escapeRegExp(), formatUpdated(), Headline(), NOTES (+8 more)

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

### Community 125 - "AuthenticatedRoutes.jsx"
Cohesion: 0.13
Nodes (10): AnalyticsPage, AuthenticatedRoutes(), BrokerSync, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage (+2 more)

### Community 128 - "ShowcaseApp.jsx"
Cohesion: 0.20
Nodes (12): AppServicesContext, AppServicesProvider(), createAppServices(), DEMO_DATASET, DEMO_DISPLAY_NAME, DEMO_EMAIL, DEMO_UID, fakeAuth (+4 more)

### Community 130 - "toast.tsx"
Cohesion: 0.15
Nodes (7): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), ToastTitle(), ToastViewport()

### Community 132 - "PublicSite.jsx"
Cohesion: 0.15
Nodes (14): FAQ(), PLAN_LINES, PricingBridge(), ArrowOut(), CTALink(), Panel(), SectionHead(), Shot() (+6 more)

### Community 134 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 135 - "useSetups.js"
Cohesion: 0.28
Nodes (12): compareSetups(), effectiveSlug(), findSlugOwner(), firestoreCatalog, lookup(), nextSortOrder(), SEED_DEFINITIONS, seedDefaults() (+4 more)

### Community 136 - "consolidateBrokerConnect"
Cohesion: 0.26
Nodes (11): deletionPatch(), AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect() (+3 more)

### Community 140 - "LiveMarketWidget.test.jsx"
Cohesion: 0.24
Nodes (3): mountWidget(), selectTimeframe(), settle()

### Community 141 - "build-og.mjs"
Cohesion: 0.40
Nodes (3): out, root, shot

### Community 153 - "useTrades.editTrade.test.jsx"
Cohesion: 0.22
Nodes (6): APPLIED_PATCH, harness, LATER_TRADE, OLD_TRADE, RECENT_TRADE, USER

### Community 154 - "entitlements.js"
Cohesion: 0.43
Nodes (5): FREE_SUBSCRIPTION, useSubscription(), getEntitlements(), hasPaidAccess(), NOW

### Community 155 - "useAppServices"
Cohesion: 0.48
Nodes (5): useAppServices(), useJournals(), byDateDesc(), mergeTrades(), useTrades()

### Community 156 - "tradeService.js"
Cohesion: 0.52
Nodes (4): useTradeController(), getRemainingFreeTrades(), isProPlan(), submitTrade()

## Knowledge Gaps
- **572 isolated node(s):** `checks`, `checks`, `Env`, `Variables`, `WEB_VITAL_NAMES` (+567 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `badge.tsx`, `button.tsx`, `alert.tsx`, `toast.tsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `AnalyticsPage.jsx`, `tradeAnalytics.js`, `SectionCard.jsx`, `HistoryPage.jsx`, `FloatingDockNavigation.jsx`, `goldSessions.js`, `SetupCombobox.jsx`, `useToast`, `DataTable.jsx`, `DashboardRightSidebar.jsx`, `dropdown-menu.tsx`, `utils.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `FirebaseTradeRepository.js` to `_tradeService.ts`, `_metaapi-broker.js`, `tradeAnalytics.js`, `demoData.js`, `goldSessions.js`, `DashboardRightSidebar.jsx`, `sessionEngine.js`, `LiveMarketWidget.jsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `auth` connect `DashboardRightSidebar.jsx` to `BrokerSync.jsx`, `useAppTheme`, `DashboardLayout.jsx`, `createAppServices.js`, `PricingPage.jsx`, `HistoryPage.jsx`, `FirebaseBrokerRepository.js`, `App.jsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `checks`, `checks`, `Env` to the rest of the system?**
  _572 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08250355618776671 - nodes in this community are weakly interconnected._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08780487804878048 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.059907834101382486 - nodes in this community are weakly interconnected._