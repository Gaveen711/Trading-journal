import { useEffect, useState } from 'react';

/* ————————————————————————————————————————————————————————————
   Gold session engine for the public "dealing desk" site.
   The session clock is the brand signature: gold trades through
   four sessions around the clock, and the site knows which one
   is open right now.
   ———————————————————————————————————————————————————————————— */

/* The exchange-local session engine lives in sessionEngine.js because this file
   imports React, and api/ must resolve session tags at ingest. The names are
   re-exported here so there is still one import site for session logic; the
   legacy UTC-hour model below (GOLD_SESSIONS, isMarketClosed and friends) is what
   the public Vitrine site renders and is deliberately left untouched. New code
   uses the engine — in particular isWeekendRestAt, not isMarketClosed. */
export {
  SESSION_ENGINE_VERSION,
  SESSION_CODES,
  TRADING_SESSIONS,
  sessionCodeForHubs,
  resolveSessionAt,
  isWeekendRestAt,
  sessionUtcWindow,
} from './sessionEngine.js';

/** Classic UTC session windows for spot gold. */
export const GOLD_SESSIONS = [
  { id: 'syd', city: 'Sydney', tz: 'Australia/Sydney', open: 21, close: 6 },
  { id: 'tok', city: 'Tokyo', tz: 'Asia/Tokyo', open: 0, close: 9 },
  { id: 'lon', city: 'London', tz: 'Europe/London', open: 7, close: 16 },
  { id: 'ny', city: 'New York', tz: 'America/New_York', open: 12, close: 21 },
];

/** Spot gold rests from Friday 21:00 UTC until Sunday 22:00 UTC. */
export function isMarketClosed(now) {
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  return (day === 5 && hour >= 21) || day === 6 || (day === 0 && hour < 22);
}

export function isSessionOpen(session, now) {
  if (isMarketClosed(now)) return false;
  const hour = now.getUTCHours();
  return session.open < session.close
    ? hour >= session.open && hour < session.close
    : hour >= session.open || hour < session.close;
}

/** Next session to open, as { city, minutes } — or the Sunday reopen during the weekend rest. */
export function getNextOpen(now) {
  if (isMarketClosed(now)) {
    const reopen = new Date(now);
    reopen.setUTCHours(22, 0, 0, 0);
    while (reopen.getUTCDay() !== 0 || reopen <= now) reopen.setUTCDate(reopen.getUTCDate() + 1);
    // The Sunday 22:00 UTC reopen is the Sydney desk coming back first.
    return { city: 'Sydney', minutes: Math.max(1, Math.round((reopen - now) / 60000)) };
  }
  let best = null;
  for (const session of GOLD_SESSIONS) {
    if (isSessionOpen(session, now)) continue;
    const candidate = new Date(now);
    candidate.setUTCHours(session.open, 0, 0, 0);
    if (candidate <= now) candidate.setUTCDate(candidate.getUTCDate() + 1);
    const minutes = Math.round((candidate - now) / 60000);
    if (!best || minutes < best.minutes) best = { city: session.city, minutes };
  }
  return best;
}

export function formatWait(minutes) {
  if (minutes >= 2880) return `${Math.round(minutes / 1440)} days`;
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
  return `${minutes}m`;
}

const pad = (value) => String(value).padStart(2, '0');

export function formatUtc(now, withSeconds = true) {
  const base = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
  return withSeconds ? `${base}:${pad(now.getUTCSeconds())}` : base;
}

export function sessionHours(session) {
  return `${pad(session.open)}—${pad(session.close)}`;
}

/**
 * Ticking clock. One interval per mounted consumer; cheap and honest.
 * Pauses while the tab is hidden — the landing page mounts several of these, and
 * re-rendering them into a background tab burns battery for nobody. Resyncs
 * before restarting so the first visible frame is never stale.
 */
export function useUtcClock(tickMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let id = 0;
    const stop = () => {
      if (id) window.clearInterval(id);
      id = 0;
    };
    const start = () => {
      stop();
      id = window.setInterval(() => setNow(new Date()), tickMs);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stop();
        return;
      }
      setNow(new Date());
      start();
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tickMs]);
  return now;
}

/** One-time scroll reveal for `.xj-reveal` nodes. Respects reduced motion. */
export function useDeskReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('.xj-reveal');
    if (!targets.length) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.16, rootMargin: '0px 0px -4% 0px' },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
