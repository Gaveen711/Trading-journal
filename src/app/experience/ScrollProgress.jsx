import { useEffect, useRef } from 'react';

/** Lightweight route-aware scroll indicator; DOM writes are batched per frame. */
export function ScrollProgress({ pathname }) {
  const progressRef = useRef(null);
  useEffect(() => {
    // Dashboard content has its own dense layout; avoid a distracting global line there.
    if (pathname.startsWith('/app')) return undefined;
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    let frameId = 0;
    // scrollHeight forces layout, and reading it every scroll frame is the
    // expensive case: the reveal observer is mutating attributes at the same
    // time, so the value is always freshly invalidated. It only changes on
    // resize or route change, so measure it there instead.
    let scrollable = 1;
    const measure = () => {
      scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    };
    const updateProgress = () => {
      frameId = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      progressRef.current?.style.setProperty('--ux-scroll-progress', progress);
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateProgress);
    };
    const remeasure = () => {
      measure();
      requestUpdate();
    };
    measure();
    updateProgress();
    // Late-loading content changes the page height after mount.
    const settleId = window.setTimeout(remeasure, 260);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      window.clearTimeout(settleId);
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', remeasure);
    };
  }, [pathname]);
  if (pathname.startsWith('/app')) return null;
  return <div ref={progressRef} className="ux-scroll-progress" aria-hidden="true" />;
}
