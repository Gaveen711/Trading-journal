/**
 * Navbar stand-in for the app-shell Suspense fallback.
 *
 * The real PublicNavbar imports PublicSite.jsx for Arrow/Wordmark, which imports
 * PublicSite.css. Rendering it from App.jsx made that a static edge from the
 * entry, so 1094 lines of marketing CSS merged into the render-blocking global
 * stylesheet — on the dashboard too. Every public page renders its own
 * PublicNavbar once its chunk lands, so the fallback only needs the geometry.
 *
 * Values are literals, not var(--xj-*), because PublicSite.css is by definition
 * not loaded yet. They mirror .xj-nav / .xj-nav-inner / .xj-wordmark
 * (src/pages/PublicSite.css:636-668) — keep them in sync or the handoff shifts.
 * The gutter is the one responsive value, so it needs a real rule rather than an
 * inline style; without it the wordmark jumps 12px sideways on the handoff.
 */
const CSS = `
.xj-nav-skeleton{position:fixed;inset:0 0 auto;z-index:60;border-bottom:1px solid transparent}
.xj-nav-skeleton>div{display:flex;align-items:center;justify-content:space-between;gap:24px;
width:min(100% - 40px,1200px);margin-inline:auto;height:66px;
font-family:'Geist Variable','Geist',system-ui,-apple-system,'Segoe UI',sans-serif;
font-size:1.02rem;font-weight:500;letter-spacing:-0.028em;color:#e8e6e1;white-space:nowrap;
line-height:1.6}
.xj-nav-skeleton b{font-weight:500;color:#e0a33e}
@media(min-width:720px){.xj-nav-skeleton>div{width:min(100% - 64px,1200px)}}
`;

export function PublicNavSkeleton() {
  return (
    <div className="xj-nav-skeleton" aria-hidden="true">
      <style>{CSS}</style>
      <div><span>xau<b>/</b>journal</span></div>
    </div>
  );
}
