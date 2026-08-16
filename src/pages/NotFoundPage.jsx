import { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Unknown URLs used to render `<Navigate to="/" />`, so every mistyped or stale
 * link returned HTTP 200 with the full homepage. Google reads that as a soft
 * 404: the URL stays in the index, competes with the real homepage, and eats
 * crawl budget.
 *
 * A client-rendered SPA cannot return a 404 status, so the next best signal is
 * an explicit noindex plus content that is visibly not the homepage. This is
 * the one place in the app that sets noindex — it is removed again on the next
 * route change by applyPageSEO().
 */
export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found — xaujournal';

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    // Restore whatever the site normally declares, not a hardcoded guess — the
    // real value carries max-image-preview and friends.
    const previousRobots = robots.getAttribute('content');
    robots.setAttribute('content', 'noindex, follow');

    // Nothing here should be claimed as canonical, and og:url would otherwise
    // still advertise the bogus path that PageSEO wrote on the way in.
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();

    return () => {
      if (previousRobots) robots.setAttribute('content', previousRobots);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.8rem', opacity: 0.6 }}>404</p>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 500, margin: 0 }}>That page does not exist.</h1>
      <p style={{ opacity: 0.7, margin: 0 }}>The link may be out of date, or the address mistyped.</p>
      <Link to="/" style={{ textDecoration: 'underline' }}>Back to xaujournal</Link>
    </main>
  );
}
