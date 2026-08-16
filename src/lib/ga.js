/**
 * Google Analytics 4, loaded only when VITE_GA_MEASUREMENT_ID is set.
 *
 * The SPA owns page_view: gtag's automatic one fires only on the first real
 * page load and never again across client-side navigations, so config runs
 * with send_page_view:false and the router calls trackPageview() on every
 * pathname change instead — one code path for all views.
 */

let initialized = false;

/** Inject gtag.js once. No-ops without a measurement id (dev, previews). */
export function initGA() {
  if (initialized || typeof window === 'undefined') return;
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // gtag must push the Arguments object itself, not a spread copy —
  // gtag.js reads it positionally.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

/** Send one page_view for a client-side navigation. Safe when GA is off. */
export function trackPageview(path) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
