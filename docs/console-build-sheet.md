# Console build sheet — wrapper layer (`src/components/app/`)

Single source of truth for Phase 1–3 of the dashboard rebuild. Merges `wrappers.spec` + `wrappers.critique` + `visual.spec` + `visual.critique`; where the critiques contradicted the specs, the critiques won; where either conflicted with the locked constraints (Console direction, five accents, token/radius/type decisions already applied), the constraints won. Every file:line below was re-verified against the working tree on 2026-08-08, **after** the 21 base-nova primitives landed in `src/components/ui/`.

**Ground truth at time of writing** (do not trust the older specs on these):

- `--radius: 0.25rem` is declared once, at `src/index.css:26`. The ten theme blocks no longer set it. `src/index.css:2104` (`999px`) and `:2374` (`12px !important`) are public-site `.btn-contact-send` scope — never touch.
- `tailwind.config.js:60-67` — collapsed scale: `rounded-sm`=2px, `rounded-md`/`lg`=`var(--radius)`=4px, `rounded-xl`/`2xl`/`3xl`=6px.
- `tailwind.config.js:49-55` — `font-sans` = Roboto-led, `font-mono` = IBM Plex Mono (loaded 400/500/600). No Inter, no Geist, no Roboto Mono anywhere in /app code.
- `.figure` exists at `src/index.css:453-457`: `font-mono tabular-nums` + `"tnum" 1` + `-0.01em`. All prices/P&L/figures use it.
- `--chart-1..5` (`src/index.css:307-318`): chart-1 tracks the accent `--primary`, chart-2..5 are a neutral value ramp (remapped for dark). `--sidebar-*` aliases exist (`:298+`).
- `useRouteExperience` is already gated off /app (`src/app/experience/useRouteExperience.js:29`), and ScrollProgress already returns null on /app. The reveal/lift/glow layer is a public-site concern; do not code around it in wrappers.
- The global focus rule (`src/index.css:3380-3383`) is `outline: 2px solid hsl(var(--ring)/0.88) !important; outline-offset: 3px !important` — it owns focus appearance. Wrappers add no competing focus styling.
- ESLint now lints `.ts/.tsx` too (`eslint.config.js:44-60`) with the same React Compiler posture. Wrappers are still `.jsx` in `src/components/app/` (the tree they serve is 100% .jsx and the trade domain model is untyped).
- Test env verified: `vite.config.js:24-27` (`globals: true`, `setupFiles: ./src/test/setup.js`), Testing Library + user-event + jest-dom installed, example at `src/components/ui/__tests__/button.test.jsx`. Component tests start with `// @vitest-environment jsdom`.

---

## 0. Prerequisites — land these before the first wrapper

### 0.1 Fix `--win` / `--loss` (still the old, failing values)

Verified NOT yet applied. `src/index.css:31-32` (light) and `:58-59` (dark) still carry `--win: 142.1 70.6% 45.3%` — ≈2.28:1 on white, unreadable. Replace with the critique-verified values:

```css
/* :root (light), index.css:31-32 */
--win:  142 72% 29%;   /* ≈5.1:1 on white */
--loss:   0 72% 42%;   /* ≈6.5:1 on white */

/* .dark, index.css:58-59 */
--win:  142 71% 45%;   /* ≈7.7:1 on near-black */
--loss: 350 85% 62%;   /* ≈5.0:1 on royal-gold dark card */
```

Do **not** add `--attn`. The attention state is carried by form alone (§1.4) — an amber token collides with `--primary` in royal-gold/crimson-rust and with the brand `#EDAE49`. Zero hue budget for attention.

### 0.2 Scope the heading rules

`src/index.css:~605-632` still forces Poppins + `font-size: 36px/28px !important` on all `h1`/`h2` globally. Any wrapper that emits a real heading (SectionCard does, for a11y) loses to it. Add **after** that block (do not edit the block itself — the public site depends on it):

```css
.dashboard-shell :is(h1, h2, h3, h4, h5, h6) {
  font-family: 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  line-height: inherit !important;
  letter-spacing: inherit !important;
}
```

`.dashboard-shell` exists at `src/styles/auth.css:340` and wraps every /app route. (`.app-shell` and `.public-aurora-page` do not exist — never reference them.)

### 0.3 Sanctioned primitive edits — the complete list

The registry files in `src/components/ui/` are otherwise never hand-edited. These five edits are the only exceptions; everything else is done with `className` at the wrapper layer.

| File | Edit | Why |
|---|---|---|
| `card.tsx:15` | `ring-1 ring-foreground/10` → `border border-border` | One border law (§1.1). Ring-on-card is the double-line effect the rebuild removes. |
| `button.tsx:7` | delete `active:not-aria-[haspopup]:translate-y-px` | No press transforms (§1.5). |
| `dialog.tsx` (DialogOverlay, line 32) | `bg-black/10 … supports-backdrop-filter:backdrop-blur-xs` → `bg-background/80` (keep the fade classes) | backdrop-blur is banned on /app; flat scrim. |
| `dialog.tsx` (DialogContent) | add `overlayClassName?: string` prop, forwarded to the internal `<DialogOverlay className={overlayClassName} />`; delete `data-open:zoom-in-95 data-closed:zoom-out-95` from the Popup class | DialogContent renders its own overlay with no pass-through — the z-ladder (§ per-wrapper) is unreachable without this. Overlay/dialog motion is opacity-only. |
| `alert-dialog.tsx` | same three changes (overlay bg at line 33, `overlayClassName` on AlertDialogContent, zoom classes off the Popup at line 55) | Same reasons. |

Note: the primitives' `animate-in`/`fade-in-0` classes resolve against the hand-rolled clone still at `src/index.css:2969+`. It dies in Phase 5; if dialogs then open without a fade, that is acceptable console behavior — do not re-add a library for it.

---

## 1. Visual language — the Console, for a gold terminal

### 1.1 Surfaces

Three levels. There is no fourth.

| Level | Token | Border | Shadow | Used for |
|---|---|---|---|---|
| L0 ground | `bg-background` | none | none | page canvas, sidebar, space between panels |
| L1 panel | `bg-card` | `border border-border` (full opacity, 1px) | none | Card (post-edit), table containers, widgets |
| L2 inset | `bg-muted` | **none** | none | wells inside an L1: `<thead>`, segmented track, input fill, dialog footer band, empty wells |

- **Overlays are not a surface level.** Portaled things (dialog, popover, dropdown, toast) use `bg-popover` + `border-border`; they are the only elements allowed a shadow, and only the stock one their primitive ships (dialog: none — its border does the work; toast: `shadow-lg`). No in-page element ever has a `box-shadow`.
- **One border treatment.** `border-border` at 1px, full opacity. No `/10 /20 /35 /50` fractions, no per-edge tints, no inset highlights, no `ring` stacked on a border, no second `0 0 0 1px` ring. Division inside a panel is `border-b`/`border-r` on the child, same color.
- **The default section is not a card.** SectionCard renders a *ruled section* (top hairline + title row) on L0 by default; `surface` is an opt-in for the few places a contained panel carries meaning (§2.1). A console is one surface divided by rules, not a field of floating tiles — this is what prevents the 25 `apple-glass-panel` + 29 `card-premium` uses from becoming 54 shadcn tiles.
- **Panel hover:** a non-clickable panel does not react to the pointer. A clickable row/link changes `background-color` to `hsl(var(--muted))` and nothing else.
- Banned outright (both critiques + constraints): `backdrop-blur`/`backdrop-filter` in any form, blurred glow divs, gradient washes on surfaces (the one gradient in /app is the equity-chart area fill), double borders/fake bevels, `will-change` on surfaces, hover lift/scale/glow.

### 1.2 Type roles

Two families: **Roboto for sentences, IBM Plex Mono for anything measured.** The rule a reader infers in five seconds: *if it is monospaced, it is a measurement.* Weights 400/500/600 only — Plex Mono has no loaded 700; requesting it synthesizes bold and breaks digit alignment.

| Role | Classes | Notes |
|---|---|---|
| Page title | `font-mono font-medium text-xl tracking-tight text-foreground` | The one typographic position /app owns: the page's own name set in the same instrument face as its numbers. Roboto never sets a title. |
| Section title | `text-sm font-medium text-foreground` | SectionCard header. Sentence case. |
| Label | `text-xs font-medium text-muted-foreground` | THE label idiom. Sentence case, no tracking, no uppercase. Replaces all 55+ `text-[10px] font-black uppercase tracking-widest` sites and their 211-strong family. |
| Body | `text-sm text-foreground` | |
| Help / secondary | `text-xs text-muted-foreground` | |
| Figure — hero | `figure text-2xl font-medium leading-none tracking-tight` | KPI values. Plus tone (§1.4). |
| Figure — mid | `figure text-lg font-medium` | Panel readouts, sub-metrics. |
| Figure — cell | `figure` inside DataTable (table base is `text-xs`) | Right-aligned via `numeric` columns. |
| Micro | `font-mono text-[11px]` | Units, timestamps, session codes, chips, StatusSquare labels. The **only** sanctioned arbitrary size. |

- **Uppercase survives in exactly three places, where case is data, not style:** instrument symbols (`XAU/USD`), direction (`BUY`/`SELL`), session codes (`SYD TYO LDN NYC`). All at micro/mono. Nothing else on /app is uppercase; `tracking-widest`/`tracking-[0.2em]` appear nowhere in new code.
- **Signed figures.** P&L always renders its sign, including `+`. Use U+2212 MINUS (`−`), not the hyphen — same advance width as `+` in Plex Mono. Add `formatSigned(val)` in `src/lib/tradeUtils.js` beside `formatCurrency` (:17-33) and delete the hand-rolled `{v >= 0 ? '+' : ''}` prefixes (LogTradePage.jsx:373, 411, 641 and equivalents). Zero renders `0.00` unsigned. Missing data renders `—` (U+2014) in `text-muted-foreground` — never `-`, never `N/A`, never `0`.

### 1.3 Spacing and density

4px base. Layout uses `gap-1/2/3/4/6` and `p-3/p-4` — `gap-5`, `gap-7`, `p-5`, `p-6`, `p-7` do not appear in new /app code (one exception: page-level empty states may use `py-10`).

| Element | Value |
|---|---|
| Table header row | 28px — `<th>` `h-7 px-3`, sticky, `bg-muted` (L2) |
| **Table row, desktop** | **32px** — `<td>` `h-8 px-3 py-0 align-middle` |
| Table row, < 768px | 44px — `h-11 md:h-8` (32px is a scan target for a mouse, not a tap target for a thumb; this app has a mobile bottom nav) |
| Panel header | 40px — `h-10 px-4`, `border-b border-border` when divided |
| Panel body padding | 16px (`p-4`; the Card `--card-spacing` default) |
| Grid gap inside a card group | 12px (`gap-3`) |
| Gap between page sections | 16px (`gap-4`) |
| Controls | base-nova shipped heights stand: button default `h-8`, `sm` `h-7`, `xs` `h-6`; inputs `h-8`. Use `size="sm"` inside panel headers. Do not re-litigate heights per call site. |
| Chip | 18px — `h-[18px] px-1.5` (§1.4 recipe) |

Density is not a prop. There is no "comfortable" mode anywhere — density was the deliverable. The rows-on-one-screen argument belongs to **HistoryPage** (the long list — LogTradePage's table is hard-capped at `trades.slice(0, 10)`, LogTradePage.jsx:612): at 32px/row a 900px viewport shows ~21 trades vs ~14 at shadcn defaults, and scanning a week of London entries without scrolling is the point of the product.

### 1.4 State encoding

Every state rides two channels: **form first, color as reinforcement.** Color alone fails ~8% of male users and fails again when the accent hue changes five ways.

| State | Form | Color |
|---|---|---|
| **P&L (win/loss)** | always-present sign, right-aligned `.figure` | `text-win` / `text-loss` on the digits. **No fills, no pills, no chips** for P&L. A loss is not an error: never `--destructive`, never an icon. |
| **Direction (BUY/SELL)** | `▲`/`▼` caret (aria-hidden) + the word, 11px mono uppercase | `text-muted-foreground` for **both**. Direction is an intention, not a result — coloring it green/red two columns from a green/red P&L is the single most confusing thing in the current table (LogTradePage.jsx:620-621). No chip. |
| **Market open / sync status** | `StatusSquare` (§2.6): 6px **square** (a circle collides with the avatar), filled = live/nominal, hollow = closed/idle, filled-in-ring = needs attention. Always followed by a word: `Open`, `Closed · opens 22:00 UTC`, `Synced 14:22`, `Syncing…` (static text, no spinner), `Last sync 18m ago`, `Disconnected` | none — `--foreground`/`--muted-foreground` only. Identical across all five accents. |
| **Needs attention** | the ringed StatusSquare, and/or `bg-muted` on the affected row/panel + the square in its header. **No 2px accent stripe** (the accent-bar-on-card is the most recognizable AI-dashboard tell), no amber. | none |
| **Plan tier** | text in a rectangle: chip recipe below. Free = `border-border text-muted-foreground`, label `Free`. Pro = `border-foreground text-foreground`, label `Pro`. Expiring < 72h = Pro chip + attn square + remaining time in micro. No crown, no gradient, no `--primary` fill. | none |
| **Session** | the session rail / glyph (§1.6, §2.7) | none — `--foreground`/`--border` only |
| **Interactive affordance** | — | `--primary` owns it exclusively: primary button fill, focus ring, active nav, selected-tab underline, the user's own equity series. **`--primary` never colors a number, a status, or a decoration.** |
| **Destructive intent** | tinted surface + text (the shipped `Button variant="destructive"`: `bg-destructive/10 text-destructive`) inside the alert-dialog recipe (§2.3) | never a solid fill, never used for losses |

**Chip recipe** (replaces `ui/Badge` for all dashboard chips — Badge is `rounded-4xl`, a pill that fights a 2–6px radius system; it stays unused in /app):

```jsx
<span className="inline-flex h-[18px] items-center rounded-sm border border-border px-1.5 font-mono text-[11px] leading-none text-muted-foreground">
```

Variants: plan-Pro swaps to `border-foreground text-foreground`. Strategy / session / confluence / counter chips all use the base recipe. Direction gets **no chip** (caret + word). While migrating chips, kill the hardcoded colors: `text-[#E5B80B]` HistoryPage.jsx:652, `bg-[#EDAE49] text-[#003D5B]` HistoryPage.jsx:427-439, the purple shadows AnalyticsPage.jsx:32/:548, ConsentModal.jsx:13.

**Charts** (Phase 4 preview, so wrappers don't fight it): equity series `hsl(var(--chart-1))` (tracks `--primary`) at 1.5px, `tension: 0` (an equity curve is a step function), area fill `--chart-1/0.12 → 0` — the only gradient on /app; horizontal grid `--border` only; tooltip `bg-popover border-border`; P&L distribution bars `--win`/`--loss`; additional series use the `--chart-2..5` neutral ramp. **Session bands** on the x-axis: `hsl(var(--border)/0.4)` fills behind the series for each session window (same `goldSessions.js` windows as the rail) — this ties the signature mark to the main chart and replaces the deleted rainbow bias gauge's visual weight.

### 1.5 Motion

One duration (100ms — the primitives' `duration-100`; do not add a token for a 20ms preference), linear/default easing. Four things animate:

1. Control hover/press — `background-color`, `border-color`, `color` only.
2. Overlay enter/exit — **opacity only** (zoom removed by §0.3).
3. Live value change — `bg-foreground/[0.06]` flash, 120ms in / 400ms out. The one *added* motion, because it resolves "is this number final" instead of creating it.
4. Collapsible open/close — height.

Everything else is static. No page/section enter animations, no `animate-pulse` on status (a pulsing dot is an unresolved question; a filled square is an answer — all 14 uses die), no transforms on hover/press, no indeterminate spinners ("Syncing…" is text), no spring easings, no Lenis (`DashboardLayout.jsx:116-136` — remove in Phase 2; the only other reference is the inert `data-lenis-prevent` at `ui/CustomSelect.jsx:79`). **Exception:** `Skeleton`'s `animate-pulse` is permitted as the loading affordance only — it may never sit on live data.

Reduced motion: extend the existing block at `src/styles/auth.css:412-418` to cover `.dashboard-shell *, ::before, ::after` (do not add a second competing block). The value flash is suppressed entirely under reduced motion.

### 1.6 The signature move — the session rail

A four-segment horizontal mark for the gold trading day in UTC order — Sydney, Tokyo, London, New York — at three scales: a 3px **page rail** under every /app page title, a 14×6px **row glyph** in the trades table's session column, a 14×4px **calendar cell glyph**. Segment fills: live `bg-foreground`, closed-today `bg-border`, still-ahead `bg-border/40`. No hue, ever — it can never be confused with P&L, primary, or attention, and it survives all ten theme blocks with zero per-theme work. Overlaps (Tokyo/London 07–09, London/NY 12–16) show two filled segments without special-casing — those overlaps are when gold actually moves.

**Provenance, stated honestly:** this is the app-side expression of a mark the marketing site already owns. One engine — `src/lib/goldSessions.js` — one meaning, two renderings: the site's is narrative, the app's is an instrument scale. **Never re-implement the math.** Import `GOLD_SESSIONS` (goldSessions.js:11), `isSessionOpen` (:25), `isMarketClosed` (:19). `isMarketClosed` handles the Fri 21:00 → Sun ~22:00 UTC weekend: when it is true the rail renders **no live segment** (otherwise it shows London open on a Saturday).

**Taxonomy boundary:** the rail is display-only. AnalyticsPage buckets sessions as London/NY/Asia/Overlap (AnalyticsPage.jsx:190-198) and the HistoryPage filter pills use the same buckets (HistoryPage.jsx:449-473) — analytics keeps its taxonomy; the rail never claims it. The row glyph must survive free-text session values (§2.7).

It replaces, rather than adds: the pulsing "Markets Open" badge (LogTradePage.jsx:329-335), the rainbow bias gauge (LogTradePage.jsx:465-516), and the session text pill column (~60px of table width).

---

## 2. Wrappers — `src/components/app/*.jsx`

Rules for all: `.jsx`; export components only (the `react-refresh/only-export-components` rule errors on mixed exports — if a variants object is needed, put it in a sibling `.js`); **no new `useCallback`/`useMemo`** (React Compiler lint); `React.useId` is fine; compose the verified `ui/` exports below by exact name; Base UI composition is `render={<... />}` (+ `nativeButton={false}` when rendering a non-button), never `asChild`.

**z-index ladder** (portals only; primitives ship `z-50`; override via wrapper className, never by editing the primitive):

| Layer | Class |
|---|---|
| popover / dropdown / tooltip / select | `z-[60]` |
| dialog & sheet backdrop | `z-[70]` (via `overlayClassName`, §0.3) |
| dialog & sheet popup | `z-[80]` |
| toast | `z-[90]` (future — ToastContext keeps its `z-[9999]` this phase) |

Build order: SectionCard + EmptyState + StatusSquare + SessionRail → StatCard → AppDialog (+ alert recipe) → DataTable. ToastContext is **not migrated this phase** — its `toast(msg, type, duration)` callable-context API and the `value={toast}` shape (ToastContext.jsx:34) stay exactly as-is; 48 call sites and `requireProFeature`'s bare-function parameter depend on it.

### 2.1 `SectionCard` — `src/components/app/SectionCard.jsx`

The replacement for every `apple-glass-panel` / `card-premium`. **Default is a ruled section, not a card.**

```jsx
/**
 * @param {React.ReactNode} props.title            REQUIRED. Sentence case.
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.actions]        Right-aligned header slot.
 * @param {React.ReactNode} [props.meta]           Small right-aligned figure (e.g. "15m", "21 rows"). font-mono text-[11px] text-muted-foreground.
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]         surface mode only -> CardFooter.
 * @param {boolean} [props.surface=false]          Opt-in L1 panel (Card). Default: ruled section on L0.
 * @param {boolean} [props.padded=true]            false = edge-to-edge children (tables, charts).
 * @param {boolean} [props.divided=true]           Hairline under the header.
 * @param {React.ElementType} [props.as='section']
 * @param {string}  [props.className]
 * @param {string}  [props.contentClassName]
 */
```

- **Default render** (no ui/ import): `<section aria-labelledby={id} className="border-t border-border pt-3">` → header row (`flex items-baseline justify-between gap-4 pb-3`): `<h2 id={id} className="text-sm font-medium text-foreground">` + meta + actions → children. No background, no radius, no enclosure.
- **`surface` render** composes `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` (all verified in `card.tsx`; post-§0.3 Card = `bg-card border border-border rounded-xl` = 6px). `divided` adds `border-b` to CardHeader — `card.tsx:28` already has the `[.border-b]:pb-(--card-spacing)` hook. `padded={false}` sets CardContent `className="px-0"`.
- No `icon` prop. Decorative panel glyphs are noise (both critiques).
- a11y: landmark `<section aria-labelledby>` with a generated `useId` — screen-reader region navigation, absent today. The `<h2>` depends on the §0.2 heading reset.
- z-index: none (no portal).

Call sites (Phase 3):

| Site | Mode | Notes |
|---|---|---|
| LogTradePage.jsx:579 history/orders panel | `surface`, `padded={false}` | holds the tabs + DataTable; `meta` takes the interval pill (~:459) |
| LogTradePage chart, bias, KPI-strip sections | default (ruled) | glow divs at :385/:403/:421/:439/:572 are deleted elements, not reclassed |
| HistoryPage.jsx filters block (~:410-475) + list container | default | the list itself becomes DataTable (§2.4) |
| DashboardRightSidebar widgets (LiveMarketWidget ×2, converter) | `surface` | contained panels carry meaning in the rail |
| SettingsPage.jsx:148/175/213/255/286/315/334 (7 `card-premium rounded-[2rem]` panels) | default | radius arbitraries die with the class |
| CalendarPage.jsx:471/558, AnalyticsPage sections, JournalPage list frame | default | |
| EASetup.jsx panels | `surface` for the credential forms, default elsewhere | |

**Does not fit:** DashboardLayout.jsx:625/:809 (mobile header/nav glass) — shell chrome, rebuilt in Phase 2 on the Sidebar primitives, not SectionCard. ImageViewerModal/ShareTradeModal glass shells — those are AppDialog surfaces (§2.3).

### 2.2 `StatCard` — `src/components/app/StatCard.jsx`

```jsx
/**
 * @param {string} props.label                     Sentence case: "Net P&L, month to date".
 * @param {React.ReactNode} props.value            PRE-FORMATTED by the page. StatCard never formats.
 * @param {React.ReactNode} [props.hint]           Secondary line. text-xs text-muted-foreground.
 * @param {{value: React.ReactNode, direction: 'up'|'down'|'flat'}} [props.delta]
 * @param {'neutral'|'positive'|'negative'} [props.tone='neutral']   foreground | text-win | text-loss.
 *        There is NO 'accent'. A figure is P&L or it is foreground — no third decorative tone.
 * @param {'stacked'|'inline'} [props.layout='stacked']
 * @param {React.ComponentType} [props.icon]       layout="inline" ONLY (EASetup). Stacked cards get no icon.
 * @param {boolean} [props.interactive=false]
 * @param {(revealed: boolean) => void} [props.onRevealChange]  hover/focus/click/Enter/Space. Page owns revealed state.
 * @param {boolean} [props.locked=false]
 * @param {() => void} [props.onLockedActivate]
 * @param {string} [props.lockLabel='Unlock with Pro']
 * @param {boolean} [props.loading=false]
 * @param {string} [props.className]
 */
```

- Composes: `Card`, `CardContent` (verified), `Skeleton` for `loading`. No Badge, no icon chip, no glow div, no tinted `w-9 h-9 rounded-full` medallion.
- Value row, exactly (critique-corrected — no arrow-in-badge KPI chip; the delta is a signed figure on the same baseline):

```jsx
<div className="flex items-baseline gap-2">
  <span className={cn('figure text-2xl font-medium leading-none tracking-tight', toneClass)}>{value}</span>
  {delta && (
    <span className={cn('figure text-[11px] leading-none',
      delta.direction === 'up' ? 'text-win' : delta.direction === 'down' ? 'text-loss' : 'text-muted-foreground')}>
      {delta.direction === 'up' ? '+' : delta.direction === 'down' ? '−' : ''}{delta.value}
    </span>
  )}
</div>
```

- Label: `text-xs font-medium text-muted-foreground`, sentence case, above the value.
- `layout="inline"`: `flex items-center gap-3`, icon `size-4 text-muted-foreground shrink-0` left, label+value stacked right, no hint (the EASetup shape, EASetup.jsx:1134-1176; the `bg-card/20 backdrop-blur-md` dies here).
- `interactive`/`locked`: Card root `relative`; a **stretched real button** — `<button type="button" className="absolute inset-0 rounded-xl" aria-label={…}>` — is the interaction surface. Never `div role="button" tabIndex` (the current AnalyticsPage.jsx:523-524 pattern). Handlers: mouseenter/leave, focus/blur → `onRevealChange(bool)`; click/Enter/Space → toggle via `onRevealChange`, or `onLockedActivate()` when locked.
- `locked`: **redaction, not blur.** Value slot renders `••••` (`figure`); the real value is never in the DOM (blur-as-paywall leaks to a screenshot-and-sharpen). `aria-label` = `` `${lockLabel}: ${label}` ``.
- `loading`: `<Skeleton className="h-8 w-24" />` in the value slot.

Call sites — 18 cards, all map:

| Site | Count | Config |
|---|---|---|
| LogTradePage.jsx:368-440 | 4 | stacked. Card 1 delta `{direction:'up', value:'x%'}` + `hint="vs last month"`. Purple (:410-411), amber (:428), decorative green all collapse to `tone` — purple is banned; green here is not P&L. |
| HistoryPage.jsx:333-404 | 4 | stacked. Card 1 hint is a fragment (`Avg $X / trade`). Glow divs :351/:368/:385/:402 deleted. |
| AnalyticsPage.jsx:367-464 + :506-553 | 6 | The proving ground. Delete the seven presentation keys (`color`, `iconColor`, `iconBg`, `iconBorder`, `glowBg` (:379-459), `glowHoverBg`, `subPrefixColor`); keep `label`/`value`/`sub→hint`, add `tone`. `isInteractive`→`interactive`+`onRevealChange` (handlers :512-525, state `setExact` :56). `isLocked` (:508) → `locked` + `onLockedActivate={() => setShowPricingModal(true)}`; the `blur-[4px]` + `LockFill` overlay (:531+) is replaced by redaction. |
| EASetup.jsx:1132-1189 | 4 | `layout="inline"`. Static. `text-emerald-400` "Encrypted" (:1179-1180) is a security status, not P&L → value slot gets `<StatusSquare state="on" label="Encrypted">Encrypted</StatusSquare>`, not green text. |

### 2.3 `AppDialog` — `src/components/app/AppDialog.jsx`

```jsx
/**
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange     Single-arg; AppDialog absorbs Base UI's eventDetails.
 * @param {React.ReactNode} props.title                    REQUIRED always — it is the accessible name.
 * @param {boolean} [props.titleHidden=false]              Title renders sr-only (lightbox case).
 * @param {React.ReactNode} [props.description]            Wired to aria-describedby by the primitive.
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='md']   sm=24rem md=32rem lg=42rem xl=56rem, full=chrome-less lightbox.
 * @param {React.ReactNode} [props.children]
 * @param {React.ReactNode} [props.footer]                 -> DialogFooter (the shipped L2 band: -mx-4 -mb-4 border-t bg-muted/50).
 * @param {React.ReactNode} [props.headerAction]           Right-of-title slot, before the X.
 * @param {boolean} [props.dismissible=true]               false => Escape, outside-press, focus-out all vetoed; no X.
 * @param {boolean} [props.showCloseButton=true]
 * @param {React.RefObject|boolean|Function} [props.initialFocus]   Forwarded to Dialog.Popup.
 * @param {React.RefObject|boolean|Function} [props.finalFocus]
 * @param {boolean} [props.scrollBody=true]                Body scrolls; header/footer pinned. max-h-[85dvh].
 * @param {(open: boolean) => void} [props.onOpenChangeComplete]    Pass-through (ShareTradeModal capture timing).
 * @param {string} [props.className]                       Applied to the Popup.
 */
```

- Composes: `Dialog`, `DialogContent` (with `showCloseButton` and post-§0.3 `overlayClassName`), `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` (all verified in `dialog.tsx`). Close X is the primitive's `<DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" />}>` — `render`, not `asChild`.
- Standard classNames from the wrapper: Popup `className={cn('z-[80] border border-border ring-0', sizeClass, className)}` (`ring-0` neutralizes the shipped `ring-1 ring-foreground/10`; sizes: `sm:max-w-sm | sm:max-w-lg | sm:max-w-2xl | sm:max-w-4xl`); `overlayClassName="z-[70]"`.
- The non-dismissible guard — the only correct shape in Base UI 1.3.0 (`onOpenChange` is two-arg; reasons enum verified in `DialogRoot.d.ts`; `details.cancel()` vetoes):

```jsx
<Dialog
  open={open}
  disablePointerDismissal={!dismissible}
  onOpenChange={(next, details) => {
    if (!dismissible && !next &&
        ['escape-key', 'outside-press', 'focus-out'].includes(details.reason)) {
      details.cancel();
      return;
    }
    onOpenChange?.(next);
  }}
  onOpenChangeComplete={onOpenChangeComplete}
>
```

- `modal` stays default `true` (focus trap + scroll lock + outside inert). `scrollBody`: Popup gets `max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto]`, body wrapper `overflow-y-auto min-h-0`.
- `size="full"`: no DialogHeader; Popup `className="max-w-none w-auto bg-transparent border-0 ring-0 p-0"`; `title` still required → sr-only; close button floats top-right of the viewport; backdrop keeps `cursor-zoom-out`.
- a11y contract (all eight items every hand-rolled modal is missing — verified: none of the 11 has `role="dialog"`, `aria-modal`, labelledby, describedby, trap, restore, Escape, or scroll lock): `role="dialog"` + `aria-modal` (primitive), name from `title` (structurally required — `titleHidden`, never optional title), description wiring, focus trap, focus restore to trigger, Escape (top-most dialog only when nested — Base UI `nested`/`nestedDialogOpen` handles it; the `<AnimatePresence>` wrappers must be removed), scroll lock, outside inertness.

Call sites — migration order per the corrected dependency graph (ProTermsModal is never standalone):

| # | Site | size | Notes |
|---|---|---|---|
| 1 | OnboardingModal.jsx:12 | `md` | standalone; `autoFocus` (:49) → `initialFocus={inputRef}` |
| 2 | ConsentModal.jsx:8 | `md` | **`dismissible={false}` + `showCloseButton={false}`** — signature is `({ onAgree })`, no onClose (:4). Proves the `details.cancel()` guard. Kill the purple glow shadow (:13) and blur scrim. |
| 3 | PricingModal.jsx:41 + nested ProTermsModal (PricingModal.jsx:125) | `lg` + `lg` | proves nesting. ProTermsModal.jsx:5 itself: long copy → `scrollBody`. |
| 4 | ProFeatureUpsellModal.jsx:34 (+ ProTermsModal at :110) | `md` | footer close → `<DialogClose render={<Button variant="outline" />}>` |
| 5 | EditTradeModal.jsx:143 | `lg` | title "Edit trade" (not "MODIFY OPERATION"). Submit moves to `footer` via `<Button form="edit-trade">` + `<form id="edit-trade">`. Nested ImageViewerModal at :362-366 — remove the `<AnimatePresence>`, rely on Base UI nesting. |
| 6 | ImageViewerModal.jsx:13 | **`full`** | `titleHidden`, `title="Image preview"`. Also mounted from DashboardRightSidebar.jsx:924-928 (plain, not nested) — remove that AnimatePresence too. Escape comes free; today this z-[200] overlay closes only by click. |
| 7 | DashboardLayout.jsx:847-913 theme picker | `sm` | `title="Accent theme"`. The five buttons (:886-908) are a single-select — use the ToggleGroup recipe (§2.8) inside the dialog (`radio-group` is NOT installed; do not import it). Must NOT close on select (current behavior, `setTemplate` at :888). |
| 8 | EASetup.jsx:1459 and :1708 | `lg` | the two modals the original spec never inventoried. `backdrop-blur-xl` scrims die. |
| 9 | ShareTradeModal.jsx:68 | `lg` | **LAST — does not fit as written.** `html2canvas` runs in a mount effect (:12-31) against a node the modal renders; inside a Base UI Popup that node is portaled and carries `data-starting-style` transforms on the opening frame. Refactor: the page mounts the capture node off-screen (`<div aria-hidden className="fixed -left-[10000px] top-0"><TradeShareCard …/></div>`) and capture fires from `onOpenChangeComplete`, not on mount. |

**Destructive confirmation — recipe, not a wrapper.** The wrapper spec defines no `AppAlertDialog`, so none is built; but three native `confirm()` sites exist and get this Phase-3 recipe using the installed `alert-dialog.tsx` exports directly: `AlertDialog`, `AlertDialogContent` (post-§0.3: `overlayClassName="z-[70]"`, `className="z-[80] border border-border ring-0"`), `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction` (`<AlertDialogAction variant="destructive">Delete trade</AlertDialogAction>` — the tinted intent, never a solid red fill), `AlertDialogCancel` (defaults `variant="outline"`). Map: HistoryPage.jsx:294 (`confirm('Delete this trade?')`), JournalPage.jsx:53 (`confirm('Delete this journal entry?')`), EASetup.jsx:999 (`window.confirm('Remove this broker account?…')`). A loss is red; a delete confirmation is destructive — the two never share a token.

### 2.4 `DataTable` — `src/components/app/DataTable.jsx`

```jsx
/**
 * @param {Array<{
 *   id: string,
 *   header: React.ReactNode,
 *   cell: (row, index) => React.ReactNode,
 *   align?: 'start'|'end',
 *   numeric?: boolean,          // .figure + text-right; implies align 'end'
 *   width?: string,
 *   hideBelow?: 'md'|'lg',      // hidden md:table-cell / hidden lg:table-cell on th+td
 *   sortable?: boolean
 * }>} props.columns
 * @param {any[]} props.rows
 * @param {(row, index) => string} props.getRowId          REQUIRED.
 * @param {string} props.caption                            REQUIRED. Visually hidden <caption>.
 * @param {React.ReactNode} [props.empty]                   Rendered in one cell spanning columns.length.
 * @param {boolean} [props.loading=false]
 * @param {number} [props.skeletonRows=5]
 * @param {(row) => void} [props.onRowActivate]
 * @param {(row) => React.ReactNode} [props.renderExpanded]
 * @param {string|null} [props.expandedRowId]
 * @param {(id: string|null) => void} [props.onExpandedRowIdChange]
 * @param {{columnId: string, direction: 'asc'|'desc'}|null} [props.sort]
 * @param {(next: {columnId, direction}) => void} [props.onSortChange]
 * @param {string} [props.className]
 */
```

No `density` prop (one density — it is the deliverable). No `stickyHeader` prop (always sticky).

- Composes: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` (verified; `Table` already self-wraps in the `overflow-x-auto` container) + `Skeleton`; the `empty` slot is normally an `EmptyState`.
- Classes: `Table className="text-xs"`; `TableHeader className="sticky top-0 z-10 bg-muted [&_tr]:border-b-border"` (L2 well per §1.1 — opaque, so sticky works); `TableHead className="h-7 px-3 text-left text-xs font-medium text-muted-foreground"` (the label idiom; sentence case); `TableCell className="h-11 md:h-8 px-3 py-0 align-middle"`. `numeric` columns add `text-right` on th+td and wrap cell content in `<span className="figure">`. Row separation is the primitive's `border-b` — now full-opacity `border-border`. No zebra striping.
- `colSpan` for empty/expanded/skeleton rows is computed from `columns.length` (+1 when `renderExpanded` adds the expander column) — kills the hardcoded `colSpan="9"` (LogTradePage.jsx:646) that silently breaks on column changes.
- Expander: a chevron `<Button variant="ghost" size="icon-xs">` in a dedicated column with `aria-expanded` + `aria-controls={rowId + '-detail'}`; the expanded content is a sibling `<TableRow id={rowId + '-detail'}>`. `TableRow`'s stock `has-aria-expanded:bg-muted/50` (table.tsx:58) highlights the parent for free.
- a11y contract: real `<table>` with sr-only `<caption>`; sortable headers are `<button>`s inside `<th>` with `aria-sort` on the th; `onRowActivate` lands on a focusable element inside the row — **never** `onClick` on `<tr>`; `hideBelow` uses `hidden`/`table-cell` (out of the a11y tree), never opacity.
- z-index: none portaled; thead is `z-10` inside its own scroll container.

Call sites:

| Site | Verdict | Notes |
|---|---|---|
| LogTradePage.jsx:597-650 | **Clean fit — first** | The only real `<table>`. 9 columns. `hideBelow:'md'` on Strategy (th :603 / td :623), `hideBelow:'lg'` on Session (th :604 / td :630) — only these two are responsive-hidden (spec's "three" was wrong). Entry/Exit/Lots/P&L → `numeric:true`. `trades.slice(0, 10)` (:612) stays in the page. `caption="Recent positions"`. Session column cell renders `<SessionGlyph>`. Empty via `empty={<EmptyState title="No positions logged yet" className="py-6" />}`. |
| HistoryPage.jsx:613-838 | **Convert — the largest Phase-3 migration, its own change** | Not a table today: `apple-glass-panel` cards faking columns with a per-row `minmax()` grid (:670), a mouse-only expander (`<div onClick>` with no role/tabIndex at ~:645-647; chevron ~:699-706 without `aria-expanded`). Columns: Market, Direction, Date, Entry, Exit, Pips, R:R, P&L, Lots. The drawer (:712-830, with Share/Edit/Delete at :809-829) becomes `renderExpanded` verbatim; the chevron becomes the built-in expander. Load-more pagination (:833+) stays outside the wrapper. `history-virtual-item` (:633): update `contain-intrinsic-size: auto 180px` at auth.css:420-424 to the new row height (`auto 32px`) or drop the containment. Deferral path if it must slip: SectionCard + per-row collapsible fixes the a11y without the column work — but plan on the table; the hand-tuned grid is a table reimplemented badly, which is exactly why the figures don't align. |
| LogTradePage.jsx:653-663 orders tab | **Not a table** | Bare `EmptyState`, no DataTable. |

### 2.5 `EmptyState` — `src/components/app/EmptyState.jsx`

One shape. No icon prop, no size ladder, no dashed border, no `EmptyMedia` chip (the `size-8 rounded-lg bg-muted` glyph is the consumer-app tell this removes — six empty states, zero decorative glyphs).

```jsx
/**
 * @param {React.ReactNode} props.title            Sentence case: "No trades yet".
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.action]         Usually <Button size="sm" variant="outline">.
 * @param {boolean} [props.announce=false]         role="status" — only when it appears as the result of a user action.
 * @param {string} [props.className]               Density lever (e.g. "py-6" inside a table cell).
 */
```

- Composes: `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` (verified in `empty.tsx`; the base `border-dashed` has no border width, so nothing renders — leave it). Overrides: `Empty className={cn('py-10', className)}`, `EmptyDescription className="text-xs"`. `announce` puts `role="status"` on `Empty`.
- a11y: title is the accessible content; `role="status"` announces filter results.

Call sites:

| Site | Config |
|---|---|
| LogTradePage.jsx:561-569 (chart) | `title="No performance data"`, `description="Log trades to see your performance curve."` |
| LogTradePage.jsx:653-663 (orders) | `title="No active orders"`, `description="Limit and stop orders will appear here."` |
| LogTradePage.jsx:646 (table) | via DataTable `empty`, `className="py-6"` |
| HistoryPage.jsx:616-621 | `announce`, `title="No trades match the current filters"`, `action={<Button size="sm" variant="outline" onClick={clearFilters}>Clear filters</Button>}` — a recovery action the current one lacks. Becomes DataTable `empty` after the conversion. |
| AnalyticsPage.jsx:630-634 | text-only, `title="No setup data yet"` |
| JournalPage.jsx:137-146 | `title="No journals found"`, action linking the composer. The `w-20 h-20 rounded-[2.5rem]` chip and `rotate-3 hover:rotate-0` easter egg (:139) die. |

### 2.6 `StatusSquare` — `src/components/app/StatusSquare.jsx`

No ui/ primitive behind it — it is a `<span>`; wrapping one would be ceremony. A 6px **square** (`rounded-none`): a circle is the generic status dot and collides with the round avatar; a square reads as an instrument indicator.

```jsx
/**
 * @param {'on'|'off'|'attn'} [props.state='off']
 *        on   = live / nominal / open      -> bg-foreground
 *        off  = idle / closed / not set up -> bg-transparent + shadow-[inset_0_0_0_1px_hsl(var(--muted-foreground))]
 *        attn = stale / failed / expiring  -> bg-foreground + shadow-[0_0_0_1px_hsl(var(--background)),0_0_0_2px_hsl(var(--foreground))]
 *        (filled square inside a ring — unmistakable from both others at 6px, zero hue budget)
 * @param {string} props.label                 REQUIRED. sr-only when no children.
 * @param {React.ReactNode} [props.children]   Visible text beside the square: font-mono text-[11px];
 *                                             text-foreground for on/attn, text-muted-foreground for off.
 * @param {string} [props.className]
 */
```

No `pulse` prop, no tone→hue map (`positive`/`negative`/`warning` are gone: green/red belong to P&L, amber collides with the accents). Never color-alone: the word is always present.

Call sites: LogTradePage.jsx:329-335 market badge (`on` + `Open` / `off` + `Closed · opens 22:00 UTC` — derive from `isMarketClosed`/`getNextOpen`; kill `animate-pulse` + the green glow shadow at :331); DashboardLayout.jsx:386 broker-sync (`on Synced 14:22` / `attn Last sync 18m ago` / `off Not connected`; kill pulse); DashboardRightSidebar.jsx:293 (kill `shadow-[0_0_6px_rgba(229,184,11,0.6)]`) and :375; EASetup.jsx:1313/:1324 sync dots; EASetup.jsx:1180 "Encrypted" (`on`, inside StatCard inline value); plan-tier expiring chip (§1.4). All 14 `animate-pulse` uses in /app .jsx are removed across Phase 3.

### 2.7 `SessionRail` + `SessionGlyph` — `src/components/app/SessionRail.jsx`

Both in one file (two components, both exported — component-only exports, so no pragma needed). No ui/ primitive; pure spans + `src/lib/goldSessions.js`.

```jsx
/**
 * SessionRail — the page-scale mark. 3px tall, full width, under the page title on every /app route.
 * @param {Date} [props.now]        Defaults to a useUtcClock(30_000) tick.
 * @param {string} [props.className]
 *
 * SessionGlyph — the row/cell-scale mark. 14×6px inline.
 * @param {string} props.session    Stored trade.session value (free text tolerated).
 * @param {string} [props.className]
 */
```

- Rail render: `role="img"` + `aria-label` naming the live sessions (`"London and New York sessions open"`; `"Market closed — reopens Sunday 22:00 UTC"` on weekends). Four `<i className="flex-1 transition-colors duration-100">` in a `flex gap-[2px] h-[3px]` track; fills `bg-foreground` (live) / `bg-border` (closed today) / `bg-border/40` (ahead). **When `isMarketClosed(now)` is true, no segment is live** — otherwise the rail shows London open on a Saturday. Import `GOLD_SESSIONS` (goldSessions.js:11), `isSessionOpen` (:25), `isMarketClosed` (:19), `useUtcClock` (:72). Never re-declare the windows: the site and the app must not drift.
- Glyph render: `inline-flex gap-px w-3.5 h-1.5`, segments `bg-border`, the trade's session `bg-foreground`; `title` + `aria-label` carry the full session name. **Unrecognized values** (`Asia`, `Overlap`, free text — the stored field is not guaranteed canonical, see AnalyticsPage.jsx:190-198) render all four segments `bg-border` with the raw string in the `title`. The glyph is a scanning aid; the session name still appears as text in the trade detail and log form — never the only representation.
- Display-only: analytics keeps its London/NY/Asia/Overlap taxonomy (AnalyticsPage.jsx:190-198; HistoryPage.jsx:449-473 filter pills use the same buckets). The rail does not claim the analytics grouping.
- The one motion it earns: a newly-live segment transitions `--border → --foreground` over 100ms; suppressed under reduced motion.
- Absorbs: the pulsing market badge (with StatusSquare), the bias gauge (LogTradePage.jsx:465-516 — deleted, a bias readout is a figure plus a horizontal bar), the session pill column.

### 2.8 Patterns (no wrapper — direct primitive composition)

**Tabs** — panel-switching only. Composes `Tabs`, `TabsList variant="line"`, `TabsTrigger`, `TabsContent` (verified: `tabs.tsx` maps to Base UI `Root/List/Tab/Panel`; no `type` prop; `onValueChange` is two-arg — absorb the second). Recipe: `<TabsList variant="line" className="h-auto">` + `<TabsTrigger className="text-xs after:bg-primary">` — the active underline is `--primary` (interactive affordance, §1.4); the primitive's underline ships `after:bg-foreground`, override it. Gains `role="tablist"`, `aria-selected`, arrow-key nav — none present today.

| Site | Notes |
|---|---|
| LogTradePage.jsx:581-592 | Positions/Orders. Kills the `border-b-2 -mb-[21px]` hack + `font-black uppercase tracking-[0.2em]` (:582/:588). `activeTab`/`setActiveTab` → `value`/`onValueChange`. |
| DashboardRightSidebar.jsx:330-368 | `TABS` array (:26) already `{id,label,icon}`. Locked tabs (:341-346) call `requireProFeature` instead of switching: a disabled Base UI `Tab` swallows activation, so wrap the trigger in a span with `onClickCapture` for the locked case. Badge counts (:363-367): `<span className="figure text-[11px] text-muted-foreground">` inside the trigger, count included in the accessible name — not a Badge pill. |

**Segmented single-select** — `ToggleGroup` + `ToggleGroupItem` (verified: Base UI root takes `multiple` (default false); `value`/`defaultValue` are **always `readonly Value[]`**; `onValueChange(Value[], details)`). These have no panels — `role="tab"` without `role="tabpanel"` is worse than the buttons they replace. Pressed state is the primitive's `data-[state=on]:bg-muted` / `aria-pressed:bg-muted` — form, not hue.

```jsx
<ToggleGroup spacing={0} value={[filterDir || 'all']}
  onValueChange={([next]) => next && setFilterDir(next === 'all' ? '' : next)}>
  <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
  <ToggleGroupItem value="BUY" size="sm"><span aria-hidden>▲</span> Buy</ToggleGroupItem>
  <ToggleGroupItem value="SELL" size="sm"><span aria-hidden>▼</span> Sell</ToggleGroupItem>
</ToggleGroup>
```

The `'all'` sentinel maps to the existing `''` **at the UI boundary only** — filter logic, URL/localStorage serialization untouched.

| Site | Notes |
|---|---|
| DashboardRightSidebar.jsx:306-327 Buy/Sell | Values are `'LONG'`/`'SHORT'` (:311/:320). **Not green/red:** direction is intent, not P&L — the wrappers spec's "keep bg-primary/bg-loss" note loses to the color contract (constraints + visual §4.3). Pressed = `bg-muted` + caret. |
| HistoryPage.jsx:423-443 direction pills | `''`→`'all'` sentinel. Kills `bg-[#EDAE49] text-[#003D5B]` (:427-439). |
| HistoryPage.jsx:445-475 session pills | Five options (`'' London NewYork Asia Overlap`) — same sentinel. These are the *analytics* buckets; leave the values as stored. |
| DashboardLayout.jsx:886-908 theme picker | Single-select ToggleGroup inside AppDialog #7. Selection does not close the dialog (current behavior preserved). `radio-group` is not installed — do not import it. |

---

## 3. Do not do — merged from both critiques

**Surfaces & effects**
1. No `backdrop-blur`/`backdrop-filter`, no glass classes, no blurred glow divs (delete the elements, not the class), no gradient washes (only the equity area fill), no panel `box-shadow`, no `will-change` on surfaces, no hover lift/translate/scale/glow, no double borders or inset bevel highlights, no `border-border/10`-style ghost borders.
2. Don't convert the 54 glass/premium panels into 54 Card tiles — the ruled section is the default; `surface` is the exception. A console is one surface divided by rules.
3. No 2px accent left-stripe "emphasis" — the accent-bar-on-card is the most recognizable AI-dashboard tell. Emphasis = `bg-muted` + StatusSquare.

**Type**
4. The `font-black uppercase tracking-widest` idiom is banned in all sizes and spacings; no `text-[10px]`/`text-[9px]`; `font-black` must return zero matches under /app when Phase 3 ends. Uppercase only for symbols/direction/session codes (mono 11px).
5. No weights above 600. No mono in running prose; no Roboto on figures. No new font families (Inter/Geist/Roboto Mono are not loaded for /app; Poppins never appears on /app).

**Color**
6. Green/red exist only as `text-win`/`text-loss`/`bg-win`/`bg-loss` on actual P&L. No `text-green-*`/`emerald`/`rose`/`red` utilities in new code (298 current occurrences die in Phase 3); no purple anywhere (20 die); no hardcoded hexes (`#EDAE49`, `#003D5B`, `#D1495B`, `#E5B80B`, `#facc15`).
7. `--primary` never colors a number, a status, or a decoration. `--destructive` is the tinted confirm-to-delete intent, never a solid fill, never a loss. No `tone="accent"` on StatCard — a figure is P&L or it is foreground.
8. No colored direction chips: BUY/SELL is a caret + a muted word.

**Components**
9. No `ui/Badge` for dashboard chips (it is a `rounded-4xl` pill against a 2–6px system) — use the chip recipe. No delta arrow-in-a-badge KPI chip (the shadcn dashboard-01 tell) — a delta is a signed mono figure on the value's baseline.
10. No icon chips/medallions on cards or empty states (`w-9 h-9 rounded-full`, `EmptyMedia variant="icon"`); stacked StatCards carry no icon at all.
11. No `density`/`comfortable` props, no size ladders on EmptyState, no zebra striping, no optional sticky header — one density, always sticky.
12. No `div role="button" tabIndex` cards (real `<button>`), no `onClick` on `<tr>`, no `role="tab"` without panels, no modal without a required title, no blur-as-paywall (redact instead).
13. No pulsing status dots and no glow shadows on dots; no spinners for sync states; `Skeleton` pulse is the only permitted loop, loading only.

**Mechanics**
14. Don't edit `src/components/ui/*` beyond the five sanctioned §0.3 edits; z-index overrides live at the wrapper call sites (`z-[60]/[70]/[80]/[90]` ladder), never in primitives.
15. Don't re-implement session math — import `goldSessions.js`; the rail shows nothing live when `isMarketClosed`.
16. Don't touch ToastContext's public API, don't destructure `useToast()` (it returns the callable), don't rename the `'warn'` type this phase; don't import base-nova's `ToastProvider` unaliased next to the app's own.
17. No new `useCallback`/`useMemo` (React Compiler); no non-component exports beside components in wrapper `.jsx` files (react-refresh) — variants objects go in a sibling `.js`.
18. No Radix idioms: no `asChild` (use `render={…}` + `nativeButton={false}` for non-buttons), no `onEscapeKeyDown`/`onInteractOutside` (use `onOpenChange`'s `details.reason` + `details.cancel()`), no single-string ToggleGroup values (always arrays), no `Tabs type=`.
19. Don't fight the global focus rule (index.css:3380, `!important`) with per-component outlines; don't add a second reduced-motion block (extend auth.css:412-418).
20. Don't reference `.app-shell` or `.public-aurora-page` (they don't exist / are unused) — the /app scope hook is `.dashboard-shell` (auth.css:340). Don't "fix" `components.json` (`css` is already `src/index.css`).

---

## 4. Test matrix

Location: `src/components/app/__tests__/<Wrapper>.test.jsx`. Every file starts with `// @vitest-environment jsdom`. Stack: `@testing-library/react` + `@testing-library/user-event` + jest-dom (globals on, setup at `src/test/setup.js` — verified `vite.config.js:24-27`). Test the **contract**, not the styling — no class-string assertions except where a class *is* the contract (`.figure`, `sr-only`).

| Wrapper | Must assert |
|---|---|
| **SectionCard** | renders `<section>` with `aria-labelledby` pointing at the rendered heading's id; heading is an `<h2>` with the title text; `meta` and `actions` render in the header row; `surface` renders `data-slot="card"`; default does not. |
| **StatCard** | label and value visible; `interactive` renders a real `<button type="button">` (`getByRole('button')`); hover in/out and focus/blur fire `onRevealChange(true/false)`; Enter and Space activate; `locked`: the real value string is **absent from the DOM**, `••••` present, accessible name contains `lockLabel`, activation calls `onLockedActivate` and not `onRevealChange`; `loading` shows skeleton and no value; `delta` down renders U+2212, never the ASCII hyphen; no `img`/icon role in stacked layout. |
| **AppDialog** | open renders `role="dialog"` with accessible name = `title` (also when `titleHidden` — name still present, title node `sr-only`); `description` reflected in `aria-describedby`; Escape calls `onOpenChange(false)`; backdrop click closes; **`dismissible={false}`**: Escape and outside-press do NOT call `onOpenChange`, dialog stays open, no close button rendered; close X present by default with accessible name "Close"; focus moves into the popup on open and **returns to the trigger on close**; Tab from the last tabbable wraps inside (trap); `initialFocus` ref receives focus; nested: opening a child AppDialog and pressing Escape closes the child only, parent stays open; `footer` renders inside the dialog. |
| **Alert recipe** (one smoke test) | `role="alertdialog"` with name + description; Action and Cancel buttons render; Cancel closes without firing the action callback; Action fires it. |
| **DataTable** | `role="table"` with an sr-only caption (accessible name = `caption`); `columnheader` count = `columns.length` (+1 with `renderExpanded`); numeric cells contain a `.figure` element and `text-right` on the cell; empty state renders in a single cell with `colSpan === columns.length`; `loading` renders `skeletonRows` rows and no data rows; sortable header renders a `<button>` inside `<th>`, click calls `onSortChange` with the cycled direction and `aria-sort` reflects `sort`; expander button has `aria-expanded` matching `expandedRowId` and `aria-controls` pointing at the rendered detail row's id; clicking it calls `onExpandedRowIdChange` (id, then null on collapse); `onRowActivate` fires from a focusable element via keyboard — the `<tr>` itself has no click handler. |
| **EmptyState** | title rendered; `announce` adds `role="status"` (absent otherwise); `action` is clickable and fires; no `img` role rendered. |
| **StatusSquare** | `label` always in the a11y tree (sr-only span when no children; visible text when children given); the three states render distinct visual encodings (assert `data-state` attribute, not colors); no animation classes present. |
| **SessionRail / SessionGlyph** | rail is `role="img"`; `aria-label` lists exactly the open sessions for a frozen weekday `now` (e.g. Tue 08:00 UTC → "Tokyo and London"); a Saturday `now` yields the market-closed label and zero live segments (assert via `data-state`); glyph for `"London"` marks exactly one segment on and carries the session name in `aria-label`/`title`; glyph for an unknown string (`"Overlap"`) marks zero segments on and puts the raw string in `title`. Use an injected `now` — never the wall clock. |
| **Tabs/Segmented recipes** (one patterns test) | tabs recipe: `role="tablist"`, ArrowRight moves selection, `aria-selected` correct, panel swaps; segmented recipe: exactly one item pressed (`aria-pressed`/`data-[state=on]`), selecting "all" maps back to `''` through the boundary handler, and selecting the pressed item again does not empty the group (the `next &&` guard). |

Definition of done for Phase 1: all wrapper tests green, `npx vitest run` clean, and a grep gate — `font-black|uppercase tracking|text-green-|text-red-|emerald|rose-|purple-|backdrop-blur|animate-pulse` returns zero matches inside `src/components/app/`.

---

## Decisions log (post-review arbitration — binding for later phases)

1. **§0 prerequisites are LANDED** (win/loss token values, `.dashboard-shell` heading reset, and all five §0.3 primitive edits: card ring→border, button press-transform removal, dialog + alert-dialog scrim `bg-background/80` de-blur, `overlayClassName` pass-through on both Content components, zoom removal → opacity-only). Recipes may now use `DialogContent`/`AlertDialogContent` with `overlayClassName="z-[70]"` + `className="z-[80] …"`.
2. **AppDialog keeps its direct `DialogPrimitive.Backdrop/Popup` composition** even though §0.3 makes `DialogContent` viable. Rationale: AppDialog owns the full-size lightbox mode (viewport-spanning popup, click-empty-space-to-close, corner close inside the trap) and the scroll-body grid, which `DialogContent`'s fixed structure cannot express without fighting it. The `POPUP_BASE`/`OVERLAY_BASE` strings in AppDialog.jsx are the canonical z-[70]/z-[80] classes; do not fork a third copy — new dialog *recipes* (alert/confirm) use the primitives with `overlayClassName`.
3. **Tabs recipe includes `activateOnFocus` on `TabsList`** (§2.8 amended). Base UI 1.3 defaults to manual activation; the dashboard's two-tab panels are light, so automatic activation per APG is correct here. Tests assert ArrowRight moves selection.
4. **Sort indicators are ↑/↓ (U+2191/2193), never ▲/▼** — the triangles belong exclusively to trade direction (BUY/SELL).
5. **`formatSigned(val, decimals?)` exists in `src/lib/tradeUtils.js`** (always-signed, U+2212 minus, em-dash for missing). Phase 3 call sites use it instead of inline sign logic.
6. **Bundle budget note:** `global-css` is temporarily 48 kB (was 40) because Tailwind's static scan compiles the primitive layer before Phase 2–3 delete the legacy CSS it replaces. Restore the 40 kB budget in Phase 5 and treat failure to restore as a Phase 5 exit-criteria failure. The dead `gsap` dependency, its budget entry, and its manualChunks line were removed.
