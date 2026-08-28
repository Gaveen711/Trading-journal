# Graph Report - xaujournal  (2026-08-28)

## Corpus Check
- 376 files · ~522,608 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2540 nodes · 5482 edges · 173 communities (120 shown, 53 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d5c7f94`
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
- SettingsPage.jsx
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
- HistoryPage.jsx
- SECURITY-AUDIT-2026-08.md
- Run xaujournal (dev)
- Run xaujournal (dev)
- 🛡️ Maintenance & Security Post-Deployment Checklist
- 🚀 Project Scope
- XAU Journal Architecture
- BrokerRepository
- useBrokerAccounts.js
- marketData.js
- FirebaseTradeRepository.js
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
- dropdown-menu.tsx
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
- _tradeService.ts
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
- AuthenticatedRoutes.jsx
- vitest
- shots/README.md
- EditTradeModal.submit.test.jsx
- SESSION_ENGINE_VERSION
- consolidateBrokerConnect
- migrate-performance-data.mjs
- XAU Journal Admin
- AdminShell.tsx
- admin-dashboard/vercel.json
- Admin console operations
- deploy-both.mjs
- useRouteExperience.js
- InMemoryTradeRepository
- InMemoryWalletRepository
- admin-dashboard/tsconfig.json
- firebase-functions
- terser
- @testing-library/user-event
- @types/node
- useMutationConfirmation.ts
- tradeService.js

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
10. `tradeAnalyticsDelta()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_firebase.js
- `migrateBrokerJobs()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_credentialFields.js
- `deletionPatch()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_credentialFields.js
- `normalizeDeal()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_metaapi-broker.js → src/lib/sessionEngine.js
- `normalizeDeal()` --calls--> `computePips()`  [EXTRACTED]
  api/_metaapi-broker.js → src/lib/goldContract.js

## Import Cycles
- None detected.

## Communities (173 total, 53 thin omitted)

### Community 0 - "disciplineRules.js"
Cohesion: 0.08
Nodes (25): sameRules(), useDisciplineSettings(), earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), clampRuleValue(), dayKeyMidnightMs(), DEFAULT_DISCIPLINE_RULES (+17 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.08
Nodes (29): BrokerSync, BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BrokerWall(), PLATFORMS (+21 more)

### Community 2 - "button.tsx"
Cohesion: 0.06
Nodes (35): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, toast, ConsentModal(), OnboardingModal(), PricingModal() (+27 more)

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
Cohesion: 0.05
Nodes (45): useSessionBrokerAccounts(), DashboardLayout(), Logo(), buttonVariants, FloatingDockNavigation(), Sheet(), SheetContent(), SheetDescription() (+37 more)

### Community 7 - "inMemoryRepositories.js"
Cohesion: 0.09
Nodes (11): byDateDesc(), channel(), clone(), createInMemoryRepositories(), createShowcaseStore(), docSnapshot(), InMemoryBrokerRepository, InMemoryJournalRepository (+3 more)

### Community 8 - "ManageSetupsDialog.test.jsx"
Cohesion: 0.17
Nodes (7): actionIn(), BY_ID, CATALOG, rowFor(), TRADES, ToastProvider(), toast

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

### Community 13 - "SettingsPage.jsx"
Cohesion: 0.12
Nodes (24): EMPTY_LIST, EMPTY_MAP, SectionCard(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+16 more)

### Community 14 - "compilerOptions"
Cohesion: 0.05
Nodes (43): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+35 more)

### Community 15 - "LandingPage.jsx"
Cohesion: 0.09
Nodes (36): LandingPage, Chapters, FAQ(), Proof(), STEPS, PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE (+28 more)

### Community 16 - "_shared.tsx"
Cohesion: 0.11
Nodes (41): useAnalytics(), useCoupons(), useOverview(), useReports(), useUser(), useUsers(), AnalyticsPage(), AnnouncementRecord (+33 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.10
Nodes (33): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+25 more)

### Community 19 - "useSetups.js"
Cohesion: 0.14
Nodes (26): effectiveSlug(), findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed(), compareSetups(), effectiveSlug(), findSlugOwner() (+18 more)

### Community 20 - "firebaseTradeRepository.test.js"
Cohesion: 0.18
Nodes (3): fake, logTrade, repository

### Community 21 - "DataTable.jsx"
Cohesion: 0.16
Nodes (15): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Skeleton(), Table() (+7 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.27
Nodes (6): FirebaseBrokerRepository, adoptBrokerCallable(), callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "tradeUtils.js"
Cohesion: 0.14
Nodes (21): CurrencyConverter(), ratesCache, TradeShareCard, CURRENCIES, useMonthTrades(), primarySessionForCode(), getTradeStrategyTags(), formatCompact() (+13 more)

### Community 24 - "components/index.ts"
Cohesion: 0.09
Nodes (43): Button, ButtonProps, ButtonSize, ButtonVariant, ConfirmDialog(), ConfirmDialogProps, DataColumn, DataTable() (+35 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.13
Nodes (24): pad(), sessionHours(), CODE_HUBS, EMPTY, HUB_ORDER, HUB_PRIORITY, hubWindowMs(), isDeskOpenAt() (+16 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "lib/utils.ts"
Cohesion: 0.14
Nodes (15): DirectionCell(), SQUARE_STATE, StatusSquare(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger() (+7 more)

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
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "_metaapi-broker.js"
Cohesion: 0.24
Nodes (15): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+7 more)

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
Nodes (30): ANCHOR_UTC, buildTrade(), CONFLUENCE, CONVICTION, dateForDay(), DEMO_BROKER_ACCOUNTS, DEMO_DISPLAY_NAME, DEMO_EMAIL (+22 more)

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
Cohesion: 0.16
Nodes (13): App(), AuthSyncFailure(), LinkPeek(), ScrollProgress(), isPublicNavbarPath(), starfieldModeForPath(), PublicNavSkeleton(), BackgroundPixelStars() (+5 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "client.ts"
Cohesion: 0.07
Nodes (28): AccessTokenProvider, ADMIN_API_BASE_URL, AdminApiError, adminRequest(), AdminRequestOptions, buildAdminQuery(), Decoder, environment (+20 more)

### Community 83 - "models/index.ts"
Cohesion: 0.13
Nodes (23): CouponCreate, CouponUpdate, UserUpdate, AdminCollectionState, PagingState, useAdminCollection(), AdminMutationState, asError() (+15 more)

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenario, Fix, Fix, Fix, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "compilerOptions"
Cohesion: 0.06
Nodes (32): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noUnusedLocals (+24 more)

### Community 86 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.35
Nodes (9): ACCOUNT_CREDENTIAL_FIELDS, USER_CREDENTIAL_FIELDS, initAdmin(), apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts() (+1 more)

### Community 87 - "HistoryPage.jsx"
Cohesion: 0.08
Nodes (30): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), EMPTY_SETUPS, GRADES, legacySessionPrefill() (+22 more)

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
Cohesion: 0.06
Nodes (51): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+43 more)

### Community 97 - "FirebaseTradeRepository.js"
Cohesion: 0.18
Nodes (10): dateContradicts(), ENTRY_TIERS, entryInstant(), FirebaseTradeRepository, resolveEditedSession(), SESSION_EDIT_FIELDS, dayMatchesInstant(), entryMoment() (+2 more)

### Community 98 - "AnalyticsPage.jsx"
Cohesion: 0.10
Nodes (24): readTokens(), resolveChartTheme(), seriesColor(), TOKEN_NAMES, deriveSessionStats(), formatSignedNumber(), AnalyticsPage(), buildSessionInsight() (+16 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.12
Nodes (34): addSessionDelta(), persistBrokerTrades(), chunkedDbGetAll(), migrateAnalytics(), analyticsDeltaForTrades(), analyticsUpdate(), CLOSE_FIELDS, emptyDelta() (+26 more)

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
Cohesion: 0.14
Nodes (19): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AppServicesContext, AppServicesProvider(), useSessionWallet(), createAppServices(), AuthenticatedRoutes() (+11 more)

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 118 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 119 - "LogTradePage"
Cohesion: 0.33
Nodes (4): LogTradePage(), dayKeyAgo(), h, trade()

### Community 121 - "ErrorBoundary.jsx"
Cohesion: 0.12
Nodes (11): AppProviders(), cardStyle, detailStyle, ErrorBoundary, eyebrowStyle, iconStyle, primaryButtonStyle, secondaryButtonStyle (+3 more)

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
Cohesion: 0.12
Nodes (23): AdminId, AdminQueryError, IsoDateString, MutationReason, PaginationParams, Reasoned, SingleResult, Coupon (+15 more)

### Community 128 - "admin-dashboard/package.json"
Cohesion: 0.06
Nodes (33): dependencies, firebase, lucide-react, react, react-dom, react-router-dom, devDependencies, @types/node (+25 more)

### Community 129 - "AuthContext.tsx"
Cohesion: 0.12
Nodes (25): AuthenticatedLayout(), ADMIN_EMAIL, ADMIN_UID, AdminAdmissionError, AdminAdmissionFailure, admissionErrorMessage(), verifyAdminAdmission(), AdminLogin() (+17 more)

### Community 130 - "_entitlementMiddleware.ts"
Cohesion: 0.19
Nodes (15): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), isSyncAllowed(), verifyIdToken(), assertPro(), ProGateOptions, requireAuth() (+7 more)

### Community 132 - "PublicSite.jsx"
Cohesion: 0.16
Nodes (12): PLAN_LINES, PricingBridge(), ArrowOut(), CTALink(), Panel(), SectionHead(), Shot(), SHOT_HEIGHT (+4 more)

### Community 134 - "useAppServices"
Cohesion: 0.24
Nodes (9): useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, useJournals(), byDateDesc(), mergeTrades(), useTrades() (+1 more)

### Community 135 - "_tradeService.ts"
Cohesion: 0.29
Nodes (11): now(), handleCloseTradeSync(), handleOpenTradeSync(), isoOrNull(), computePips(), isGoldSymbol(), OUTCOME_EPSILON, outcomeForPnl() (+3 more)

### Community 136 - "_middleware.ts"
Cohesion: 0.28
Nodes (7): getClientIp(), adminAllowedOrigins, allowedOrigins, DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware

### Community 138 - "pages/index.ts"
Cohesion: 0.15
Nodes (18): AnalyticsPage, AnnouncementsPage, App(), CouponsPage, OverviewPage, PaymentsPage, ReportsPage, SettingsPage (+10 more)

### Community 141 - "build-og.mjs"
Cohesion: 0.40
Nodes (3): out, root, shot

### Community 142 - "ReportRepository.ts"
Cohesion: 0.24
Nodes (9): reportPatch(), ReportRepository, reportStatus(), Report, ReportListParams, ReportStatus, ReportType, ReportUpdate (+1 more)

### Community 143 - "useTrades.editTrade.test.jsx"
Cohesion: 0.22
Nodes (6): APPLIED_PATCH, harness, LATER_TRADE, OLD_TRADE, RECENT_TRADE, USER

### Community 146 - "SetupCombobox.jsx"
Cohesion: 0.20
Nodes (10): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+2 more)

### Community 147 - "AnnouncementRepository.ts"
Cohesion: 0.19
Nodes (10): AnnouncementRepository, Announcement, AnnouncementCreate, AnnouncementLevel, AnnouncementListParams, AnnouncementStatus, AnnouncementTarget, AnnouncementUpdate (+2 more)

### Community 150 - "AuthenticatedRoutes.jsx"
Cohesion: 0.15
Nodes (8): AnalyticsPage, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage, SettingsPage

### Community 153 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 154 - "SESSION_ENGINE_VERSION"
Cohesion: 0.22
Nodes (4): baseTrade, TradeEntity, LogTradeUseCase, SESSION_ENGINE_VERSION

### Community 155 - "consolidateBrokerConnect"
Cohesion: 0.26
Nodes (11): deletionPatch(), AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect() (+3 more)

### Community 156 - "migrate-performance-data.mjs"
Cohesion: 0.22
Nodes (9): apply, args, main(), maxUsers, migrateBrokerJobs(), mode, startAfterBrokerPath, startAfterUser (+1 more)

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

### Community 162 - "useRouteExperience.js"
Cohesion: 0.40
Nodes (7): clearUxState(), shouldSkip(), useRouteExperience(), initGA(), trackPageview(), observeRouteWebVitals(), ratingFor()

### Community 171 - "useMutationConfirmation.ts"
Cohesion: 0.43
Nodes (6): AdminMutationConfirmation, assertMutationReason(), ConfirmationAction, MutationConfirmationState, PendingConfirmation, useMutationConfirmation()

### Community 172 - "tradeService.js"
Cohesion: 0.52
Nodes (4): useTradeController(), getRemainingFreeTrades(), isProPlan(), submitTrade()

## Knowledge Gaps
- **723 isolated node(s):** `rootDir`, `adminDir`, `args`, `AdminId`, `AdminQueryError` (+718 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `AnalyticsPage.jsx`, `PublicSite.jsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `SectionCard.jsx`, `SettingsPage.jsx`, `sticky-footer.tsx`, `FooterNav.jsx`, `SetupCombobox.jsx`, `tradeUtils.js`, `DataTable.jsx`, `dropdown-menu.tsx`, `HistoryPage.jsx`, `lib/utils.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `_tradeService.ts` to `FirebaseTradeRepository.js`, `_metaapi-broker.js`, `tradeAnalytics.js`, `demoData.js`, `HistoryPage.jsx`, `sessionEngine.js`, `SESSION_ENGINE_VERSION`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `rootDir`, `adminDir`, `args` to the rest of the system?**
  _723 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08076923076923077 - nodes in this community are weakly interconnected._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06398730830248546 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._