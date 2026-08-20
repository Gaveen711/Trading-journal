# Graph Report - xaujournal  (2026-08-20)

## Corpus Check
- 248 files · ~437,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1745 nodes · 3604 edges · 127 communities (89 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `88c577e1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- _tradeService.ts
- BrokerSync.jsx
- button.tsx
- migrate-performance-data.mjs
- cn
- devDependencies
- DashboardLayout.jsx
- [[...route]].ts
- tradeUtils.js
- overrides
- PricingPage.jsx
- LandingPage.jsx
- AppRoutes.jsx
- ManageSetupsDialog.jsx
- compilerOptions
- seo.js
- useBrokerAccounts.js
- components.json
- FooterNav.jsx
- HistoryPage.jsx
- field.tsx
- DataTable.jsx
- FirebaseBrokerRepository.js
- AnalyticsPage.jsx
- dropdown-menu.tsx
- sessionEngine.js
- MEDIUM
- LogTradePage.jsx
- BlogArticlePage.jsx
- db
- AuthenticatedRoutes.jsx
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
- compilerOptions
- JournalRepository
- firebase.js
- class-variance-authority
- EmptyState.jsx
- disciplineRules.js
- 2. Wrappers — `src/components/app/*.jsx`
- firebase-admin
- SectionCard.jsx
- app/AuthenticatedApp.jsx
- createAppServices.js
- check-bundle-budget.mjs
- vite.config.js
- SetupCombobox.jsx
- PublicVisuals.jsx
- vercel.json
- firebase.d.ts
- tradeConfig.js
- _entitlementMiddleware.test.js
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
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
- FirebaseTradeRepository.js
- marketData.js
- sessionAnalyticsDelta
- useAppServices
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
- EditTradeModal.submit.test.jsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons
- sheet.tsx
- tradeAnalyticsSessions.test.js
- useTrades.editTrade.test.jsx
- useBrokerAccounts.adopt.test.jsx
- AnalyticsPage.disciplineLock.test.jsx
- LogTradePage.discipline.test.jsx
- StatusSquare.jsx
- DashboardLayout.sidebarWiring.test.js
- DirectionCell.jsx
- clsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 199 edges
2. `Button()` - 27 edges
3. `useToast()` - 21 edges
4. `resolveSessionAt()` - 20 edges
5. `AnalyticsPage()` - 20 edges
6. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
7. `tradeAnalyticsDelta()` - 18 edges
8. `isPaidPlan()` - 18 edges
9. `compilerOptions` - 18 edges
10. `overrides` - 18 edges

## Surprising Connections (you probably didn't know these)
- `persistBrokerTrades()` --calls--> `analyticsDeltaForTrades()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `subtractTradeAnalytics()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `persistBrokerTrades()` --calls--> `tradeAnalyticsDelta()`  [EXTRACTED]
  api/_brokerTradePersistence.ts → src/lib/tradeAnalytics.js
- `normalizeDeal()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_metaapi-broker.js → src/lib/sessionEngine.js
- `handleOpenTradeSync()` --calls--> `resolveSessionAt()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/sessionEngine.js

## Import Cycles
- None detected.

## Communities (127 total, 38 thin omitted)

### Community 0 - "_tradeService.ts"
Cohesion: 0.38
Nodes (9): isSyncAllowed(), now(), handleTradeWebhook(), hashToken(), validateSyncPayload(), handleCloseTradeSync(), handleOpenTradeSync(), isoOrNull() (+1 more)

### Community 1 - "BrokerSync.jsx"
Cohesion: 0.15
Nodes (15): useSessionBrokerAccounts(), BrokerLogo(), BrokerSync(), handleConnect(), handleManualSync(), handleRemove(), BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS (+7 more)

### Community 2 - "button.tsx"
Cohesion: 0.06
Nodes (36): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+28 more)

### Community 3 - "migrate-performance-data.mjs"
Cohesion: 0.19
Nodes (15): apply, args, main(), maxUsers, migrateAnalytics(), migrateBrokerJobs(), mode, startAfterBrokerPath (+7 more)

### Community 4 - "cn"
Cohesion: 0.08
Nodes (33): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+25 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies (+39 more)

### Community 6 - "DashboardLayout.jsx"
Cohesion: 0.08
Nodes (33): ACCENT_TEMPLATES, DropdownMenuSeparator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup() (+25 more)

### Community 7 - "[[...route]].ts"
Cohesion: 0.09
Nodes (34): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware, resend (+26 more)

### Community 8 - "tradeUtils.js"
Cohesion: 0.13
Nodes (19): CalendarPage, SectionCard(), CurrencyConverter(), ratesCache, DatePicker(), CURRENCIES, useMonthTrades(), formatCompact() (+11 more)

### Community 9 - "overrides"
Cohesion: 0.05
Nodes (38): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+30 more)

### Community 10 - "PricingPage.jsx"
Cohesion: 0.10
Nodes (22): BlogsPage, ContactPage, PricingPage, NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), CTALink() (+14 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.07
Nodes (35): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), RECORD (+27 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (17): AuthenticatedApp, BlogArticlePage, LandingPage, NotFoundPage, PrivacyPolicyPage, PUBLIC_NAVBAR_PATHS, RefundPolicyPage, TermsOfServicePage (+9 more)

### Community 13 - "ManageSetupsDialog.jsx"
Cohesion: 0.13
Nodes (25): effectiveSlug(), EMPTY_LIST, EMPTY_MAP, findSlugOwner(), legacyTag(), ManageSetupsDialog(), trimmed(), AlertDialog() (+17 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, esModuleInterop (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.11
Nodes (26): PageSEO(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema(), buildFAQSchema() (+18 more)

### Community 16 - "useBrokerAccounts.js"
Cohesion: 0.32
Nodes (15): dropLocalAccount(), hasServerLogin(), useBrokerAccounts(), addAccount(), hasSessionCredential(), removeAccount(), syncAccount(), accountsKey() (+7 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.13
Nodes (26): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+18 more)

### Community 19 - "HistoryPage.jsx"
Cohesion: 0.14
Nodes (14): toDate(), toMillis(), chip(), DetailField(), formatTradeTime(), getTimestampMs(), HISTORY_COLUMNS, HistoryPage() (+6 more)

### Community 20 - "field.tsx"
Cohesion: 0.15
Nodes (13): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+5 more)

### Community 21 - "DataTable.jsx"
Cohesion: 0.18
Nodes (14): DataTable(), hideClass(), isEnd(), baseProps, columns, rows, Table(), TableBody() (+6 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.27
Nodes (6): FirebaseBrokerRepository, adoptBrokerCallable(), callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "AnalyticsPage.jsx"
Cohesion: 0.11
Nodes (25): TradeShareCard, deriveSessionStats(), getTradeOutcome(), getTradeStrategyTags(), isTradeAnalyticsEligible(), number(), tradePnlValue(), formatSignedNumber() (+17 more)

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuShortcut() (+3 more)

### Community 25 - "sessionEngine.js"
Cohesion: 0.06
Nodes (33): baseTrade, context, sdk, TradeEntity, LogTradeUseCase, pad(), sessionHours(), CODE_HUBS (+25 more)

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "LogTradePage.jsx"
Cohesion: 0.15
Nodes (16): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), ToggleGroup(), ToggleGroupContext, ToggleGroupItem() (+8 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.23
Nodes (9): articles, articles, getArticle(), studyArticles, studyCategories, articles, removeJsonLd(), BlogArticlePage() (+1 more)

### Community 29 - "db"
Cohesion: 0.20
Nodes (3): SubscriptionRepository, FirebaseSubscriptionRepository, db

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.16
Nodes (9): AnalyticsPage, AuthenticatedRoutes(), BrokerSync, CheckoutCancel, CheckoutSuccess, HistoryPage, JournalPage, LogTradePage (+1 more)

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
Nodes (11): Login, signOutAndClearCache(), storage, app, auth, facebookProvider, firebaseConfig, googleProvider (+3 more)

### Community 37 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (8): EmptyState(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 38 - "disciplineRules.js"
Cohesion: 0.08
Nodes (23): sameRules(), useDisciplineSettings(), earliestDayKey(), EMPTY_TRADES, useDisciplineViolations(), clampRuleValue(), dayKeyMidnightMs(), DEFAULT_DISCIPLINE_RULES (+15 more)

### Community 39 - "2. Wrappers — `src/components/app/*.jsx`"
Cohesion: 0.08
Nodes (24): 0.1 Fix `--win` / `--loss` (still the old, failing values), 0.2 Scope the heading rules, 0.3 Sanctioned primitive edits — the complete list, 0. Prerequisites — land these before the first wrapper, 1.1 Surfaces, 1.2 Type roles, 1.3 Spacing and density, 1.4 State encoding (+16 more)

### Community 41 - "SectionCard.jsx"
Cohesion: 0.17
Nodes (12): DELTA_CLASS, DELTA_SIGN, StatCard(), TONE_CLASS, Card(), CardAction(), CardContent(), CardDescription() (+4 more)

### Community 42 - "app/AuthenticatedApp.jsx"
Cohesion: 0.21
Nodes (11): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, useSessionWallet(), DashboardLayout(), ToastContext, useToast(), VerifyEmailBanner() (+3 more)

### Community 43 - "createAppServices.js"
Cohesion: 0.16
Nodes (3): WalletRepository, ResetTradesUseCase, FirebaseWalletRepository

### Community 44 - "check-bundle-budget.mjs"
Cohesion: 0.25
Nodes (8): budgets, directory, eager, eagerKb, files, gzipKb(), html, htmlPath

### Community 45 - "vite.config.js"
Cohesion: 0.28
Nodes (7): CHART_VENDOR, __dirname, EAGER_FORBIDDEN, manualChunks(), normalizeId(), packageOf(), REACT_VENDOR

### Community 46 - "SetupCombobox.jsx"
Cohesion: 0.13
Nodes (22): effectiveSlug(), EMPTY_SETUPS, SetupCombobox(), CATALOG, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+14 more)

### Community 47 - "PublicVisuals.jsx"
Cohesion: 0.31
Nodes (10): arcPath(), CANDLES, DIAL, DIAL_SESSIONS, fmt(), point(), REPLAY, SessionDial() (+2 more)

### Community 48 - "vercel.json"
Cohesion: 0.40
Nodes (4): crons, headers, redirects, rewrites

### Community 51 - "_entitlementMiddleware.test.js"
Cohesion: 0.13
Nodes (16): ACTIVE_PRO, expire(), FREE, FUTURE, get(), GRACE, incr(), LAPSED_GRACE (+8 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 58 - "_metaapi-broker.js"
Cohesion: 0.22
Nodes (18): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+10 more)

### Community 59 - "App.jsx"
Cohesion: 0.06
Nodes (31): App(), AuthSyncFailure(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders(), AppRoutes() (+23 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "_entitlementMiddleware.ts"
Cohesion: 0.26
Nodes (11): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), verifyIdToken(), assertPro(), ProGateOptions, requireAuth(), requireEmailVerified() (+3 more)

### Community 83 - "consolidateBrokerConnect"
Cohesion: 0.26
Nodes (11): deletionPatch(), AccountLockResult, cachedJson(), inflight, sleep(), withAccountLock(), withRetryBudget(), consolidateBrokerConnect() (+3 more)

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
Cohesion: 0.12
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

### Community 95 - "FirebaseTradeRepository.js"
Cohesion: 0.13
Nodes (12): TradeRepository, dateContradicts(), ENTRY_TIERS, entryInstant(), resolveEditedSession(), SESSION_EDIT_FIELDS, preciseMoments(), closeMoment() (+4 more)

### Community 96 - "marketData.js"
Cohesion: 0.06
Nodes (53): applyRealPrice(), applyTick(), baselineOf(), LiveMarketWidget(), percentChange(), readYahooQuote(), SPOT_SYMBOLS, tickPollMs() (+45 more)

### Community 97 - "sessionAnalyticsDelta"
Cohesion: 0.19
Nodes (9): addSessionDelta(), persistBrokerTrades(), chunkedDbGetAll(), FirebaseTradeRepository, analyticsUpdate(), sessionAnalyticsDelta(), sessionAnalyticsDeltaForTrades(), sessionAnalyticsUpdate() (+1 more)

### Community 98 - "useAppServices"
Cohesion: 0.20
Nodes (12): AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, createAppServices(), useJournals() (+4 more)

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 103 - "tradeAnalytics.js"
Cohesion: 0.21
Nodes (16): CLOSE_FIELDS, emptySessionAnalytics(), emptySessionBucket(), emptySessionDelta(), ENTRY_FIELDS, finiteOrNull(), followMerge(), getTradeSetupKey() (+8 more)

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

### Community 109 - "EditTradeModal.submit.test.jsx"
Cohesion: 0.21
Nodes (10): affectedKeys(), postMerge(), renderModal(), RULES, rulesTradeAllowlist(), SERVER_OWNED, stripComments(), submitEdit() (+2 more)

### Community 117 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 118 - "tradeAnalyticsSessions.test.js"
Cohesion: 0.24
Nodes (7): MIN_SESSION_INSIGHT_SAMPLE, MIN_SETUP_SAMPLE, SESSION_ANALYTICS_VERSION, SESSION_BUCKETS, ms(), secondsLike(), underscoreSecondsLike()

### Community 119 - "useTrades.editTrade.test.jsx"
Cohesion: 0.22
Nodes (6): APPLIED_PATCH, harness, LATER_TRADE, OLD_TRADE, RECENT_TRADE, USER

### Community 121 - "AnalyticsPage.disciplineLock.test.jsx"
Cohesion: 0.47
Nodes (4): dayKeyAgo(), h, renderPage(), trade()

### Community 122 - "LogTradePage.discipline.test.jsx"
Cohesion: 0.40
Nodes (3): dayKeyAgo(), h, trade()

### Community 124 - "DashboardLayout.sidebarWiring.test.js"
Cohesion: 0.83
Nodes (3): declaredProps(), passedProps(), withoutComments()

## Knowledge Gaps
- **510 isolated node(s):** `Env`, `Variables`, `WEB_VITAL_NAMES`, `WEB_VITAL_RATINGS`, `GET` (+505 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `button.tsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `tradeUtils.js`, `SectionCard.jsx`, `app/AuthenticatedApp.jsx`, `LogTradePage.jsx`, `ManageSetupsDialog.jsx`, `SetupCombobox.jsx`, `FooterNav.jsx`, `HistoryPage.jsx`, `field.tsx`, `DataTable.jsx`, `sheet.tsx`, `DashboardRightSidebar.jsx`, `dropdown-menu.tsx`, `StatusSquare.jsx`, `DirectionCell.jsx`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `overrides`, `class-variance-authority`, `firebase-admin`, `firebase`, `@firecms/neat`, `@google-cloud/storage`, `hono`, `lucide-react`, `@radix-ui/react-slot`, `react-chartjs-2`, `react-dom`, `react-router-dom`, `resend`, `tailwind-merge`, `tw-animate-css`, `@vercel/analytics`, `@vercel/kv`, `@vercel/speed-insights`, `html2canvas`, `metaapi.cloud-sdk`, `@fontsource-variable/newsreader`, `@google-cloud/firestore`, `@google-cloud/recaptcha-enterprise`, `react`, `@fontsource-variable/geist`, `framer-motion`, `react-bootstrap-icons`, `clsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `dependencies`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `Env`, `Variables`, `WEB_VITAL_NAMES` to the rest of the system?**
  _510 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BrokerSync.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06428988895382817 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08405797101449275 - nodes in this community are weakly interconnected._