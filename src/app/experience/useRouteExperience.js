import { useEffect } from 'react';
import { observeRouteWebVitals } from '../../lib/webVitals.js';

const SKIP_SELECTOR = 'header, footer, [role="dialog"], .Toastify, .dashboard-sidebar, .story-page, .xau-page, .xjs-page, .qgs-page, .xau-scroll-top, .site-scroll-top, [data-ux-skip="true"]';
const shouldSkip = (element) => Boolean(
  element.closest(SKIP_SELECTOR) || element.closest('[aria-hidden="true"]') || element.closest('svg')
);
const clearUxState = (element) => {
  delete element.dataset.uxCard;
  delete element.dataset.uxRow;
  delete element.dataset.uxReveal;
  element.style.removeProperty('--ux-index');
};

/** Owns telemetry, scroll, focus and progressive-reveal behavior shared by routes. */
export function useRouteExperience(pathname) {
  useEffect(() => observeRouteWebVitals(pathname), [pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    let observer;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frameId = window.requestAnimationFrame(() => {
      const main = document.querySelector('main, [role="main"]');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.classList.remove('ux-route-enter');
        const ownsRouteMotion = Boolean(
          main.matches('[data-ux-skip="true"], .story-page, .xau-page, .qgs-page') ||
          main.closest('.xjs-page, .qgs-page')
        );
        if (!ownsRouteMotion) {
          void main.offsetWidth;
          main.classList.add('ux-route-enter');
        }
        if (document.body.dataset.uxHasMounted === 'true') main.focus({ preventScroll: true });
        document.body.dataset.uxHasMounted = 'true';
      }

      document.querySelectorAll('button, a[href], summary, [role="button"], input[type="checkbox"], input[type="radio"]').forEach((control) => {
        if (!control.matches('[disabled], [aria-disabled="true"]')) control.dataset.uxControl = 'true';
      });

      const cardSelector = [
        'main .card-premium', 'main .apple-glass-panel', 'main .xau-card', 'main .xau-panel',
        'main .xau-soft', 'main .story-product-panel', 'main .story-stage-step', 'main article', 'main form',
      ].join(',');
      document.querySelectorAll(cardSelector).forEach((card) => {
        if (shouldSkip(card)) clearUxState(card);
        else card.dataset.uxCard = 'true';
      });
      document.querySelectorAll('main tbody tr, main .xau-row, main ul.divide-y > li, main ol.divide-y > li').forEach((row) => {
        if (shouldSkip(row)) clearUxState(row);
        else row.dataset.uxRow = 'true';
      });

      const revealSelector = [
        'main section', 'main article', 'main form', 'main .card-premium', 'main .apple-glass-panel',
        'main .xau-card', 'main .xau-panel', 'main .xau-soft', 'main .story-reveal',
        'main .story-product-panel', 'main tbody tr', 'main ul.divide-y > li', 'main ol.divide-y > li',
      ].join(',');
      const revealItems = [...new Set(document.querySelectorAll(revealSelector))].filter((item) => {
        if (!shouldSkip(item)) return true;
        clearUxState(item);
        return false;
      });
      revealItems.forEach((item, index) => {
        item.style.setProperty('--ux-index', String(Math.min(index % 8, 7)));
        item.dataset.uxReveal = reducedMotion ? 'visible' : 'pending';
      });
      if (reducedMotion || typeof IntersectionObserver === 'undefined') {
        revealItems.forEach((item) => { item.dataset.uxReveal = 'visible'; });
        return;
      }
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.uxReveal = 'visible';
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
      revealItems.forEach((item) => observer.observe(item));
    });
    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [pathname]);
}
