# Graph Report - xaujournal  (2026-08-23)

## Corpus Check
- 286 files · ~496,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2018 nodes · 4207 edges · 156 communities (100 shown, 56 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28bc5880`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- disciplineRules.test.js
- BrokerSync.jsx
- button.tsx
- scripts
- cn
- devDependencies
- DashboardLayout.jsx
- inMemoryRepositories.js
- ToastContext.jsx
- overrides
- ContactPage.jsx
- Hero.jsx
- AppRoutes.jsx
- HistoryPage.jsx
- compilerOptions
- PricingPage.jsx
- SettingsPage.resetTerminal.test.jsx
- components.json
- goldSessions.js
- SetupCombobox.jsx
- firebaseTradeRepository.test.js
- DataTable.jsx
- FirebaseBrokerRepository.js
- AnalyticsPage.jsx
- dropdown-menu.tsx
- sessionEngine.js
- MEDIUM
- utils.ts
- BlogsPage.jsx
- SubscriptionRepository
- disciplineRules.js
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- EmptyState.jsx
- useBrokerAccounts.js
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- capture-shots.mjs
- createAppServices.js
- check-bundle-budget.mjs
- vite.config.js
- useSetups.js
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
- FirebaseTradeRepository.js
- LogTradePage.jsx
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
- app/AuthenticatedApp.jsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons
- package.json
- SettingsPage.jsx
- LogTradePage.discipline.test.jsx
- useBrokerAccounts.adopt.test.jsx
- AnalyticsPage.disciplineLock.test.jsx
- HistoryPage.setupWiring.test.jsx
- BlogArticlePage.jsx
- DashboardLayout.sidebarWiring.test.js
- AuthenticatedRoutes.jsx
- clsx
- eslint-plugin-react-hooks
- ShowcaseApp.jsx
- useAppServices
- slugifySetupName
- postcss
- PublicSite.jsx
- @testing-library/jest-dom
- EditTradeModal.submit.test.jsx
- sticky-footer.tsx
- useTrades.editTrade.test.jsx
- @types/react-dom
- @vitejs/plugin-react
- InMemoryTradeRepository
- build-og.mjs
- FloatingDockNavigation.jsx
- InMemoryWalletRepository
- DashboardLayout.profileMenu.test.js
- eslint
- sharp
- tailwindcss
- typescript-eslint
- vercel
- vite
- vitest
- shots/README.md

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

## Communities (156 total, 56 thin omitted)

### Community 0 - "disciplineRules.test.js"
Cohesion: 0.11
Nodes (14): sameRules(), useDisciplineSettings(), clampRuleValue(), DEFAULT_DISCIPLINE_RULES, DISCIPLINE_RULES_VERSION, normalizeDisciplineRules(), RULE_BOUNDS, RULE_IDS (+6 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.08
Nodes (29): BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BrokerWall(), PLATFORMS, BROKER_CHIP_MARKS (+21 more)

### Community 2 - "button.tsx"
Cohesion: 0.07
Nodes (34): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), PLAN_LINES, PricingBridge(), OnboardingModal() (+26 more)

### Community 3 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, admin:grant, admin:list, build, build:budget, dev, lint, migrate:broker-privacy (+8 more)

### Community 4 - "cn"
Cohesion: 0.05
Nodes (48): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+40 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, @eslint/js, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer, @eslint/js (+17 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.06
Nodes (39): Logo(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+31 more)

### Community 7 - "inMemoryRepositories.js"
Cohesion: 0.09
Nodes (10): byDateDesc(), channel(), clone(), createShowcaseStore(), docSnapshot(), InMemoryBrokerRepository, InMemoryJournalRepository, InMemorySetupRepository (+2 more)

### Community 8 - "ToastContext.jsx"
Cohesion: 0.15
Nodes (10): actionIn(), BY_ID, CATALOG, rowFor(), TRADES, CurrencyConverter(), ratesCache, ToastContext (+2 more)

### Community 9 - "overrides"
Cohesion: 0.11
Nodes (18): overrides, axios, braces, cross-spawn, crypto-js, elliptic, esbuild, fast-xml-parser (+10 more)

### Community 10 - "ContactPage.jsx"
Cohesion: 0.14
Nodes (19): BROKER_COUNTS, buildPayload(), COMING_SOON_NAMES, ContactPage(), describedBy(), EMPTY_FORM, FIELD_IDS, FIELD_ORDER (+11 more)

### Community 11 - "Hero.jsx"
Cohesion: 0.09
Nodes (28): Chapters, DESK_NAMES, initialRailId(), RAIL, RAIL_TO_DESK, ReadChapterRail(), SessionFigures(), signClass() (+20 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.08
Nodes (24): AppRoutes(), AuthenticatedApp, BlogArticlePage, BlogsPage, ContactPage, isShowcaseRequested(), LandingPage, NotFoundPage (+16 more)

### Community 13 - "HistoryPage.jsx"
Cohesion: 0.11
Nodes (29): EmptyState(), EMPTY_LIST, EMPTY_MAP, SectionCard(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+21 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "PricingPage.jsx"
Cohesion: 0.07
Nodes (40): FAQ(), Proof(), STEPS, PageSEO(), SectionHead(), useDeskReveal(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE (+32 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "goldSessions.js"
Cohesion: 0.09
Nodes (39): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+31 more)

### Community 19 - "SetupCombobox.jsx"
Cohesion: 0.17
Nodes (11): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Input(), Popover(), PopoverContent(), PopoverDescription() (+3 more)

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
Cohesion: 0.10
Nodes (36): TradeShareCard, useMonthTrades(), primarySessionForCode(), getTradeSessionCode(), getTradeStrategyTags(), formatCompact(), formatCurrency(), formatCurrencyCompact() (+28 more)

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.10
Nodes (32): baseTrade, now(), handleTradeWebhook(), hashToken(), handleCloseTradeSync(), handleOpenTradeSync(), isoOrNull(), resolveKey() (+24 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "utils.ts"
Cohesion: 0.16
Nodes (11): Badge(), badgeVariants, Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroupContext (+3 more)

### Community 28 - "BlogsPage.jsx"
Cohesion: 0.11
Nodes (15): Arrow(), articles, articles, studyArticles, studyCategories, articles, COUNTS, FeaturedNote() (+7 more)

### Community 30 - "disciplineRules.js"
Cohesion: 0.13
Nodes (15): LogTradeUseCase, earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), dayKeyMidnightMs(), ORDINAL_SUFFIXES, positionKey(), preciseMoments() (+7 more)

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
Cohesion: 0.21
Nodes (11): Login, db, signOutAndClearCache(), storage, app, auth, facebookProvider, firebaseConfig (+3 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.33
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "useBrokerAccounts.js"
Cohesion: 0.32
Nodes (15): dropLocalAccount(), hasServerLogin(), useBrokerAccounts(), addAccount(), hasSessionCredential(), removeAccount(), syncAccount(), accountsKey() (+7 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.36
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

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

### Community 46 - "useSetups.js"
Cohesion: 0.28
Nodes (12): compareSetups(), effectiveSlug(), findSlugOwner(), firestoreCatalog, lookup(), nextSortOrder(), SEED_DEFINITIONS, seedDefaults() (+4 more)

### Community 47 - "demoData.js"
Cohesion: 0.06
Nodes (50): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+42 more)

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
Cohesion: 0.07
Nodes (30): App(), AuthSyncFailure(), LinkPeek(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders() (+22 more)

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
Cohesion: 0.09
Nodes (28): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), EMPTY_SETUPS, GRADES, legacySessionPrefill() (+20 more)

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
Nodes (51): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+43 more)

### Community 97 - "FirebaseTradeRepository.js"
Cohesion: 0.15
Nodes (15): addSessionDelta(), persistBrokerTrades(), chunkedDbGetAll(), dateContradicts(), ENTRY_TIERS, entryInstant(), FirebaseTradeRepository, resolveEditedSession() (+7 more)

### Community 98 - "LogTradePage.jsx"
Cohesion: 0.12
Nodes (14): DirectionCell(), DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, ThemeContext, useAppTheme(), readTokens() (+6 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.13
Nodes (28): migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), CLOSE_FIELDS, dayMatchesInstant(), deriveSessionStats(), emptyDelta(), emptySessionAnalytics() (+20 more)

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "app/AuthenticatedApp.jsx"
Cohesion: 0.17
Nodes (12): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, useSessionWallet(), toast, WalletTopUpDialog(), DashboardLayout(), useToast() (+4 more)

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 118 - "SettingsPage.jsx"
Cohesion: 0.19
Nodes (9): useSessionBrokerAccounts(), SQUARE_STATE, StatusSquare(), Switch(), ACCENT_TEMPLATES, accentTemplateName(), getAuthErrorMessage(), SettingsPage() (+1 more)

### Community 119 - "LogTradePage.discipline.test.jsx"
Cohesion: 0.40
Nodes (3): dayKeyAgo(), h, trade()

### Community 121 - "AnalyticsPage.disciplineLock.test.jsx"
Cohesion: 0.47
Nodes (4): dayKeyAgo(), h, renderPage(), trade()

### Community 122 - "HistoryPage.setupWiring.test.jsx"
Cohesion: 0.33
Nodes (4): archiveSetup, createSetup, SETUPS, TRADE

### Community 123 - "BlogArticlePage.jsx"
Cohesion: 0.20
Nodes (13): getArticle(), BlogArticlePage(), escapeRegExp(), formatUpdated(), Headline(), NOTES, readRail(), sectionIds() (+5 more)

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

### Community 125 - "AuthenticatedRoutes.jsx"
Cohesion: 0.15
Nodes (10): AnalyticsPage, AuthenticatedRoutes(), BrokerSync, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage (+2 more)

### Community 128 - "ShowcaseApp.jsx"
Cohesion: 0.24
Nodes (10): AppServicesContext, AppServicesProvider(), createAppServices(), PageLoader(), DEMO_DATASET, createInMemoryRepositories(), createShowcaseServices(), NO_ACTIONS (+2 more)

### Community 129 - "useAppServices"
Cohesion: 0.24
Nodes (9): useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, useJournals(), byDateDesc(), mergeTrades(), useTrades() (+1 more)

### Community 130 - "slugifySetupName"
Cohesion: 0.27
Nodes (13): effectiveSlug(), findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed(), followMerge(), getTradeSetupKey(), legacySetupName() (+5 more)

### Community 132 - "PublicSite.jsx"
Cohesion: 0.26
Nodes (8): ArrowOut(), Panel(), Shot(), SHOT_HEIGHT, SHOT_WIDTH, SHOTS, shotSrc(), InteractiveHoverButton

### Community 134 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 135 - "sticky-footer.tsx"
Cohesion: 0.22
Nodes (7): AnimatedContainerProps, FooterLink, FooterLinkGroup, footerLinkGroups, socialLinks, StickyFooter(), StickyFooterProps

### Community 136 - "useTrades.editTrade.test.jsx"
Cohesion: 0.22
Nodes (6): APPLIED_PATCH, harness, LATER_TRADE, OLD_TRADE, RECENT_TRADE, USER

### Community 141 - "build-og.mjs"
Cohesion: 0.40
Nodes (3): out, root, shot

## Knowledge Gaps
- **571 isolated node(s):** `checks`, `checks`, `Env`, `Variables`, `WEB_VITAL_NAMES` (+566 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `LogTradePage.jsx`, `PublicSite.jsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `sticky-footer.tsx`, `SectionCard.jsx`, `HistoryPage.jsx`, `app/AuthenticatedApp.jsx`, `FloatingDockNavigation.jsx`, `goldSessions.js`, `SetupCombobox.jsx`, `AnalyticsPage.jsx`, `DataTable.jsx`, `SettingsPage.jsx`, `DashboardRightSidebar.jsx`, `dropdown-menu.tsx`, `utils.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `sessionEngine.js` to `FirebaseTradeRepository.js`, `tradeAnalytics.js`, `demoData.js`, `goldSessions.js`, `AnalyticsPage.jsx`, `DashboardRightSidebar.jsx`, `disciplineRules.js`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `BrokerSync.jsx`, `DashboardLayout.jsx`, `createAppServices.js`, `PricingPage.jsx`, `FirebaseBrokerRepository.js`, `DashboardRightSidebar.jsx`, `SettingsPage.jsx`, `App.jsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `checks`, `checks`, `Env` to the rest of the system?**
  _571 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.test.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11255411255411256 - nodes in this community are weakly interconnected._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._