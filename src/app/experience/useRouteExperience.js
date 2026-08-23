import { useEffect } from 'react';
import { initGA, trackPageview } from '../../lib/ga.js';
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

const HEADING_SELECTOR = 'main h1, main h2, main h3, main h4, main h5, main h6, [role="main"] h1, [role="main"] h2, [role="main"] h3, [role="main"] h4, [role="main"] h5, [role="main"] h6';

/** Owns telemetry, scroll, focus and progressive-reveal behavior shared by routes. */
export function useRouteExperience(pathname) {
  useEffect(() => { initGA(); }, []);
  // App's own effects flush after its children's, so the page's SEO effect has
  // already set document.title by the time this page_view reads it.
  useEffect(() => { trackPageview(pathname); }, [pathname]);
  useEffect(() => observeRouteWebVitals(pathname), [pathname]);
  useEffect(() => {
    // The dashboard manages its own scroll positions (dense layout, persistent
    // shell); resetting on every /app navigation fights it.
    if (!pathname.startsWith('/app')) window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tracked = new Set();
    let observer;
    let mutationObserver;
    let frameId = 0;

    const positionState = (heading) => {
      const rect = heading.getBoundingClientRect();
      if (rect.bottom < 0) return 'above';
      if (rect.top > window.innerHeight) return 'below';
      return 'enter';
    };

    const register = (root) => {
      const candidates = [];
      if (root instanceof Element && root.matches(HEADING_SELECTOR)) candidates.push(root);
      if (root.querySelectorAll) candidates.push(...root.querySelectorAll(HEADING_SELECTOR));

      candidates.forEach((heading) => {
        if (tracked.has(heading) || heading.closest('[aria-hidden="true"]')) return;
        tracked.add(heading);

        if (reducedMotion || typeof IntersectionObserver === 'undefined') {
          heading.dataset.headingMotion = 'visible';
          return;
        }

        heading.dataset.headingMotion = positionState(heading);
        observer.observe(heading);
      });
    };

    if (!reducedMotion && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.headingMotion = 'visible';
            return;
          }
          entry.target.dataset.headingMotion = entry.boundingClientRect.bottom <= 0 ? 'above' : 'below';
        });
      }, { threshold: 0.12, rootMargin: '-4% 0px -4% 0px' });
    }

    frameId = window.requestAnimationFrame(() => {
      register(document);
      // Lazy routes resolve after the app shell effect. Keep the observer live
      // so every subsequently mounted page heading receives the same motion.
      mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) register(node);
        }));
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });

      if (!reducedMotion) {
        window.requestAnimationFrame(() => {
          tracked.forEach((heading) => {
            if (heading.dataset.headingMotion === 'enter') heading.dataset.headingMotion = 'visible';
          });
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      mutationObserver?.disconnect();
      tracked.forEach((heading) => delete heading.dataset.headingMotion);
    };
  }, [pathname]);

  useEffect(() => {
    // The reveal/card/control pass is a marketing-page treatment. The Console
    // dashboard opts out wholesale — same precedent as ScrollProgress, which
    // already returns null on /app. Without this guard, new tables and
    // sections under /app mount at opacity 0 + blur until observed.
    if (pathname.startsWith('/app')) return undefined;
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
