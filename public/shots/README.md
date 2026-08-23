# Product screenshots (marketing)

Generated — do not hand-edit. With the dev server already running on :5173
(`npm run dev`; or set `BASE_URL`), regenerate with:

    npm run shots

That script (`scripts/capture-shots.mjs`) drives headless Chrome (Edge as a
fallback) over the DevTools protocol — no puppeteer download — and opens the
dev-only showcase: the real dashboard pages mounted on in-memory repositories
seeded with the dataset in `src/showcase/demoData.js`, which is the public
site's sample record (`src/lib/deskDemo.js`) expanded into full trades. The
showcase lives on the normal `/app/*` routes so the sidebar, theme and route
behaviour are exactly the product's; a tab opts in with `/app?showcase=1` (the
script sets the same `xau-showcase` session flag itself). Production builds
contain none of it.

| file            | route           | what it shows                          |
|-----------------|-----------------|----------------------------------------|
| dashboard.webp  | /app            | Log-trade desk (index route)           |
| analytics.webp  | /app/analytics  | Session / setup analytics              |
| calendar.webp   | /app/calendar   | P&L calendar                           |
| history.webp    | /app/history    | Trade history table                    |
| journal.webp    | /app/journal    | Daily journal                          |
| sync.webp       | /app/sync       | MT4/MT5 broker sync                    |

Every image is 2880×1800 (rendered at 1440×900, device scale 2), dark theme
with the "Royal gold" accent, lossy WebP, target ≤ 220 KB. The `<Shot name="…" />`
primitive in `src/components/PublicSite.jsx` resolves `/shots/{name}.webp` and
declares the 1440×900 box so the layout never shifts while the image loads.

The capture clock is pinned to Friday 2026-08-21 15:45 UTC (London and New
York both open), so five of the six frames are stable run to run. The
dashboard is the exception by design: its market strip embeds a live
TradingView chart, and the spot quote beside it is left live to match.
