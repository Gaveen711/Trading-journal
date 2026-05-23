# TODO — Remove Stripe-related remnants & ensure PayPal-only billing

## Step 1 — Inventory
- [x] Search repo for `stripe` identifiers in JS/JSX/TS/TSX.
- [x] Read payment integration files in `api/` (checkout/capture/_paypal).
- [x] Read `package.json` + `functions/package.json`.
- [x] Read `functions/SECRETS.md` and `README.md`.
- [x] Search docs/config files (`*.md`) for Stripe mentions.

## Step 2 — Planned changes (pending confirmation)
- [x] Update `MAINTENANCE.md` to remove references to `STRIPE_*` env vars (since project is PayPal-only).

- [ ] Ensure any other docs mention Stripe; update to PayPal-only.

## Step 3 — Test
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.

