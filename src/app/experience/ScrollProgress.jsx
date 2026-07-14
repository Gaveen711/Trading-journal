import { useEffect, useRef } from 'react';

/** Lightweight route-aware scroll indicator; DOM writes are batched per frame. */
export function ScrollProgress({ pathname }) {
  const progressRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      progressRef.current?.style.setProperty('--ux-scroll-progress', progress);
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    const settleId = window.setTimeout(updateProgress, 260);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.clearTimeout(settleId);
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [pathname]);
  return <div ref={progressRef} className="ux-scroll-progress" aria-hidden="true" />;
}
