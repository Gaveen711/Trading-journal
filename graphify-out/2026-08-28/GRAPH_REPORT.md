# Graph Report - xaujournal  (2026-08-28)

## Corpus Check
- 376 files · ~522,568 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2540 nodes · 5482 edges · 171 communities (117 shown, 54 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ce7d65b`
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
- inMemoryRepositories.js
- ManageSetupsDialog.test.jsx
- overrides
- ContactPage.jsx
- Hero.jsx
- PricingPage.jsx
- HistoryPage.jsx
- compilerOptions
- LandingPage.jsx
- _shared.tsx
- components.json
- FooterNav.jsx
- useSetups.js
- firebaseTradeRepository.test.js
- DataTable.jsx
- FirebaseBrokerRepository.js
- tradeUtils.js
- components/index.ts
- sessionEngine.js
- MEDIUM
- lib/utils.ts
- BlogsPage.jsx
- db
- _admin.ts
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
- compilerOptions
- JournalRepository
- firebase.js
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
- sticky-footer.tsx
- demoData.js
- vercel.json
- firebase.d.ts
- tradeConfig.js
- _entitlementMiddleware.test.js
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- dependencies
- firebase
- decoders.ts
- [[...route]].ts
- App.jsx
- Production Operations & Maintenance Guide — xaujournal
- @google-cloud/storage
- hono
- lucide-react
- @radix-ui/react-slot
- XAU Journal × MetaApi — Architecture
- client.ts
- react-chartjs-2
- react-dom
- react-router-dom
- resend
- tailwind-merge
- tw-animate-css
- @vercel/analytics
- @vercel/kv
- @vercel/speed-insights
- models/index.ts
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
- useBrokerAccounts.js
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
- ShowcaseApp.jsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons
- package.json
- SettingsPage.resetTerminal.test.jsx
- LogTradePage
- useBrokerAccounts.adopt.test.jsx
- ErrorBoundary.jsx
- HistoryPage.setupWiring.test.jsx
- BlogArticlePage.jsx
- DashboardLayout.sidebarWiring.test.js
- IsoDateString
- clsx
- eslint-plugin-react-hooks
- admin-dashboard/package.json
- AuthContext.tsx
- _entitlementMiddleware.ts
- postcss
- PublicSite.jsx
- @testing-library/jest-dom
- useAppServices
- marketData.test.js
- _middleware.ts
- @types/react-dom
- pages/index.ts
- TradeRepository
- build-og.mjs
- ReportRepository.ts
- useTrades.editTrade.test.jsx
- DashboardLayout.profileMenu.test.js
- eslint
- SetupCombobox.jsx
- AnnouncementRepository.ts
- typescript-eslint
- vercel
- LiveMarketWidget.jsx
- vitest
- shots/README.md
- EditTradeModal.submit.test.jsx
- CouponRepository.ts
- consolidateBrokerConnect
- LiveMarketWidget.test.jsx
- XAU Journal Admin
- AdminShell.tsx
- admin-dashboard/vercel.json
- Admin console operations
- deploy-both.mjs
- useAppTheme.js
- InMemoryTradeRepository
- InMemoryWalletRepository
- admin-dashboard/tsconfig.json
- firebase-functions
- terser
- @testing-library/user-event
- @types/node

## God Nodes (most connected - your core abstractions)
1. `cn()` - 211 edges
2. `Button()` - 32 edges
3. `cx()` - 29 edges
4. `createAdminApi()` - 28 edges
5. `useToast()` - 23 edges
6. `AnalyticsPage()` - 23 edges
7. `resolveSessionAt()` - 22 edges
8. `IsoDateString` - 20 edges
9. `formatDate()` - 20 edges
10. `scripts` - 19 edges

## Surprising Connections (you probably didn't know these)
- `isSyncAllowed()` --calls--> `hasPaidAccess()`  [EXTRACTED]
  api/_auth.ts → src/lib/entitlements.js
- `normalizeDeal()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_metaapi-broker.js → src/lib/sessionEngine.js
- `handleCloseTradeSync()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/sessionEngine.js
- `handleOpenTradeSync()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/sessionEngine.js
- `handleCloseTradeSync()` --calls--> `computePips()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/goldContract.js

## Import Cycles
- None detected.

## Communities (171 total, 54 thin omitted)

### Community 0 - "disciplineRules.js"
Cohesion: 0.08
Nodes (26): sameRules(), useDisciplineSettings(), earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), clampRuleValue(), dayKeyMidnightMs(), DEFAULT_DISCIPLINE_RULES (+18 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.08
Nodes (29): BrokerSync, BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BrokerWall(), PLATFORMS (+21 more)

### Community 2 - "button.tsx"
Cohesion: 0.06
Nodes (39): AuthenticatedOverlays(), CheckoutCancel, CheckoutSuccess, AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), DashboardLayout() (+31 more)

### Community 3 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, admin:build, admin:dev, admin:grant, admin:list, build, build:budget, deploy:all (+11 more)

### Community 4 - "cn"
Cohesion: 0.05
Nodes (49): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+41 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (27): autoprefixer, @eslint/js, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer, @eslint/js (+19 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.04
Nodes (53): Logo(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+45 more)

### Community 7 - "inMemoryRepositories.js"
Cohesion: 0.09
Nodes (11): byDateDesc(), channel(), clone(), createInMemoryRepositories(), createShowcaseStore(), docSnapshot(), InMemoryBrokerRepository, InMemoryJournalRepository (+3 more)

### Community 8 - "ManageSetupsDialog.test.jsx"
Cohesion: 0.33
Nodes (5): actionIn(), BY_ID, CATALOG, rowFor(), TRADES

### Community 9 - "overrides"
Cohesion: 0.11
Nodes (18): overrides, axios, braces, cross-spawn, crypto-js, elliptic, esbuild, fast-xml-parser (+10 more)

### Community 10 - "ContactPage.jsx"
Cohesion: 0.13
Nodes (20): ContactPage, BROKER_COUNTS, buildPayload(), COMING_SOON_NAMES, ContactPage(), describedBy(), EMPTY_FORM, FIELD_IDS (+12 more)

### Community 11 - "Hero.jsx"
Cohesion: 0.09
Nodes (29): DESK_NAMES, initialRailId(), RAIL, RAIL_TO_DESK, ReadChapterRail(), SessionFigures(), SessionRail(), signClass() (+21 more)

### Community 12 - "PricingPage.jsx"
Cohesion: 0.07
Nodes (23): AppRoutes(), AuthenticatedApp, isShowcaseRequested(), PricingPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage, TermsOfServicePage (+15 more)

### Community 13 - "HistoryPage.jsx"
Cohesion: 0.07
Nodes (38): useSessionBrokerAccounts(), AnalyticsPage, CalendarPage, HistoryPage, JournalPage, LogTradePage, SettingsPage, EmptyState() (+30 more)

### Community 14 - "compilerOptions"
Cohesion: 0.05
Nodes (43): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+35 more)

### Community 15 - "LandingPage.jsx"
Cohesion: 0.09
Nodes (36): LandingPage, Chapters, FAQ(), Proof(), STEPS, PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE (+28 more)

### Community 16 - "_shared.tsx"
Cohesion: 0.11
Nodes (42): useAnalytics(), useOverview(), useSubscriptions(), useUser(), AnalyticsPage(), AnnouncementRecord, AnnouncementsPage(), blankCoupon (+34 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.10
Nodes (33): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+25 more)

### Community 19 - "useSetups.js"
Cohesion: 0.19
Nodes (19): effectiveSlug(), findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed(), compareSetups(), effectiveSlug(), findSlugOwner() (+11 more)

### Community 20 - "firebaseTradeRepository.test.js"
Cohesion: 0.18
Nodes (3): fake, logTrade, repository

### Community 21 - "DataTable.jsx"
Cohesion: 0.18
Nodes (14): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Table(), TableBody() (+6 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.27
Nodes (6): FirebaseBrokerRepository, adoptBrokerCallable(), callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "tradeUtils.js"
Cohesion: 0.11
Nodes (26): DirectionCell(), CurrencyConverter(), ratesCache, TradeShareCard, CURRENCIES, useMonthTrades(), primarySessionForCode(), getTradeStrategyTags() (+18 more)

### Community 24 - "components/index.ts"
Cohesion: 0.09
Nodes (43): Button, ButtonProps, ButtonSize, ButtonVariant, ConfirmDialog(), ConfirmDialogProps, DataColumn, DataTable() (+35 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.10
Nodes (30): baseTrade, TradeEntity, LogTradeUseCase, pad(), sessionHours(), CODE_HUBS, EMPTY, HUB_ORDER (+22 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "lib/utils.ts"
Cohesion: 0.15
Nodes (13): SQUARE_STATE, StatusSquare(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroup() (+5 more)

### Community 28 - "BlogsPage.jsx"
Cohesion: 0.10
Nodes (16): BlogsPage, Arrow(), articles, articles, studyArticles, studyCategories, articles, COUNTS (+8 more)

### Community 29 - "db"
Cohesion: 0.20
Nodes (3): SubscriptionRepository, FirebaseSubscriptionRepository, db

### Community 30 - "_admin.ts"
Cohesion: 0.09
Nodes (48): actorFrom(), AdminActor, AdminDependencies, AdminHttpError, ANNOUNCEMENT_FIELDS, announcementPatch(), assertIdentifier(), assertOnlyFields() (+40 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "_firebase.js"
Cohesion: 0.21
Nodes (8): db, isDbReady(), app, mockKvStore, args, identity, list, revoke

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.21
Nodes (11): Login, storage, app, auth, facebookProvider, firebaseConfig, googleProvider, useAppTheme() (+3 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.33
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "_metaapi-broker.js"
Cohesion: 0.17
Nodes (20): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+12 more)

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

### Community 46 - "sticky-footer.tsx"
Cohesion: 0.17
Nodes (8): AnimatedContainerProps, FooterLink, FooterLinkGroup, footerLinkGroups, socialLinks, StickyFooter(), StickyFooterProps, mocks

### Community 47 - "demoData.js"
Cohesion: 0.08
Nodes (29): ANCHOR_UTC, buildTrade(), CONFLUENCE, CONVICTION, dateForDay(), DEMO_BROKER_ACCOUNTS, DEMO_DISPLAY_NAME, DEMO_EMAIL (+21 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "_entitlementMiddleware.test.js"
Cohesion: 0.13
Nodes (16): ACTIVE_PRO, expire(), FREE, FUTURE, get(), GRACE, incr(), LAPSED_GRACE (+8 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, @firecms/neat, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 57 - "decoders.ts"
Cohesion: 0.17
Nodes (37): ANNOUNCEMENT_LEVELS, ANNOUNCEMENT_STATUSES, ANNOUNCEMENT_TARGETS, announcementTarget(), COUPON_TYPES, decodeAnalytics(), decodeAnnouncement(), decodeCoupon() (+29 more)

### Community 58 - "[[...route]].ts"
Cohesion: 0.09
Nodes (33): resend, DELETE, Env, GET, handleBrokerAdd(), handleRemindExpiry(), handleRevokeExpired(), handleRouteError() (+25 more)

### Community 59 - "App.jsx"
Cohesion: 0.12
Nodes (20): App(), AuthSyncFailure(), LinkPeek(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), isPublicNavbarPath() (+12 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "client.ts"
Cohesion: 0.08
Nodes (22): AccessTokenProvider, ADMIN_API_BASE_URL, AdminApiError, adminRequest(), AdminRequestOptions, buildAdminQuery(), Decoder, environment (+14 more)

### Community 83 - "models/index.ts"
Cohesion: 0.14
Nodes (24): SettingsRepository, SystemSettingsUpdate, AdminCollectionState, PagingState, useAdminCollection(), AdminMutationState, asError(), useAdminMutation() (+16 more)

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenario, Fix, Fix, Fix, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "compilerOptions"
Cohesion: 0.06
Nodes (32): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noUnusedLocals (+24 more)

### Community 86 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.35
Nodes (9): ACCOUNT_CREDENTIAL_FIELDS, USER_CREDENTIAL_FIELDS, initAdmin(), apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts() (+1 more)

### Community 87 - "DashboardRightSidebar.jsx"
Cohesion: 0.09
Nodes (29): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), EMPTY_SETUPS, GRADES, legacySessionPrefill() (+21 more)

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
Cohesion: 0.22
Nodes (8): Backend structure, Dependency rule, Extension rules, Frontend structure, Internal admin console, Product map, Safe migration path, XAU Journal Architecture

### Community 95 - "useBrokerAccounts.js"
Cohesion: 0.32
Nodes (15): dropLocalAccount(), hasServerLogin(), useBrokerAccounts(), addAccount(), hasSessionCredential(), removeAccount(), syncAccount(), accountsKey() (+7 more)

### Community 96 - "marketData.js"
Cohesion: 0.17
Nodes (23): ABORTED, beginShared(), chartQuery(), directJson(), fetchSpotPrice(), fetchYahooChart(), health, inFlight (+15 more)

### Community 97 - "_tradeService.ts"
Cohesion: 0.13
Nodes (19): addSessionDelta(), persistBrokerTrades(), now(), chunkedDbGetAll(), handleCloseTradeSync(), handleOpenTradeSync(), isoOrNull(), dateContradicts() (+11 more)

### Community 98 - "AnalyticsPage.jsx"
Cohesion: 0.10
Nodes (24): readTokens(), resolveChartTheme(), seriesColor(), TOKEN_NAMES, formatSigned(), formatSignedNumber(), AnalyticsPage(), buildSessionInsight() (+16 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.09
Nodes (46): apply, args, main(), maxUsers, migrateAnalytics(), migrateBrokerJobs(), mode, startAfterBrokerPath (+38 more)

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "ShowcaseApp.jsx"
Cohesion: 0.15
Nodes (18): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AppServicesProvider(), useSessionWallet(), createAppServices(), AuthenticatedRoutes(), WalletTopUpDialog() (+10 more)

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 119 - "LogTradePage"
Cohesion: 0.33
Nodes (4): LogTradePage(), dayKeyAgo(), h, trade()

### Community 121 - "ErrorBoundary.jsx"
Cohesion: 0.15
Nodes (8): cardStyle, detailStyle, ErrorBoundary, eyebrowStyle, iconStyle, primaryButtonStyle, secondaryButtonStyle, shellStyle

### Community 122 - "HistoryPage.setupWiring.test.jsx"
Cohesion: 0.33
Nodes (4): archiveSetup, createSetup, SETUPS, TRADE

### Community 123 - "BlogArticlePage.jsx"
Cohesion: 0.14
Nodes (17): BlogArticlePage, NotFoundPage, TextLink(), getArticle(), BlogArticlePage(), escapeRegExp(), formatUpdated(), Headline() (+9 more)

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

### Community 125 - "IsoDateString"
Cohesion: 0.10
Nodes (26): PaymentRepository, SubscriptionRepository, AdminId, AdminQueryError, IsoDateString, MutationReason, PaginationParams, Reasoned (+18 more)

### Community 128 - "admin-dashboard/package.json"
Cohesion: 0.06
Nodes (33): dependencies, firebase, lucide-react, react, react-dom, react-router-dom, devDependencies, @types/node (+25 more)

### Community 129 - "AuthContext.tsx"
Cohesion: 0.12
Nodes (25): AuthenticatedLayout(), ADMIN_EMAIL, ADMIN_UID, AdminAdmissionError, AdminAdmissionFailure, admissionErrorMessage(), verifyAdminAdmission(), AdminLogin() (+17 more)

### Community 130 - "_entitlementMiddleware.ts"
Cohesion: 0.25
Nodes (12): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), isSyncAllowed(), verifyIdToken(), assertPro(), ProGateOptions, requireAuth() (+4 more)

### Community 132 - "PublicSite.jsx"
Cohesion: 0.16
Nodes (12): PLAN_LINES, PricingBridge(), ArrowOut(), CTALink(), Panel(), SectionHead(), Shot(), SHOT_HEIGHT (+4 more)

### Community 134 - "useAppServices"
Cohesion: 0.23
Nodes (10): AppServicesContext, useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, useJournals(), byDateDesc(), mergeTrades() (+2 more)

### Community 135 - "marketData.test.js"
Cohesion: 0.15
Nodes (13): getMarketDataHealth(), PROXY_DOWN_AFTER_FAILURES, PROXY_SKIP_WINDOW_MS, subscribeMarketDataHealth(), useMarketDataHealth(), driveProxyDown(), httpStatus(), isProxyUrl() (+5 more)

### Community 136 - "_middleware.ts"
Cohesion: 0.28
Nodes (7): getClientIp(), adminAllowedOrigins, allowedOrigins, DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware

### Community 138 - "pages/index.ts"
Cohesion: 0.24
Nodes (12): AnalyticsPage, AnnouncementsPage, App(), CouponsPage, OverviewPage, PaymentsPage, ReportsPage, SettingsPage (+4 more)

### Community 141 - "build-og.mjs"
Cohesion: 0.40
Nodes (3): out, root, shot

### Community 142 - "ReportRepository.ts"
Cohesion: 0.17
Nodes (13): reasonedBody(), reportPatch(), ReportRepository, reportStatus(), AdminMutationConfirmation, assertMutationReason(), Report, ReportUpdate (+5 more)

### Community 143 - "useTrades.editTrade.test.jsx"
Cohesion: 0.22
Nodes (6): APPLIED_PATCH, harness, LATER_TRADE, OLD_TRADE, RECENT_TRADE, USER

### Community 146 - "SetupCombobox.jsx"
Cohesion: 0.20
Nodes (10): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+2 more)

### Community 147 - "AnnouncementRepository.ts"
Cohesion: 0.19
Nodes (10): AnnouncementRepository, Announcement, AnnouncementCreate, AnnouncementLevel, AnnouncementListParams, AnnouncementStatus, AnnouncementTarget, AnnouncementUpdate (+2 more)

### Community 150 - "LiveMarketWidget.jsx"
Cohesion: 0.26
Nodes (12): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+4 more)

### Community 153 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 154 - "CouponRepository.ts"
Cohesion: 0.21
Nodes (9): CouponRepository, Paginated, Coupon, CouponCreate, CouponListParams, CouponType, CouponUpdate, CreateCouponInput (+1 more)

### Community 155 - "consolidateBrokerConnect"
Cohesion: 0.26
Nodes (11): deletionPatch(), AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect() (+3 more)

### Community 156 - "LiveMarketWidget.test.jsx"
Cohesion: 0.24
Nodes (3): mountWidget(), selectTimeframe(), settle()

### Community 157 - "XAU Journal Admin"
Cohesion: 0.29
Nodes (6): Admin API and CORS, Admission policy, Integration barrels, Local development, Vercel project settings, XAU Journal Admin

### Community 158 - "AdminShell.tsx"
Cohesion: 0.33
Nodes (5): AdminNavItem, AdminShell(), AdminShellProps, defaultAdminNavigation, routeIsActive()

### Community 159 - "admin-dashboard/vercel.json"
Cohesion: 0.29
Nodes (6): cleanUrls, framework, headers, rewrites, $schema, trailingSlash

### Community 160 - "Admin console operations"
Cohesion: 0.29
Nodes (6): Admin console operations, Deployment order, Grant or revoke access, Retiring the old repository, Security invariant, Vercel projects

### Community 161 - "deploy-both.mjs"
Cohesion: 0.29
Nodes (3): adminDir, args, rootDir

### Community 162 - "useAppTheme.js"
Cohesion: 0.38
Nodes (4): AppProviders(), ToastProvider(), ThemeContext, ThemeProvider()

## Knowledge Gaps
- **723 isolated node(s):** `Local development`, `Admission policy`, `Admin API and CORS`, `Vercel project settings`, `Integration barrels` (+718 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `AnalyticsPage.jsx`, `PublicSite.jsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `SectionCard.jsx`, `HistoryPage.jsx`, `sticky-footer.tsx`, `FooterNav.jsx`, `SetupCombobox.jsx`, `DataTable.jsx`, `DashboardRightSidebar.jsx`, `tradeUtils.js`, `lib/utils.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `sessionEngine.js` to `_tradeService.ts`, `_metaapi-broker.js`, `tradeAnalytics.js`, `demoData.js`, `DashboardRightSidebar.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `TradeRepository` connect `TradeRepository` to `_tradeService.ts`, `inMemoryRepositories.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `Local development`, `Admission policy`, `Admin API and CORS` to the rest of the system?**
  _723 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08170731707317073 - nodes in this community are weakly interconnected._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05698778833107191 - nodes in this community are weakly interconnected._