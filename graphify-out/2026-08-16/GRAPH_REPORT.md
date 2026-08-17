# Graph Report - xaujournal  (2026-08-16)

## Corpus Check
- 208 files · ~377,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1413 nodes · 2625 edges · 117 communities (80 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bdb05cb1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- HistoryPage.jsx
- PricingPage.jsx
- tradeAnalytics.js
- cn
- devDependencies
- sidebar.tsx
- overrides
- ErrorBoundary.jsx
- overrides
- PublicSite.jsx
- LandingPage.jsx
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
- dropdown-menu.tsx
- index.js
- MEDIUM
- AnalyticsPage.jsx
- BlogsPage.jsx
- createAppServices.js
- AuthenticatedRoutes.jsx
- MT4/MT5 Broker Login Sync Implementation
- _tradeService.ts
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- EmptyState.jsx
- DashboardLayout.jsx
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- FirebaseSubscriptionRepository.js
- FirebaseWalletRepository.js
- check-bundle-budget.mjs
- vite.config.js
- tradeService.js
- PublicVisuals.jsx
- vercel.json
- firebase.d.ts
- tradeConfig.js
- utils.ts
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- AuthenticatedSessionContext.jsx
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
- field.tsx
- react-chartjs-2
- react-dom
- react-router-dom
- resend
- tailwind-merge
- tw-animate-css
- @vercel/analytics
- @vercel/kv
- @vercel/speed-insights
- HIGH
- toast.tsx
- migrate-broker-credential-privacy.mjs
- app/AuthenticatedApp.jsx
- SECURITY-AUDIT-2026-08.md
- Run xaujournal (dev)
- Run xaujournal (dev)
- 🛡️ Maintenance & Security Post-Deployment Checklist
- 🚀 Project Scope
- XAU Journal Architecture
- BrokerRepository
- alert.tsx
- useRouteExperience.js
- migrate-performance-data.mjs
- popover.tsx
- rules/graphify.md
- workflows/graphify.md
- C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out
- H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset
- clsx
- html2canvas
- H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit
- metaapi.cloud-sdk
- H-03 — Rate limiting keys on a client-suppliable header
- M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection
- ToastContext.jsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @base-ui/react
- dotenv
- firebase-functions

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

## Communities (117 total, 37 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.10
Nodes (27): getClientIp(), allowedOrigins, corsMiddleware(), rateLimitMiddleware(), secureHeadersMiddleware, resend, AccountLockResult, cachedJson() (+19 more)

### Community 1 - "HistoryPage.jsx"
Cohesion: 0.13
Nodes (16): CURRENCIES, CurrencyConverter(), ratesCache, useToast(), TradeShareCard, getTradeStrategyTags(), formatNumber(), ShareTradeModal (+8 more)

### Community 2 - "PricingPage.jsx"
Cohesion: 0.07
Nodes (35): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+27 more)

### Community 3 - "tradeAnalytics.js"
Cohesion: 0.21
Nodes (14): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), emptyDelta(), emptyTradeAnalytics() (+6 more)

### Community 4 - "cn"
Cohesion: 0.13
Nodes (22): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Badge(), badgeVariants (+14 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer (+39 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): Input(), Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+23 more)

### Community 7 - "overrides"
Cohesion: 0.04
Nodes (46): eslint-config-google, firebase-functions-test, dependencies, firebase-admin, firebase-functions, metaapi.cloud-sdk, description, devDependencies (+38 more)

### Community 8 - "ErrorBoundary.jsx"
Cohesion: 0.15
Nodes (8): cardStyle, detailStyle, ErrorBoundary, eyebrowStyle, iconStyle, primaryButtonStyle, secondaryButtonStyle, shellStyle

### Community 9 - "overrides"
Cohesion: 0.06
Nodes (35): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+27 more)

### Community 10 - "PublicSite.jsx"
Cohesion: 0.18
Nodes (10): ContactPage, PublicNavbar(), Arrow(), CTAButton(), Panel(), SectionHead(), TextLink(), Wordmark() (+2 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.06
Nodes (37): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), pad2() (+29 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.09
Nodes (21): AppRoutes(), BlogArticlePage, BlogsPage, LandingPage, Login, NotFoundPage, PricingPage, PrivacyPolicyPage (+13 more)

### Community 13 - "JournalPage.jsx"
Cohesion: 0.15
Nodes (18): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia() (+10 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ESNext, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.11
Nodes (27): getArticle(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), buildArticleSchema(), buildFAQSchema(), buildOrganizationSchema() (+19 more)

### Community 16 - "AppServicesContext.jsx"
Cohesion: 0.25
Nodes (10): AppServicesContext, AppServicesProvider(), useAppServices(), createAppServices(), useJournals(), pad2(), useMonthTrades(), byDateDesc() (+2 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.13
Nodes (29): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+21 more)

### Community 19 - "FirebaseTradeRepository.js"
Cohesion: 0.13
Nodes (3): TradeRepository, analyticsIncrements(), FirebaseTradeRepository

### Community 20 - "EASetup.jsx"
Cohesion: 0.12
Nodes (15): EASetup, BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BrokerLogo(), BROKERS, EASetup(), handleConnect() (+7 more)

### Community 21 - "DataTable.jsx"
Cohesion: 0.16
Nodes (15): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Skeleton(), Table() (+7 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.30
Nodes (5): FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "DashboardRightSidebar.jsx"
Cohesion: 0.12
Nodes (24): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), GRADES, MOODS, SESSION_OPTIONS (+16 more)

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 25 - "index.js"
Cohesion: 0.18
Nodes (13): analyticsDeltaForTrades(), db, dealToTrade(), { defineSecret }, { getFirestore, FieldValue }, getMetaApi(), getTradingSession(), { initializeApp } (+5 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "AnalyticsPage.jsx"
Cohesion: 0.14
Nodes (18): AnalyticsPage, LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, ThemeContext, ThemeProvider(), useAppTheme() (+10 more)

### Community 28 - "BlogsPage.jsx"
Cohesion: 0.17
Nodes (11): PageSEO(), articles, articles, studyArticles, studyCategories, articles, useDeskReveal(), applyPageSEO() (+3 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.22
Nodes (3): TradeEntity, LogTradeUseCase, ResetTradesUseCase

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.15
Nodes (11): CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage, SettingsPage, CalendarPage() (+3 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "_tradeService.ts"
Cohesion: 0.21
Nodes (12): getUidFromContext(), isSyncAllowed(), verifyIdToken(), db, isDbReady(), now(), app, mockKvStore (+4 more)

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.29
Nodes (8): db, app, auth, facebookProvider, firebaseConfig, googleProvider, fetchCountry(), Login()

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "DashboardLayout.jsx"
Cohesion: 0.12
Nodes (17): useSessionBrokerAccounts(), useSessionWallet(), SQUARE_STATE, StatusSquare(), ACCENT_TEMPLATES, DashboardLayout(), Logo(), SidebarContent() (+9 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.18
Nodes (12): SectionCard(), DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, Card(), CardAction(), CardContent() (+4 more)

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

### Community 51 - "utils.ts"
Cohesion: 0.16
Nodes (14): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroup(), ToggleGroupContext, ToggleGroupItem() (+6 more)

### Community 54 - "AuthenticatedSessionContext.jsx"
Cohesion: 0.24
Nodes (6): AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, toIsoString(), useBrokerAccounts(), useWallet()

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): chart.js, @fontsource-variable/geist, framer-motion, dependencies, chart.js, @fontsource-variable/geist, framer-motion, react-bootstrap-icons (+1 more)

### Community 58 - "_metaapi-broker.js"
Cohesion: 0.26
Nodes (14): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+6 more)

### Community 59 - "App.jsx"
Cohesion: 0.24
Nodes (8): App(), AuthSyncFailure(), ScrollProgress(), isPublicNavbarPath(), PageLoader(), PublicNavSkeleton(), hasPersistedAuthHint(), useAuthSession()

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "field.tsx"
Cohesion: 0.16
Nodes (12): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+4 more)

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenarios, Fix, Fix, Fix, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "toast.tsx"
Cohesion: 0.15
Nodes (7): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), ToastTitle(), ToastViewport()

### Community 86 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.36
Nodes (9): initAdmin(), ACCOUNT_CREDENTIAL_FIELDS, apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts(), scrubUsers() (+1 more)

### Community 87 - "app/AuthenticatedApp.jsx"
Cohesion: 0.22
Nodes (9): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AuthenticatedApp, AuthenticatedRoutes(), useOnboarding(), FREE_SUBSCRIPTION, useSubscription() (+1 more)

### Community 88 - "SECURITY-AUDIT-2026-08.md"
Cohesion: 0.25
Nodes (7): Controls worth adding beyond individual fixes, Executive summary, LOW / INFORMATIONAL, Production-grade recommendations, Remediation order, What is already done well, xaujournal — Production Security Audit

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

### Community 95 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 96 - "useRouteExperience.js"
Cohesion: 0.40
Nodes (7): clearUxState(), shouldSkip(), useRouteExperience(), initGA(), trackPageview(), observeRouteWebVitals(), ratingFor()

### Community 97 - "migrate-performance-data.mjs"
Cohesion: 0.25
Nodes (8): apply, args, main(), maxUsers, migrateBrokerJobs(), mode, startAfterBrokerPath, startAfterUser

### Community 98 - "popover.tsx"
Cohesion: 0.29
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 105 - "H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "ToastContext.jsx"
Cohesion: 0.47
Nodes (3): AppProviders(), ToastContext, ToastProvider()

## Knowledge Gaps
- **465 isolated node(s):** `checks`, `checks`, `Env`, `Variables`, `GET` (+460 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `HistoryPage.jsx`, `PricingPage.jsx`, `field.tsx`, `popover.tsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `sidebar.tsx`, `SectionCard.jsx`, `JournalPage.jsx`, `FooterNav.jsx`, `utils.ts`, `DataTable.jsx`, `toast.tsx`, `DashboardRightSidebar.jsx`, `dropdown-menu.tsx`, `AuthenticatedRoutes.jsx`, `alert.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `PricingPage.jsx`, `DashboardLayout.jsx`, `JournalPage.jsx`, `EASetup.jsx`, `FirebaseBrokerRepository.js`, `DashboardRightSidebar.jsx`, `App.jsx`, `createAppServices.js`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useToast()` connect `HistoryPage.jsx` to `DashboardLayout.jsx`, `ToastContext.jsx`, `JournalPage.jsx`, `EASetup.jsx`, `app/AuthenticatedApp.jsx`, `DashboardRightSidebar.jsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `checks`, `checks`, `Env` to the rest of the system?**
  _465 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[[...route]].ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._
- **Should `HistoryPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Should `PricingPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._