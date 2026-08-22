import { useEffect, useRef, useState } from 'react';

/**
 * Browser-style status bar: the destination of whatever link is under the
 * pointer, pinned bottom-left.
 *
 * Delegated from `document` rather than wired per link — the app renders far
 * too many anchors (nav, cards, tables, marketing pages) for per-node
 * listeners to be worth it, and delegation keeps lazily mounted routes working
 * with no registration step.
 *
 * Anchors are picked up automatically. Anything else opts in with
 * `data-peek="…"`, which is also the escape hatch for links whose raw href is
 * useless to a reader (a router action, a `mailto:`), since the attribute
 * value is shown verbatim.
 */
export function LinkPeek() {
  const [label, setLabel] = useState('');
  // The visible label lags the target slightly so a pointer sweeping across a
  // dense card grid does not thrash React with a render per anchor. A timer
  // rather than rAF: rAF is starved whenever the page is not compositing, and
  // one skipped frame would leave a stale destination on screen.
  const pendingRef = useRef('');
  const timerRef = useRef(0);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const commit = () => {
      timerRef.current = 0;
      setLabel((current) => (current === pendingRef.current ? current : pendingRef.current));
    };
    const schedule = (next) => {
      pendingRef.current = next;
      if (!timerRef.current) timerRef.current = window.setTimeout(commit, 16);
    };

    const resolve = (target) => {
      if (!(target instanceof Element)) return '';
      const opted = target.closest('[data-peek]');
      if (opted) return opted.getAttribute('data-peek')?.trim() || '';
      const anchor = target.closest('a[href]');
      if (!anchor) return '';
      const href = anchor.getAttribute('href') || '';
      // In-page jumps and JS-only anchors have no destination worth showing.
      if (!href || href.startsWith('#') || href.toLowerCase().startsWith('javascript:')) return '';
      try {
        // Absolute form, so an internal route reads the same as an external
        // link does — which is what the browser's own bar shows.
        return new URL(href, window.location.href).href;
      } catch {
        return href;
      }
    };

    const onOver = (event) => schedule(resolve(event.target));
    const onOut = (event) => {
      // Moving between two children of the same link must not flicker.
      if (event.relatedTarget instanceof Element && resolve(event.relatedTarget)) return;
      schedule('');
    };
    const clear = () => schedule('');

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('focusin', onOver);
    document.addEventListener('focusout', clear);
    // A click navigates or opens a modal; the stale destination should go with it.
    document.addEventListener('click', clear, true);
    window.addEventListener('blur', clear);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('focusin', onOver);
      document.removeEventListener('focusout', clear);
      document.removeEventListener('click', clear, true);
      window.removeEventListener('blur', clear);
    };
  }, []);

  // Unmounted while empty so it never sits in the a11y tree or eats a hit test.
  if (!label) return null;

  return (
    <div className="link-peek" aria-hidden="true">
      <span className="link-peek__text">{label}</span>
    </div>
  );
}

export default LinkPeek;
