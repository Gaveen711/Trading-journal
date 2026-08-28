# Graph Report - xaujournal  (2026-08-26)

## Corpus Check
- 290 files · ~497,491 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2020 nodes · 4224 edges · 150 communities (94 shown, 56 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49ba3641`
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
- ManageSetupsDialog.jsx
- compilerOptions
- LandingPage.jsx
- brokerWallData.js
- components.json
- goldSessions.js
- useSetups.js
- firebaseTradeRepository.test.js
- DataTable.jsx
- FirebaseBrokerRepository.js
- tradeUtils.js
- dropdown-menu.tsx
- sessionEngine.js
- MEDIUM
- LogTradePage.jsx
- BlogsPage.jsx
- SubscriptionRepository
- goldContract.js
- MT4/MT5 Broker Login Sync Implementation
- grant-admin.mjs
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- EmptyState.jsx
- _metaapi-broker.js
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- utils.ts
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
- sheet.tsx
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
- bento-grid.tsx
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
- LogTradePage
- useBrokerAccounts.adopt.test.jsx
- FirebaseTradeRepository
- HistoryPage.jsx
- BlogArticlePage.jsx
- DashboardLayout.sidebarWiring.test.js
- AuthenticatedRoutes.jsx
- clsx
- eslint-plugin-react-hooks
- ShowcaseApp.jsx
- badge.tsx
- StatusSquare.jsx
- postcss
- PublicSite.jsx
- @testing-library/jest-dom
- EditTradeModal.submit.test.jsx
- interactive-hover-button.jsx
- @types/react-dom
- @vitejs/plugin-react
- build-og.mjs
- FloatingDockNavigation.jsx
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
2. `Button()` - 32 edges
3. `AnalyticsPage()` - 23 edges
4. `useToast()` - 23 edges
5. `resolveSessionAt()` - 22 edges
6. `tradeAnalyticsDelta()` - 19 edges
7. `formatCurrency()` - 19 edges
8. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
9. `slugifySetupName()` - 18 edges
10. `isPaidPlan()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `persistBrokerTrades()` --calls--> `analyticsDeltaForTrades()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `tradeAnalyticsDelta()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `deletionPatch()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_credentialFields.js
- `migrateBrokerJobs()` --calls--> `deletionPatch()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_credentialFields.js
- `isSyncAllowed()` --calls--> `hasPaidAccess()`  [EXTRACTED]
  api/_auth.ts → src/lib/entitlements.js

## Import Cycles
- None detected.

## Communities (150 total, 56 thin omitted)

### Community 0 - "disciplineRules.js"
Cohesion: 0.08
Nodes (26): sameRules(), useDisciplineSettings(), earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), clampRuleValue(), dayKeyMidnightMs(), DEFAULT_DISCIPLINE_RULES (+18 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.15
Nodes (14): BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS (+6 more)

### Community 2 - "button.tsx"
Cohesion: 0.06
Nodes (35): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+27 more)

### Community 3 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, admin:grant, admin:list, build, build:budget, dev, lint, migrate:broker-privacy (+8 more)

### Community 4 - "cn"
Cohesion: 0.07
Nodes (39): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CustomSelect(), Field() (+31 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, @eslint/js, eslint-plugin-react-refresh, globals, jsdom, devDependencies, autoprefixer, @eslint/js (+17 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.08
Nodes (33): Logo(), DropdownMenuSeparator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup() (+25 more)

### Community 7 - "inMemoryRepositories.js"
Cohesion: 0.05
Nodes (14): TradeRepository, byDateDesc(), channel(), clone(), createInMemoryRepositories(), createShowcaseStore(), docSnapshot(), InMemoryBrokerRepository (+6 more)

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
Nodes (28): DESK_NAMES, initialRailId(), RAIL, RAIL_TO_DESK, ReadChapterRail(), SessionFigures(), SessionRail(), signClass() (+20 more)

### Community 12 - "PricingPage.jsx"
Cohesion: 0.07
Nodes (26): AppRoutes(), AuthenticatedApp, isShowcaseRequested(), PricingPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage, TermsOfServicePage (+18 more)

### Community 13 - "ManageSetupsDialog.jsx"
Cohesion: 0.14
Nodes (23): EmptyState(), effectiveSlug(), EMPTY_LIST, EMPTY_MAP, findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed() (+15 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "LandingPage.jsx"
Cohesion: 0.09
Nodes (36): LandingPage, Chapters, FAQ(), Proof(), STEPS, PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE (+28 more)

### Community 16 - "brokerWallData.js"
Cohesion: 0.19
Nodes (14): BrokerWall(), PLATFORMS, BROKER_CHIP_MARKS, BROKER_COUNT, BROKER_LOGO_FILES, BROKER_ROWS, BROKER_WALL, brokerDisplayName() (+6 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "goldSessions.js"
Cohesion: 0.10
Nodes (36): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+28 more)

### Community 19 - "useSetups.js"
Cohesion: 0.12
Nodes (23): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+15 more)

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
Cohesion: 0.14
Nodes (20): CurrencyConverter(), ratesCache, TradeShareCard, CURRENCIES, useMonthTrades(), primarySessionForCode(), getTradeStrategyTags(), formatCompact() (+12 more)

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuShortcut() (+3 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.16
Nodes (21): CODE_HUBS, EMPTY, HUB_ORDER, HUB_PRIORITY, hubWindowMs(), isDeskOpenAt(), isWeekendRestAt(), resolveSessionAt() (+13 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "LogTradePage.jsx"
Cohesion: 0.19
Nodes (11): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroup(), ToggleGroupContext, ToggleGroupItem() (+3 more)

### Community 28 - "BlogsPage.jsx"
Cohesion: 0.10
Nodes (16): BlogsPage, Arrow(), articles, articles, studyArticles, studyCategories, articles, COUNTS (+8 more)

### Community 30 - "goldContract.js"
Cohesion: 0.21
Nodes (8): TradeEntity, LogTradeUseCase, computePips(), isGoldSymbol(), OUTCOME_EPSILON, outcomeForPnl(), XAUUSD_OZ_PER_LOT, XAUUSD_PIP_SIZE

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "grant-admin.mjs"
Cohesion: 0.33
Nodes (4): args, list, revoke, uid

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.21
Nodes (11): Login, db, signOutAndClearCache(), storage, app, auth, facebookProvider, firebaseConfig (+3 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.33
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "_metaapi-broker.js"
Cohesion: 0.26
Nodes (14): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+6 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "utils.ts"
Cohesion: 0.12
Nodes (15): DELTA_CLASS, DELTA_SIGN, TONE_CLASS, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+7 more)

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
Cohesion: 0.10
Nodes (25): ANCHOR_UTC, buildTrade(), CONFLUENCE, CONVICTION, dateForDay(), DEMO_BROKER_ACCOUNTS, DEMO_JOURNALS, DEMO_NET_PNL (+17 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "_entitlementMiddleware.test.js"
Cohesion: 0.09
Nodes (28): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), isSyncAllowed(), verifyIdToken(), assertPro(), ProGateOptions, requireAuth() (+20 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 58 - "[[...route]].ts"
Cohesion: 0.07
Nodes (46): deletionPatch(), getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware (+38 more)

### Community 59 - "App.jsx"
Cohesion: 0.06
Nodes (31): App(), AuthSyncFailure(), LinkPeek(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders() (+23 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 83 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenario, Fix, Fix, Fix, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, checkJs, lib, noEmit, paths, strict, types (+7 more)

### Community 86 - "migrate-performance-data.mjs"
Cohesion: 0.13
Nodes (21): ACCOUNT_CREDENTIAL_FIELDS, USER_CREDENTIAL_FIELDS, db, initAdmin(), isDbReady(), app, mockKvStore, apply (+13 more)

### Community 87 - "DashboardRightSidebar.jsx"
Cohesion: 0.11
Nodes (25): EditTradeModal(), ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, DashboardRightSidebar(), EMPTY_SETUPS, GRADES, legacySessionPrefill() (+17 more)

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

### Community 95 - "bento-grid.tsx"
Cohesion: 0.40
Nodes (3): BentoCard(), BentoGrid(), BentoIcon

### Community 96 - "marketData.js"
Cohesion: 0.06
Nodes (51): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+43 more)

### Community 97 - "_tradeService.ts"
Cohesion: 0.14
Nodes (22): addSessionDelta(), persistBrokerTrades(), baseTrade, now(), chunkedDbGetAll(), handleTradeWebhook(), hashToken(), handleCloseTradeSync() (+14 more)

### Community 98 - "AnalyticsPage.jsx"
Cohesion: 0.09
Nodes (23): StatCard(), readTokens(), resolveChartTheme(), seriesColor(), TOKEN_NAMES, formatSignedNumber(), AnalyticsPage(), buildSessionInsight() (+15 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.10
Nodes (38): migrateAnalytics(), ANALYTICS_VERSION, analyticsDeltaForTrades(), CLOSE_FIELDS, dayMatchesInstant(), deriveSessionStats(), emptyDelta(), emptySessionAnalytics() (+30 more)

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
Cohesion: 0.07
Nodes (45): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext (+37 more)

### Community 117 - "package.json"
Cohesion: 0.29
Nodes (6): author, description, name, private, type, version

### Community 118 - "SettingsPage.jsx"
Cohesion: 0.14
Nodes (12): useSessionBrokerAccounts(), DashboardLayout(), Input(), ThemeContext, ThemeProvider(), useAppTheme(), ACCENT_TEMPLATES, accentTemplateName() (+4 more)

### Community 119 - "LogTradePage"
Cohesion: 0.33
Nodes (4): LogTradePage(), dayKeyAgo(), h, trade()

### Community 122 - "HistoryPage.jsx"
Cohesion: 0.13
Nodes (17): DirectionCell(), isLongDirection(), isShortDirection(), toDate(), toMillis(), chip(), DetailField(), formatTradeTime() (+9 more)

### Community 123 - "BlogArticlePage.jsx"
Cohesion: 0.14
Nodes (17): BlogArticlePage, NotFoundPage, TextLink(), getArticle(), BlogArticlePage(), escapeRegExp(), formatUpdated(), Headline() (+9 more)

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

### Community 125 - "AuthenticatedRoutes.jsx"
Cohesion: 0.15
Nodes (10): AnalyticsPage, AuthenticatedRoutes(), BrokerSync, CalendarPage, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage (+2 more)

### Community 128 - "ShowcaseApp.jsx"
Cohesion: 0.21
Nodes (10): DEMO_DATASET, DEMO_DISPLAY_NAME, DEMO_EMAIL, DEMO_UID, fakeAuth, showcaseUser, createShowcaseServices(), NO_ACTIONS (+2 more)

### Community 132 - "PublicSite.jsx"
Cohesion: 0.19
Nodes (11): PLAN_LINES, PricingBridge(), ArrowOut(), CTALink(), Panel(), SectionHead(), Shot(), SHOT_HEIGHT (+3 more)

### Community 134 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 141 - "build-og.mjs"
Cohesion: 0.40
Nodes (3): out, root, shot

## Knowledge Gaps
- **572 isolated node(s):** `NAV_LINKS`, `TRADE`, `PLATFORMS`, `mocks`, `FooterLink` (+567 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `badge.tsx`, `button.tsx`, `StatusSquare.jsx`, `DashboardLayout.jsx`, `interactive-hover-button.jsx`, `ManageSetupsDialog.jsx`, `FloatingDockNavigation.jsx`, `goldSessions.js`, `useSetups.js`, `DataTable.jsx`, `tradeUtils.js`, `dropdown-menu.tsx`, `LogTradePage.jsx`, `EmptyState.jsx`, `utils.ts`, `sticky-footer.tsx`, `alert.tsx`, `sheet.tsx`, `DashboardRightSidebar.jsx`, `bento-grid.tsx`, `AnalyticsPage.jsx`, `SettingsPage.jsx`, `HistoryPage.jsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `resolveSessionAt()` connect `sessionEngine.js` to `_tradeService.ts`, `_metaapi-broker.js`, `tradeAnalytics.js`, `demoData.js`, `goldSessions.js`, `DashboardRightSidebar.jsx`, `goldContract.js`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `DashboardLayout.jsx`, `createAppServices.js`, `PricingPage.jsx`, `FirebaseBrokerRepository.js`, `DashboardRightSidebar.jsx`, `SettingsPage.jsx`, `App.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `NAV_LINKS`, `TRADE`, `PLATFORMS` to the rest of the system?**
  _572 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `disciplineRules.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08170731707317073 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06246799795186892 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._