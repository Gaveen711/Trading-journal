# Graph Report - xaujournal  (2026-08-16)

## Corpus Check
- 201 files · ~557,914 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1330 nodes · 2495 edges · 107 communities (71 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cfb7a9c8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- utils.ts
- PricingPage.jsx
- tradeAnalytics.js
- cn
- devDependencies
- sidebar.tsx
- overrides
- ErrorBoundary.jsx
- overrides
- PublicSite.jsx
- deskDemo.js
- AppRoutes.jsx
- JournalPage.jsx
- compilerOptions
- seo.js
- AppServicesContext.jsx
- components.json
- FooterNav.jsx
- FirebaseTradeRepository.js
- EASetup.jsx
- DataTable.jsx
- FirebaseBrokerRepository.js
- DashboardRightSidebar.jsx
- DashboardLayout.jsx
- index.js
- useToast
- AnalyticsPage.jsx
- HistoryPage.jsx
- createAppServices.js
- AuthenticatedRoutes.jsx
- MT4/MT5 Broker Login Sync Implementation
- toast.tsx
- compilerOptions
- JournalRepository
- firebase.js
- dependencies
- EmptyState.jsx
- _metaapi-broker.js
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- CalendarPage.jsx
- FirebaseSubscriptionRepository.js
- FirebaseWalletRepository.js
- check-bundle-budget.mjs
- vite.config.js
- tradeService.js
- LandingPage.jsx
- vercel.json
- firebase.d.ts
- tradeConfig.js
- LogTradePage.jsx
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- _tradeService.ts
- dotenv
- firebase
- @firecms/neat
- @fontsource-variable/geist
- framer-motion
- Production Operations & Maintenance Guide — xaujournal
- @google-cloud/storage
- hono
- lucide-react
- @radix-ui/react-slot
- XAU Journal × MetaApi — Architecture
- react-bootstrap-icons
- react-chartjs-2
- react-dom
- react-router-dom
- resend
- tailwind-merge
- tw-animate-css
- @vercel/analytics
- @vercel/kv
- @vercel/speed-insights
- migrate-broker-credential-privacy.mjs
- migrate-performance-data.mjs
- App.jsx
- app/AuthenticatedApp.jsx
- SessionRail.jsx
- Run xaujournal (dev)
- Run xaujournal (dev)
- 🛡️ Maintenance & Security Post-Deployment Checklist
- 🚀 Project Scope
- XAU Journal Architecture
- useRouteExperience.js
- popover.tsx
- RefundPolicyPage.jsx
- TermsOfServicePage.jsx
- StatusSquare.jsx
- rules/graphify.md
- workflows/graphify.md
- @base-ui/react
- chart.js
- clsx
- html2canvas
- firebase-functions
- metaapi.cloud-sdk

## God Nodes (most connected - your core abstractions)
1. `cn()` - 194 edges
2. `Button()` - 25 edges
3. `overrides` - 19 edges
4. `useToast()` - 19 edges
5. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
6. `overrides` - 18 edges
7. `compilerOptions` - 18 edges
8. `tradeAnalyticsDelta()` - 16 edges
9. `formatSigned()` - 14 edges
10. `useAppServices()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_firebase.js
- `handleCloseTradeSync()` --calls--> `subtractTradeAnalytics()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `analyticsDeltaForTrades()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `subtractTradeAnalytics()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `tradeAnalyticsDelta()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js

## Import Cycles
- None detected.

## Communities (107 total, 36 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.10
Nodes (27): getClientIp(), allowedOrigins, corsMiddleware(), rateLimitMiddleware(), secureHeadersMiddleware, resend, AccountLockResult, cachedJson() (+19 more)

### Community 1 - "utils.ts"
Cohesion: 0.13
Nodes (11): Badge(), badgeVariants, BentoCard(), BentoGrid(), BentoIcon, Checkbox(), Spinner(), ToggleGroupContext (+3 more)

### Community 2 - "PricingPage.jsx"
Cohesion: 0.08
Nodes (29): AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY, ProFeatureUpsellModal() (+21 more)

### Community 3 - "tradeAnalytics.js"
Cohesion: 0.21
Nodes (14): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), emptyDelta(), emptyTradeAnalytics() (+6 more)

### Community 4 - "cn"
Cohesion: 0.09
Nodes (36): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+28 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer (+39 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.07
Nodes (33): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), Sidebar() (+25 more)

### Community 7 - "overrides"
Cohesion: 0.04
Nodes (46): eslint-config-google, firebase-functions-test, dependencies, firebase-admin, firebase-functions, metaapi.cloud-sdk, description, devDependencies (+38 more)

### Community 8 - "ErrorBoundary.jsx"
Cohesion: 0.14
Nodes (9): AppProviders(), cardStyle, detailStyle, ErrorBoundary, eyebrowStyle, iconStyle, primaryButtonStyle, secondaryButtonStyle (+1 more)

### Community 9 - "overrides"
Cohesion: 0.06
Nodes (35): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+27 more)

### Community 10 - "PublicSite.jsx"
Cohesion: 0.13
Nodes (19): PublicFooter(), PublicNavbar(), CTAButton(), CTALink(), Panel(), readTheme(), SectionHead(), ThemeToggle() (+11 more)

### Community 11 - "deskDemo.js"
Cohesion: 0.13
Nodes (20): arcPath(), CANDLES, DIAL, DIAL_SESSIONS, fmt(), point(), REPLAY, SessionDial() (+12 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.15
Nodes (10): AppRoutes(), ContactPage, LandingPage, Login, NotFoundPage, PricingPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS (+2 more)

### Community 13 - "JournalPage.jsx"
Cohesion: 0.14
Nodes (20): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia() (+12 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ESNext, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.10
Nodes (24): PageSEO(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyPageSEO(), buildFAQSchema(), buildOrganizationSchema(), buildSoftwareSchema(), buildWebSiteSchema() (+16 more)

### Community 16 - "AppServicesContext.jsx"
Cohesion: 0.14
Nodes (16): AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, createAppServices(), toIsoString() (+8 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.19
Nodes (19): CITY_FORMATTERS, cityTime(), LEGAL_LINKS, PRODUCT_LINKS, SessionClocks(), SUPPORT_LINKS, MenuClock(), NAV_LINKS (+11 more)

### Community 19 - "FirebaseTradeRepository.js"
Cohesion: 0.13
Nodes (3): TradeRepository, analyticsIncrements(), FirebaseTradeRepository

### Community 20 - "EASetup.jsx"
Cohesion: 0.13
Nodes (14): BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BrokerLogo(), BROKERS, EASetup(), handleConnect(), handleManualSync() (+6 more)

### Community 21 - "DataTable.jsx"
Cohesion: 0.18
Nodes (14): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Table(), TableBody() (+6 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.16
Nodes (6): BrokerRepository, FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "DashboardRightSidebar.jsx"
Cohesion: 0.14
Nodes (23): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), GRADES, MOODS, SESSION_OPTIONS (+15 more)

### Community 24 - "DashboardLayout.jsx"
Cohesion: 0.10
Nodes (23): useSessionBrokerAccounts(), useSessionWallet(), ACCENT_TEMPLATES, DashboardLayout(), Logo(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent() (+15 more)

### Community 25 - "index.js"
Cohesion: 0.18
Nodes (13): analyticsDeltaForTrades(), db, dealToTrade(), { defineSecret }, { getFirestore, FieldValue }, getMetaApi(), getTradingSession(), { initializeApp } (+5 more)

### Community 26 - "useToast"
Cohesion: 0.21
Nodes (10): AuthenticatedAppContent(), CURRENCIES, CurrencyConverter(), ratesCache, ToastContext, ToastProvider(), useToast(), FREE_SUBSCRIPTION (+2 more)

### Community 27 - "AnalyticsPage.jsx"
Cohesion: 0.16
Nodes (15): TradeShareCard, Skeleton(), getTradeStrategyTags(), formatCurrencyCompact(), AnalyticsPage(), chip(), cssHsl(), pnlCell() (+7 more)

### Community 28 - "HistoryPage.jsx"
Cohesion: 0.20
Nodes (9): CustomSelect(), Input(), chip(), DetailField(), formatPips(), getTimestampMs(), HISTORY_COLUMNS, HistoryPage() (+1 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.22
Nodes (3): TradeEntity, LogTradeUseCase, ResetTradesUseCase

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.18
Nodes (8): AnalyticsPage, CheckoutCancel, CheckoutSuccess, EASetup, HistoryPage, JournalPage, LogTradePage, SettingsPage

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "toast.tsx"
Cohesion: 0.15
Nodes (7): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), ToastTitle(), ToastViewport()

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.29
Nodes (8): db, app, auth, facebookProvider, firebaseConfig, googleProvider, fetchCountry(), Login()

### Community 36 - "dependencies"
Cohesion: 0.22
Nodes (9): class-variance-authority, @google-cloud/firestore, @google-cloud/recaptcha-enterprise, dependencies, class-variance-authority, @google-cloud/firestore, @google-cloud/recaptcha-enterprise, react (+1 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "_metaapi-broker.js"
Cohesion: 0.26
Nodes (14): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+6 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "CalendarPage.jsx"
Cohesion: 0.14
Nodes (17): CalendarPage, SectionCard(), DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, Card(), CardAction() (+9 more)

### Community 44 - "check-bundle-budget.mjs"
Cohesion: 0.25
Nodes (8): budgets, directory, eager, eagerKb, files, gzipKb(), html, htmlPath

### Community 45 - "vite.config.js"
Cohesion: 0.28
Nodes (7): CHART_VENDOR, __dirname, EAGER_FORBIDDEN, manualChunks(), normalizeId(), packageOf(), REACT_VENDOR

### Community 46 - "tradeService.js"
Cohesion: 0.52
Nodes (4): useTradeController(), getRemainingFreeTrades(), isProPlan(), submitTrade()

### Community 47 - "LandingPage.jsx"
Cohesion: 0.10
Nodes (10): hourlyProfile(), hourWindow(), sessionsAtHour(), ArithmeticSection(), DESK_NAMES, EASE, HourTape(), SCREENS (+2 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "LogTradePage.jsx"
Cohesion: 0.13
Nodes (17): LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, Tabs(), TabsContent(), TabsList(), tabsListVariants (+9 more)

### Community 54 - "_tradeService.ts"
Cohesion: 0.21
Nodes (12): getUidFromContext(), isSyncAllowed(), verifyIdToken(), db, isDbReady(), now(), app, mockKvStore (+4 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 84 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.36
Nodes (9): initAdmin(), ACCOUNT_CREDENTIAL_FIELDS, apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts(), scrubUsers() (+1 more)

### Community 85 - "migrate-performance-data.mjs"
Cohesion: 0.25
Nodes (8): apply, args, main(), maxUsers, migrateBrokerJobs(), mode, startAfterBrokerPath, startAfterUser

### Community 86 - "App.jsx"
Cohesion: 0.31
Nodes (6): App(), AuthSyncFailure(), ScrollProgress(), PublicNavSkeleton(), hasPersistedAuthHint(), useAuthSession()

### Community 87 - "app/AuthenticatedApp.jsx"
Cohesion: 0.24
Nodes (7): AuthenticatedApp(), PUBLIC_LEGAL_PATHS, AuthenticatedOverlays(), AuthenticatedApp, AuthenticatedRoutes(), PageLoader(), useOnboarding()

### Community 88 - "SessionRail.jsx"
Cohesion: 0.27
Nodes (9): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+1 more)

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

### Community 94 - "useRouteExperience.js"
Cohesion: 0.52
Nodes (5): clearUxState(), shouldSkip(), useRouteExperience(), observeRouteWebVitals(), ratingFor()

### Community 95 - "popover.tsx"
Cohesion: 0.29
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 96 - "RefundPolicyPage.jsx"
Cohesion: 0.40
Nodes (3): RefundPolicyPage, SECTIONS, SEO

### Community 97 - "TermsOfServicePage.jsx"
Cohesion: 0.40
Nodes (3): TermsOfServicePage, SECTIONS, SEO

## Knowledge Gaps
- **425 isolated node(s):** `checks`, `checks`, `Env`, `Variables`, `GET` (+420 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `toast.tsx`, `utils.ts`, `PricingPage.jsx`, `StatusSquare.jsx`, `EmptyState.jsx`, `sidebar.tsx`, `CalendarPage.jsx`, `JournalPage.jsx`, `LogTradePage.jsx`, `DataTable.jsx`, `DashboardRightSidebar.jsx`, `SessionRail.jsx`, `DashboardLayout.jsx`, `AnalyticsPage.jsx`, `HistoryPage.jsx`, `popover.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `PricingPage.jsx`, `JournalPage.jsx`, `EASetup.jsx`, `App.jsx`, `DashboardRightSidebar.jsx`, `DashboardLayout.jsx`, `FirebaseBrokerRepository.js`, `createAppServices.js`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `JournalPage.jsx`, `EASetup.jsx`, `app/AuthenticatedApp.jsx`, `DashboardRightSidebar.jsx`, `DashboardLayout.jsx`, `HistoryPage.jsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `checks`, `checks`, `Env` to the rest of the system?**
  _425 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[[...route]].ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
- **Should `PricingPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08309178743961353 - nodes in this community are weakly interconnected._