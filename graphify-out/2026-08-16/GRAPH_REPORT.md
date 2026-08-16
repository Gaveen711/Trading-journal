# Graph Report - xaujournal  (2026-08-16)

## Corpus Check
- 208 files · ~377,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1411 nodes · 2615 edges · 114 communities (75 shown, 39 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b563b00`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- button.tsx
- AppDialog.jsx
- tradeAnalytics.js
- cn
- devDependencies
- sidebar.tsx
- overrides
- App.jsx
- overrides
- PricingPage.jsx
- LandingPage.jsx
- AppRoutes.jsx
- HistoryPage.jsx
- compilerOptions
- seo.js
- AppServicesContext.jsx
- components.json
- FooterNav.jsx
- FirebaseTradeRepository.js
- EASetup.jsx
- DataTable.jsx
- FirebaseBrokerRepository.js
- CalendarPage.jsx
- dropdown-menu.tsx
- index.js
- MEDIUM
- AnalyticsPage.jsx
- BlogArticlePage.jsx
- TradeEntity
- AuthenticatedRoutes.jsx
- MT4/MT5 Broker Login Sync Implementation
- useAppTheme
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- EmptyState.jsx
- DashboardLayout.jsx
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
- AuthenticatedSessionContext.jsx
- dependencies
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
- HIGH
- sheet.tsx
- _brokerTradePersistence.ts
- app/AuthenticatedApp.jsx
- SECURITY-AUDIT-2026-08.md
- Run xaujournal (dev)
- Run xaujournal (dev)
- 🛡️ Maintenance & Security Post-Deployment Checklist
- 🚀 Project Scope
- XAU Journal Architecture
- BrokerRepository
- alert.tsx
- SidebarMenuButton
- createAppServices.js
- DataTable.test.jsx
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
- badge.tsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 194 edges
2. `Button()` - 25 edges
3. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
4. `useToast()` - 19 edges
5. `overrides` - 19 edges
6. `overrides` - 18 edges
7. `compilerOptions` - 18 edges
8. `tradeAnalyticsDelta()` - 16 edges
9. `formatSigned()` - 14 edges
10. `useAppTheme()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `persistBrokerTrades()` --calls--> `analyticsDeltaForTrades()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `tradeAnalyticsDelta()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `handleCloseTradeSync()` --calls--> `subtractTradeAnalytics()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/tradeAnalytics.js
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_firebase.js
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (114 total, 39 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.05
Nodes (62): getUidFromContext(), isSyncAllowed(), verifyIdToken(), db, initAdmin(), isDbReady(), now(), getClientIp() (+54 more)

### Community 1 - "button.tsx"
Cohesion: 0.22
Nodes (7): OnboardingModal(), BentoCard(), BentoGrid(), BentoIcon, Button(), buttonVariants, Input()

### Community 2 - "AppDialog.jsx"
Cohesion: 0.09
Nodes (26): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), ImageViewerModal(), PricingModal(), FEATURE_COPY (+18 more)

### Community 3 - "tradeAnalytics.js"
Cohesion: 0.20
Nodes (18): apply, args, main(), maxUsers, migrateAnalytics(), migrateBrokerJobs(), mode, startAfterBrokerPath (+10 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (44): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Checkbox(), Field() (+36 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies (+39 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.13
Nodes (16): SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarGroupContent(), SidebarInput(), SidebarMenuAction(), SidebarMenuBadge(), SidebarMenuSkeleton() (+8 more)

### Community 7 - "overrides"
Cohesion: 0.04
Nodes (46): eslint-config-google, firebase-functions-test, dependencies, firebase-admin, firebase-functions, metaapi.cloud-sdk, description, devDependencies (+38 more)

### Community 8 - "App.jsx"
Cohesion: 0.08
Nodes (24): App(), AuthSyncFailure(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders(), isPublicNavbarPath() (+16 more)

### Community 9 - "overrides"
Cohesion: 0.06
Nodes (35): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+27 more)

### Community 10 - "PricingPage.jsx"
Cohesion: 0.11
Nodes (20): ContactPage, PricingPage, PublicFooter(), NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), CTALink() (+12 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.06
Nodes (37): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), pad2() (+29 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (16): AppRoutes(), BlogsPage, LandingPage, NotFoundPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage, TermsOfServicePage (+8 more)

### Community 13 - "HistoryPage.jsx"
Cohesion: 0.11
Nodes (27): ToastContext, useToast(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter() (+19 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ESNext, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.09
Nodes (29): PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema() (+21 more)

### Community 16 - "AppServicesContext.jsx"
Cohesion: 0.25
Nodes (10): AppServicesContext, AppServicesProvider(), useAppServices(), createAppServices(), useJournals(), pad2(), useMonthTrades(), byDateDesc() (+2 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.13
Nodes (28): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+20 more)

### Community 19 - "FirebaseTradeRepository.js"
Cohesion: 0.13
Nodes (3): TradeRepository, analyticsIncrements(), FirebaseTradeRepository

### Community 20 - "EASetup.jsx"
Cohesion: 0.11
Nodes (17): useSessionBrokerAccounts(), BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BrokerLogo(), BROKERS, EASetup(), handleConnect() (+9 more)

### Community 21 - "DataTable.jsx"
Cohesion: 0.23
Nodes (12): DataTable(), hideClass(), isEnd(), Skeleton(), Table(), TableBody(), TableCaption(), TableCell() (+4 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.30
Nodes (5): FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "CalendarPage.jsx"
Cohesion: 0.15
Nodes (19): CURRENCIES, CurrencyConverter(), ratesCache, EditTradeModal(), DashboardRightSidebar(), DatePicker(), calcPnl(), formatCompact() (+11 more)

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
Cohesion: 0.18
Nodes (14): TradeShareCard, getTradeStrategyTags(), formatCurrencyCompact(), AnalyticsPage(), chip(), cssHsl(), pnlCell(), resolveChartColors() (+6 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.19
Nodes (11): BlogArticlePage, TextLink(), articles, articles, getArticle(), studyArticles, studyCategories, articles (+3 more)

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.16
Nodes (9): AnalyticsPage, CalendarPage, CheckoutCancel, CheckoutSuccess, EASetup, HistoryPage, JournalPage, LogTradePage (+1 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "useAppTheme"
Cohesion: 0.20
Nodes (10): Login, LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, ThemeContext, ThemeProvider(), useAppTheme() (+2 more)

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.36
Nodes (6): storage, app, auth, facebookProvider, firebaseConfig, googleProvider

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "DashboardLayout.jsx"
Cohesion: 0.14
Nodes (10): ACCENT_TEMPLATES, SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupLabel(), SidebarHeader(), SidebarInset(), SidebarMenu() (+2 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.18
Nodes (12): SectionCard(), DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, Card(), CardAction(), CardContent() (+4 more)

### Community 42 - "db"
Cohesion: 0.20
Nodes (3): SubscriptionRepository, FirebaseSubscriptionRepository, db

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
Cohesion: 0.09
Nodes (27): SQUARE_STATE, StatusSquare(), CONFIDENCE_SCALE, CONFLUENCE, GRADES, MOODS, SESSION_OPTIONS, STRATEGY_OPTIONS (+19 more)

### Community 54 - "AuthenticatedSessionContext.jsx"
Cohesion: 0.24
Nodes (6): AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, toIsoString(), useBrokerAccounts(), useWallet()

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenarios, Fix, Fix, Fix, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 86 - "_brokerTradePersistence.ts"
Cohesion: 0.29
Nodes (4): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), subtractTradeAnalytics()

### Community 87 - "app/AuthenticatedApp.jsx"
Cohesion: 0.24
Nodes (8): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, useSessionWallet(), AuthenticatedApp, AuthenticatedRoutes(), PageLoader(), useOnboarding()

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

### Community 96 - "SidebarMenuButton"
Cohesion: 0.33
Nodes (6): Sidebar(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 98 - "DataTable.test.jsx"
Cohesion: 0.40
Nodes (3): baseProps, columns, rows

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

## Knowledge Gaps
- **466 isolated node(s):** `graphify`, `Prerequisites`, `Run (agent path)`, `Auth gate (dashboard access)`, `Test` (+461 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `SidebarMenuButton`, `button.tsx`, `AppDialog.jsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `sidebar.tsx`, `SectionCard.jsx`, `HistoryPage.jsx`, `badge.tsx`, `FooterNav.jsx`, `DashboardRightSidebar.jsx`, `EASetup.jsx`, `DataTable.jsx`, `sheet.tsx`, `CalendarPage.jsx`, `dropdown-menu.tsx`, `alert.tsx`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `AppDialog.jsx`, `cn`, `DashboardLayout.jsx`, `sidebar.tsx`, `HistoryPage.jsx`, `DashboardRightSidebar.jsx`, `DataTable.jsx`, `sheet.tsx`, `CalendarPage.jsx`, `AnalyticsPage.jsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `useToast()` connect `HistoryPage.jsx` to `DashboardLayout.jsx`, `PricingPage.jsx`, `EASetup.jsx`, `app/AuthenticatedApp.jsx`, `CalendarPage.jsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `graphify`, `Prerequisites`, `Run (agent path)` to the rest of the system?**
  _466 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[[...route]].ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054945054945054944 - nodes in this community are weakly interconnected._
- **Should `AppDialog.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.058469945355191254 - nodes in this community are weakly interconnected._