# Graph Report - xaujournal  (2026-08-16)

## Corpus Check
- 213 files · ~383,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1393 nodes · 2661 edges · 117 communities (76 shown, 41 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `886366ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[...route]].ts
- Login.jsx
- PricingPage.jsx
- AnalyticsPage.jsx
- cn
- devDependencies
- sidebar.tsx
- _security.ts
- sheet.tsx
- overrides
- BlogsPage.jsx
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
- _tradeService.ts
- dropdown-menu.tsx
- _middleware.ts
- MEDIUM
- LogTradePage.jsx
- BlogArticlePage.jsx
- createAppServices.js
- AuthenticatedRoutes.jsx
- MT4/MT5 Broker Login Sync Implementation
- _firebase.js
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
- DashboardRightSidebar.jsx
- .agents/skills/run-xaujournal/smoke.mjs
- .claude/skills/run-xaujournal/smoke.mjs
- FirebaseTradeRepository
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
- _auth.ts
- react-chartjs-2
- react-dom
- react-router-dom
- resend
- tailwind-merge
- tw-animate-css
- @vercel/analytics
- @vercel/kv
- @vercel/speed-insights
- _resilience.ts
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
- grant-admin.mjs
- SidebarMenuButton
- DataTable.test.jsx
- StatusSquare.jsx
- rules/graphify.md
- workflows/graphify.md
- C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out
- H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset
- clsx
- html2canvas
- H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox
- metaapi.cloud-sdk
- H-03 — Rate limiting keys on a client-suppliable header
- M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection
- badge.tsx
- @fontsource-variable/newsreader
- @google-cloud/firestore
- @google-cloud/recaptcha-enterprise
- react
- @fontsource-variable/geist
- framer-motion
- react-bootstrap-icons

## God Nodes (most connected - your core abstractions)
1. `cn()` - 194 edges
2. `Button()` - 25 edges
3. `useToast()` - 19 edges
4. `MT4/MT5 Broker Login Sync Implementation` - 19 edges
5. `overrides` - 18 edges
6. `compilerOptions` - 18 edges
7. `tradeAnalyticsDelta()` - 15 edges
8. `formatSigned()` - 14 edges
9. `scripts` - 13 edges
10. `useAppServices()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-performance-data.mjs → api/_firebase.js
- `handleCloseTradeSync()` --calls--> `subtractTradeAnalytics()`  [EXTRACTED]
  api/_tradeService.ts → src/lib/tradeAnalytics.js
- `main()` --calls--> `initAdmin()`  [EXTRACTED]
  scripts/migrate-broker-credential-privacy.mjs → api/_firebase.js
- `DetailField()` --calls--> `cn()`  [EXTRACTED]
  src/pages/HistoryPage.jsx → src/lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (117 total, 41 thin omitted)

### Community 0 - "[[...route]].ts"
Cohesion: 0.14
Nodes (21): resend, withAccountLock(), consolidateBrokerConnect(), DELETE, Env, GET, handleBrokerAdd(), handleBrokerSyncPoller() (+13 more)

### Community 1 - "Login.jsx"
Cohesion: 0.19
Nodes (10): useSessionBrokerAccounts(), Login, EASetup(), handleConnect(), handleManualSync(), handleRemove(), resolveDefaultServer(), getFriendlyErrorMessage() (+2 more)

### Community 2 - "PricingPage.jsx"
Cohesion: 0.07
Nodes (35): AuthenticatedOverlays(), AppDialog(), SIZE_CLASS, VETO_REASONS, ConsentModal(), OnboardingModal(), PricingModal(), FEATURE_COPY (+27 more)

### Community 3 - "AnalyticsPage.jsx"
Cohesion: 0.06
Nodes (56): persistBrokerTrades(), baseTrade, chunkedDbGetAll(), apply, args, main(), maxUsers, migrateAnalytics() (+48 more)

### Community 4 - "cn"
Cohesion: 0.07
Nodes (42): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+34 more)

### Community 5 - "devDependencies"
Cohesion: 0.04
Nodes (47): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies (+39 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.13
Nodes (16): SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarGroupContent(), SidebarInput(), SidebarMenuAction(), SidebarMenuBadge(), SidebarMenuSkeleton() (+8 more)

### Community 7 - "_security.ts"
Cohesion: 0.19
Nodes (11): assertRequiredConfig(), isRecaptchaConfigured(), isValidAccountId(), isValidUid(), RecaptchaResult, RECOMMENDED_ENV, REQUIRED_ENV, SyncPayload (+3 more)

### Community 8 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 9 - "overrides"
Cohesion: 0.05
Nodes (37): author, description, name, overrides, axios, braces, cross-spawn, crypto-js (+29 more)

### Community 10 - "BlogsPage.jsx"
Cohesion: 0.17
Nodes (14): BlogsPage, PublicFooter(), NAV_LINKS, PublicNavbar(), Arrow(), CTAButton(), CTALink(), Panel() (+6 more)

### Community 11 - "LandingPage.jsx"
Cohesion: 0.06
Nodes (37): bestHour(), DEMO_SESSIONS, DEMO_TRADES, equityCurve(), formatR(), formatR2(), hourWindow(), pad2() (+29 more)

### Community 12 - "AppRoutes.jsx"
Cohesion: 0.09
Nodes (17): AppRoutes(), AuthenticatedApp, BlogArticlePage, ContactPage, LandingPage, NotFoundPage, PricingPage, PrivacyPolicyPage (+9 more)

### Community 13 - "HistoryPage.jsx"
Cohesion: 0.11
Nodes (25): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia() (+17 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ESNext, src, compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs (+15 more)

### Community 15 - "seo.js"
Cohesion: 0.09
Nodes (30): PageSEO(), useDeskReveal(), PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, applyArticleSEO(), applyHeadTags(), applyPageSEO(), buildArticleSchema() (+22 more)

### Community 16 - "AppServicesContext.jsx"
Cohesion: 0.13
Nodes (27): AppServicesContext, AppServicesProvider(), useAppServices(), AuthenticatedSessionProvider(), BrokerAccountsContext, WalletContext, createAppServices(), toIsoString() (+19 more)

### Community 17 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 18 - "FooterNav.jsx"
Cohesion: 0.13
Nodes (28): listCities(), normalizeSession(), RAIL_FILL, segmentState(), SessionGlyph(), SessionRail(), SATURDAY_1200_UTC, TUESDAY_0800_UTC (+20 more)

### Community 20 - "EASetup.jsx"
Cohesion: 0.18
Nodes (8): BROKER_CARD_STYLES, BROKER_CATALOG_FILTERS, BROKER_PRESETS, BrokerLogo(), BROKERS, getBrokerLogoUrl(), LOCAL_BROKER_LOGO_FILES, POPULAR_BROKER_IDS

### Community 21 - "DataTable.jsx"
Cohesion: 0.23
Nodes (12): DataTable(), hideClass(), isEnd(), Skeleton(), Table(), TableBody(), TableCaption(), TableCell() (+4 more)

### Community 22 - "FirebaseBrokerRepository.js"
Cohesion: 0.30
Nodes (5): FirebaseBrokerRepository, callBrokerApi(), connectBrokerCallable(), disconnectBrokerCallable(), syncBrokerTradesCallable()

### Community 23 - "_tradeService.ts"
Cohesion: 0.42
Nodes (8): isSyncAllowed(), now(), handleTradeWebhook(), hashToken(), analyticsIncrements(), handleCloseTradeSync(), handleOpenTradeSync(), resolveKey()

### Community 24 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 25 - "_middleware.ts"
Cohesion: 0.28
Nodes (7): getClientIp(), allowedOrigins, corsMiddleware(), DEFAULT_SCOPE, RATE_LIMIT_SCOPES, rateLimitMiddleware(), secureHeadersMiddleware

### Community 26 - "MEDIUM"
Cohesion: 0.12
Nodes (16): Fix, Fix, Fix, Fix, Fix, Fix, Fix, M-01 — CSP permits `'unsafe-inline'` and `'unsafe-eval'` (+8 more)

### Community 27 - "LogTradePage.jsx"
Cohesion: 0.21
Nodes (11): LiveMarketWidget(), TIMEFRAME_UPDATE_MS, TIMEFRAMES, YAHOO_INTERVALS, ThemeContext, ThemeProvider(), useAppTheme(), FALLBACK_TOKEN() (+3 more)

### Community 28 - "BlogArticlePage.jsx"
Cohesion: 0.21
Nodes (10): TextLink(), articles, articles, getArticle(), studyArticles, studyCategories, articles, removeJsonLd() (+2 more)

### Community 29 - "createAppServices.js"
Cohesion: 0.22
Nodes (3): TradeEntity, LogTradeUseCase, ResetTradesUseCase

### Community 30 - "AuthenticatedRoutes.jsx"
Cohesion: 0.15
Nodes (10): AnalyticsPage, AuthenticatedRoutes(), CalendarPage, CheckoutCancel, CheckoutSuccess, EASetup, HistoryPage, JournalPage (+2 more)

### Community 31 - "MT4/MT5 Broker Login Sync Implementation"
Cohesion: 0.04
Nodes (45): 1. **Broker Service** (`api/_metaapi-broker.js`), 1. **MT5SyncSetup** (`src/components/MT5SyncSetup.jsx`), 2. **API Endpoint** (`api/broker-login-sync.js`), 2. **BrokerLoginSync** (`src/components/BrokerLoginSync.jsx`), 3. **Cron Job** (`api/cron/broker-sync-poller.js`), 3. **useBrokerAccounts Hook** (`src/hooks/useBrokerAccounts.js`), Add Broker Account, API Authentication (+37 more)

### Community 32 - "_firebase.js"
Cohesion: 0.46
Nodes (4): db, isDbReady(), app, mockKvStore

### Community 33 - "compilerOptions"
Cohesion: 0.17
Nodes (11): vite.config.js, compilerOptions, allowJs, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit (+3 more)

### Community 35 - "firebase.js"
Cohesion: 0.31
Nodes (7): signOutAndClearCache(), storage, app, auth, facebookProvider, firebaseConfig, googleProvider

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
Cohesion: 0.10
Nodes (22): ImageViewerModal(), CONFIDENCE_SCALE, CONFLUENCE, GRADES, MOODS, SESSION_OPTIONS, STRATEGY_OPTIONS, STRUCTURES (+14 more)

### Community 55 - "dependencies"
Cohesion: 0.22
Nodes (9): @base-ui/react, chart.js, dotenv, firebase-functions, dependencies, @base-ui/react, chart.js, dotenv (+1 more)

### Community 58 - "_metaapi-broker.js"
Cohesion: 0.26
Nodes (14): combineEntryDeals(), deleteMetaApiAccount(), fetchBrokerTrades(), fetchMetaApiDeals(), finiteNumber(), getApi(), isBuyDeal(), isTradeDeal() (+6 more)

### Community 59 - "App.jsx"
Cohesion: 0.08
Nodes (25): App(), AuthSyncFailure(), ScrollProgress(), clearUxState(), shouldSkip(), useRouteExperience(), AppProviders(), isPublicNavbarPath() (+17 more)

### Community 60 - "Production Operations & Maintenance Guide — xaujournal"
Cohesion: 0.11
Nodes (18): 1. Secrets Management & Rotation Plan, 2. Production Monitoring & Logging Setup, 3. Reliability & Downtime Mitigation, 4. Scaling Optimization, 5. Emergency Manual Deployments, A. Firebase Admin SDK / Service Account Rotation, 🔔 Alerting Thresholds, B. MetaApi Cloud Token Rotation (+10 more)

### Community 65 - "XAU Journal × MetaApi — Architecture"
Cohesion: 0.17
Nodes (11): Backend (Firebase Cloud Functions), Code map, Deploy checklist, Environment variables, Firestore schema, Overview, Security rule, UI flow (Sync page) (+3 more)

### Community 66 - "_auth.ts"
Cohesion: 0.48
Nodes (4): assertEmailVerified(), getUidFromContext(), isEmailVerificationEnforced(), verifyIdToken()

### Community 83 - "_resilience.ts"
Cohesion: 0.40
Nodes (5): AccountLockResult, cachedJson(), inflight, sleep(), withRetryBudget()

### Community 84 - "HIGH"
Cohesion: 0.18
Nodes (11): Attack scenario, Attack scenario, Fix, Fix, Fix, Fix, H-02 — Cloud Functions expose the broker path with no subscription check and no rate limit, H-05 — Unauthenticated reCAPTCHA proxy burns billable assessment quota (+3 more)

### Community 85 - "toast.tsx"
Cohesion: 0.15
Nodes (7): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), ToastTitle(), ToastViewport()

### Community 86 - "migrate-broker-credential-privacy.mjs"
Cohesion: 0.36
Nodes (9): initAdmin(), ACCOUNT_CREDENTIAL_FIELDS, apply, deletionPatch(), main(), ownsAny(), scrubBrokerAccounts(), scrubUsers() (+1 more)

### Community 87 - "app/AuthenticatedApp.jsx"
Cohesion: 0.21
Nodes (11): AuthenticatedApp(), AuthenticatedAppContent(), PUBLIC_LEGAL_PATHS, useSessionWallet(), DashboardLayout(), ToastContext, useToast(), VerifyEmailBanner() (+3 more)

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

### Community 95 - "grant-admin.mjs"
Cohesion: 0.33
Nodes (4): args, list, revoke, uid

### Community 96 - "SidebarMenuButton"
Cohesion: 0.33
Nodes (6): Sidebar(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 97 - "DataTable.test.jsx"
Cohesion: 0.40
Nodes (3): baseProps, columns, rows

### Community 101 - "C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out"
Cohesion: 0.50
Nodes (4): Attack scenarios, C-01 — Broker MT4/MT5 passwords stored in plaintext `localStorage`, never cleared at sign-out, CRITICAL, Fix

### Community 102 - "H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-01 — Cron routes authenticate successfully against `"Bearer undefined"` when `CRON_SECRET` is unset

### Community 105 - "H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox"
Cohesion: 0.67
Nodes (3): Attack scenarios, Fix, H-04 — Unauthenticated `/api/contact` writes to Firestore, sends email, and injects raw HTML into the ops inbox

### Community 107 - "H-03 — Rate limiting keys on a client-suppliable header"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, H-03 — Rate limiting keys on a client-suppliable header

### Community 108 - "M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection"
Cohesion: 0.67
Nodes (3): Attack scenario, Fix, M-03 — Lemon Squeezy webhook: non-constant-time signature check, no replay protection

## Knowledge Gaps
- **440 isolated node(s):** `Env`, `Variables`, `WEB_VITAL_NAMES`, `WEB_VITAL_RATINGS`, `GET` (+435 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `SidebarMenuButton`, `PricingPage.jsx`, `StatusSquare.jsx`, `AnalyticsPage.jsx`, `EmptyState.jsx`, `DashboardLayout.jsx`, `sidebar.tsx`, `sheet.tsx`, `SectionCard.jsx`, `HistoryPage.jsx`, `badge.tsx`, `FooterNav.jsx`, `DashboardRightSidebar.jsx`, `DataTable.jsx`, `toast.tsx`, `app/AuthenticatedApp.jsx`, `dropdown-menu.tsx`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `auth` connect `firebase.js` to `PricingPage.jsx`, `AnalyticsPage.jsx`, `HistoryPage.jsx`, `DashboardRightSidebar.jsx`, `EASetup.jsx`, `FirebaseBrokerRepository.js`, `App.jsx`, `createAppServices.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Button()` connect `PricingPage.jsx` to `AnalyticsPage.jsx`, `cn`, `DashboardLayout.jsx`, `sidebar.tsx`, `sheet.tsx`, `HistoryPage.jsx`, `DashboardRightSidebar.jsx`, `DataTable.jsx`, `toast.tsx`, `LogTradePage.jsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `Env`, `Variables`, `WEB_VITAL_NAMES` to the rest of the system?**
  _440 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[[...route]].ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._
- **Should `PricingPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Should `AnalyticsPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05777345017851347 - nodes in this community are weakly interconnected._