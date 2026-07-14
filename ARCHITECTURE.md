# XAU Journal Architecture

## Product map

XAU Journal is a trading journal and analytics terminal. Public routes explain the product and pricing. Authenticated routes let a trader log and review trades, maintain a journal, inspect analytics, manage wallet goals, and connect a broker for automated synchronization.

## Dependency rule

Dependencies point inward:

1. `src/core/domain` contains business entities and repository contracts.
2. `src/core/usecases` contains application operations such as logging and resetting trades.
3. `src/data/repositories` implements domain contracts with Firebase and HTTP APIs.
4. `src/app/di` is the composition root that selects concrete adapters.
5. `src/hooks`, `src/features`, `src/pages`, and `src/components` are delivery code. They consume injected services and must not construct infrastructure adapters.

## Frontend structure

```text
src/
|-- app/
|   |-- components/       # Application-wide recovery and overlay policy
|   |-- di/               # Composition root and dependency provider
|   |-- experience/       # Cross-cutting route UX and telemetry
|   |-- providers/        # Root provider composition
|   `-- routing/          # Public and authenticated URL policy
|-- core/
|   |-- domain/           # Entities and repository abstractions
|   `-- usecases/         # Framework-independent application operations
|-- data/repositories/    # Firebase/API infrastructure adapters
|-- features/             # Feature-owned state and workflows
|-- hooks/                # React adapters over application services
|-- pages/                # Route-level presentation
|-- components/           # Reusable presentation and layouts
|-- lib/                  # Pure calculations and technical utilities
`-- services/             # Legacy application services being migrated inward
```

## Backend structure

```text
api/        # Active Vercel-style serverless routes used by the frontend
functions/  # Firebase Cloud Functions backend, kept for optional/legacy broker sync
```

The app currently calls `/api/...` routes from the frontend. Keep `functions/` until production deployment is audited, because Firebase still declares it as a deployable Cloud Functions source and the broker-sync docs reference it. Treat it as an optional broker backend, not as random unused code.

Broker credentials are client-managed by policy. The browser may keep broker login/password in per-user localStorage for explicit user-initiated sync, but Firestore and serverless routes must not persist broker passwords, broker logins, credential-derived identifiers, or provider account tokens. Credentials travel to the sync route over HTTPS/TLS, exist only for the request, and are used with a temporary provider account that is removed in a finally cleanup. Only normalized trade records and non-sensitive account metadata are persisted. Scheduled server-side sync is intentionally disabled for client-managed accounts because it would require retained credentials or a retained provider token.

Before deploying this policy to an existing environment, run npm run migrate:broker-privacy to audit legacy fields, then run npm run migrate:broker-privacy:apply with Firebase Admin credentials to remove them. The migration logs counts only and never prints credential values.

## Extension rules

- Add business rules to domain entities or use cases, never to page components.
- Add external persistence behind a repository contract and register it in `createAppServices`.
- Add a new URL in the appropriate routing module; lazy-load route-level code.
- Keep feature state under `features/<feature>` and reusable visuals under `components`.
- Comments explain architectural intent, security boundaries, or non-obvious behavior—not syntax.

## Safe migration path

Split large pages feature-by-feature: extract pure calculations, then workflow hooks, then visual sections. Keep routes and component props stable during each migration so behavior can be verified incrementally.
