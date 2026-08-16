# Graph Report - xaujournal  (2026-08-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1177 nodes · 2360 edges · 89 communities (60 shown, 29 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cfb7a9c8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- DashboardRightSidebar.jsx
- button.tsx
- tradeAnalytics.js
- cn
- devDependencies
- DashboardLayout.jsx
- overrides
- App.jsx
- overrides
- PricingPage.jsx
- deskDemo.js
- AppRoutes.jsx
- JournalPage.jsx
- compilerOptions
- LandingPage.jsx
- AppServicesContext.jsx
- components.json
- FooterNav.jsx
- FirebaseTradeRepository.js
- EASetup.jsx
- utils.ts
- FirebaseBrokerRepository.js
- tradeUtils.js
- dropdown-menu.tsx
- index.js
- app/AuthenticatedApp.jsx
- AnalyticsPage.jsx
- HistoryPage.jsx
- createAppServices.js
- AuthenticatedRoutes.jsx
- CurrencyConverter.jsx
- toast.tsx
- compilerOptions
- JournalRepository
- firebase.js
- dependencies
- EmptyState.jsx
- _metaapi-broker.js
- sheet.tsx
- dependencies
- CalendarPage.jsx
- FirebaseSubscriptionRepository.js
- FirebaseWalletRepository.js
- check-bundle-budget.mjs
- vite.config.js
- tradeService.js
- alert.tsx
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
- @google-cloud/recaptcha-enterprise
- @google-cloud/storage
- hono
- lucide-react
- @radix-ui/react-slot
- react
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
- _firebase.js
- consolidateBrokerConnect
- class-variance-authority

## God Nodes (most connected - your core abstractions)
1. `cn()` - 194 edges
2. `Button()` - 25 edges
3. `useToast()` - 19 edges
4. `overrides` - 19 edges
5. `compilerOptions` - 18 edges
6. `overrides` - 18 edges
7. `tradeAnalyticsDelta()` - 16 edges
8. `formatSigned()` - 14 edges
9. `useAppTheme()` - 13 edges
10. `useUtcClock()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_firebase.js
- `handleCloseTradeSync()` --calls--> `subtractTradeAnalytics()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/tradeAnalytics.js
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_firebase.js
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (89 total, 29 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.13
Nodes (20): getClientIp(), allowedOrigins, corsMiddleware(), rateLimitMiddleware(), secureHeadersMiddleware, resend, DELETE, Env (+12 more)

### Community 1 - "DashboardRightSidebar.jsx"
Cohesion: 0.11
Nodes (21): CONFIDENCE_SCALE, CONFLUENCE, GRADES, MOODS, SESSION_OPTIONS, STRATEGY_OPTIONS, STRUCTURES, TABS (+13 more)

### Community 2 - "button.tsx"
Cohesion: 0.08
Nodes (34): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+26 more)

### Community 3 - "tradeAnalytics.js"
Cohesion: 0.21
Nodes (14): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), emptyDelta(), emptyTradeAnalytics() (+6 more)

### Community 4 - "cn"
Cohesion: 0.08
Nodes (37): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Checkbox(), Field() (+29 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (45): autoprefixer, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer (+37 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.07
Nodes (37): useSessionBrokerAccounts(), useSessionWallet(), ACCENT_TEMPLATES, DashboardLayout(), Logo(), Sidebar(), SidebarContent(), SidebarContext (+29 more)

### Community 7 - "overrides"
Cohesion: 0.05
Nodes (40): eslint-config-google, firebase-functions-test, description, devDependencies, eslint, eslint-config-google, firebase-functions-test, engines (+32 more)

### Community 8 - "App.jsx"
Cohesion: 0.08
Nodes (24): App(), AuthSyncFailure(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders(), cardStyle (+16 more)

### Community 9 - "overrides"
Cohesion: 0.06
Nodes (35): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+27 more)

### Community 10 - "PricingPage.jsx"
Cohesion: 0.11
Nodes (25): PricingPage, PublicFooter(), NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), CTALink(), Panel() (+17 more)

### Community 11 - "deskDemo.js"
Cohesion: 0.12
Nodes (25): arcPath(), CANDLES, DIAL, DIAL_SESSIONS, fmt(), point(), REPLAY, SessionDial() (+17 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.09
Nodes (18): AppRoutes(), ContactPage, LandingPage, Login, NotFoundPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage (+10 more)

### Community 13 - "JournalPage.jsx"
Cohesion: 0.20
Nodes (14): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia() (+6 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ESNext, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs (+15 more)

### Community 15 - "LandingPage.jsx"
Cohesion: 0.07
Nodes (27): PageSEO(), applyPageSEO(), buildFAQSchema(), buildOrganizationSchema(), buildSoftwareSchema(), buildWebSiteSchema(), CANONICAL_ALIASES, DEFAULT_DESCRIPTION (+19 more)

### Community 16 - "AppServicesContext.jsx"
Cohesion: 0.14
Nodes (16): AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, createAppServices(), toIsoString() (+8 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.14
Nodes (26): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+18 more)

### Community 19 - "FirebaseTradeRepository.js"
Cohesion: 0.13
Nodes (3): TradeRepository, analyticsIncrements(), FirebaseTradeRepository

### Community 20 - "EASetup.jsx"
Cohesion: 0.12
Nodes (15): EASetup, BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BrokerLogo(), BROKERS, EASetup(), handleConnect() (+7 more)

### Community 21 - "utils.ts"
Cohesion: 0.13
Nodes (17): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Badge(), badgeVariants (+9 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.16
Nodes (6): BrokerRepository, FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "tradeUtils.js"
Cohesion: 0.20
Nodes (15): EditTradeModal(), DashboardRightSidebar(), DatePicker(), storage, calcPnl(), formatCompact(), formatCurrency(), formatPrice() (+7 more)

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 25 - "index.js"
Cohesion: 0.18
Nodes (13): analyticsDeltaForTrades(), db, dealToTrade(), { defineSecret }, { getFirestore, FieldValue }, getMetaApi(), getTradingSession(), { initializeApp } (+5 more)

### Community 26 - "app/AuthenticatedApp.jsx"
Cohesion: 0.25
Nodes (9): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AuthenticatedApp, ToastContext, useToast(), useOnboarding(), FREE_SUBSCRIPTION (+1 more)

### Community 27 - "AnalyticsPage.jsx"
Cohesion: 0.27
Nodes (10): formatCurrencyCompact(), AnalyticsPage(), chip(), cssHsl(), pnlCell(), resolveChartColors(), SESSION_TOKENS, SETUP_COLUMNS (+2 more)

### Community 28 - "HistoryPage.jsx"
Cohesion: 0.20
Nodes (9): ImageViewerModal(), CustomSelect(), chip(), DetailField(), formatPips(), getTimestampMs(), HISTORY_COLUMNS, HistoryPage() (+1 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.22
Nodes (3): TradeEntity, LogTradeUseCase, ResetTradesUseCase

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.18
Nodes (8): AnalyticsPage, AuthenticatedRoutes(), CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage, SettingsPage

### Community 31 - "CurrencyConverter.jsx"
Cohesion: 0.21
Nodes (8): CURRENCIES, CurrencyConverter(), ratesCache, TradeShareCard, getTradeStrategyTags(), formatNumber(), ShareTradeModal, ShareTradeModal

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
Cohesion: 0.18
Nodes (11): @base-ui/react, chart.js, clsx, @google-cloud/firestore, html2canvas, dependencies, @base-ui/react, chart.js (+3 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "_metaapi-broker.js"
Cohesion: 0.26
Nodes (14): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+6 more)

### Community 39 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 40 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, firebase-admin, firebase-functions, metaapi.cloud-sdk, firebase-admin, firebase-functions, metaapi.cloud-sdk, firebase-admin (+2 more)

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

### Community 47 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "LogTradePage.jsx"
Cohesion: 0.19
Nodes (11): SQUARE_STATE, StatusSquare(), LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, useAppTheme(), FALLBACK_TOKEN() (+3 more)

### Community 54 - "_tradeService.ts"
Cohesion: 0.33
Nodes (8): getUidFromContext(), isSyncAllowed(), verifyIdToken(), now(), analyticsIncrements(), handleCloseTradeSync(), handleOpenTradeSync(), resolveKey()

### Community 84 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.36
Nodes (9): initAdmin(), ACCOUNT_CREDENTIAL_FIELDS, apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts(), scrubUsers() (+1 more)

### Community 85 - "migrate-performance-data.mjs"
Cohesion: 0.25
Nodes (8): apply, args, main(), maxUsers, migrateBrokerJobs(), mode, startAfterBrokerPath, startAfterUser

### Community 86 - "_firebase.js"
Cohesion: 0.46
Nodes (4): db, isDbReady(), app, mockKvStore

### Community 87 - "consolidateBrokerConnect"
Cohesion: 0.32
Nodes (7): AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect()

## Knowledge Gaps
- **312 isolated node(s):** `AccountLockResult`, `Env`, `Variables`, `BentoIcon`, `SidebarContextProps` (+307 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `toast.tsx`, `DashboardRightSidebar.jsx`, `button.tsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `sheet.tsx`, `CalendarPage.jsx`, `JournalPage.jsx`, `alert.tsx`, `FooterNav.jsx`, `LogTradePage.jsx`, `utils.ts`, `tradeUtils.js`, `dropdown-menu.tsx`, `HistoryPage.jsx`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `DashboardRightSidebar.jsx`, `DashboardLayout.jsx`, `App.jsx`, `PricingPage.jsx`, `JournalPage.jsx`, `EASetup.jsx`, `FirebaseBrokerRepository.js`, `tradeUtils.js`, `createAppServices.js`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `toast.tsx`, `DashboardRightSidebar.jsx`, `cn`, `DashboardLayout.jsx`, `sheet.tsx`, `CalendarPage.jsx`, `JournalPage.jsx`, `LogTradePage.jsx`, `utils.ts`, `AnalyticsPage.jsx`, `HistoryPage.jsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `AccountLockResult`, `Env`, `Variables` to the rest of the system?**
  _312 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[[...route]].ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `DashboardRightSidebar.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1053763440860215 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07547169811320754 - nodes in this community are weakly interconnected._