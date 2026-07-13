const SAMPLE_RATE = 0.05;

const ratingFor = (name, value) => {
  const thresholds = {
    LCP: [2500, 4000],
    CLS: [0.1, 0.25],
    INP: [200, 500],
    FCP: [1800, 3000],
  }[name];
  if (!thresholds) return 'unknown';
  return value <= thresholds[0] ? 'good' : value <= thresholds[1] ? 'needs-improvement' : 'poor';
};

export function observeRouteWebVitals(route) {
  if (typeof PerformanceObserver === 'undefined' || Math.random() > SAMPLE_RATE) return () => {};
  const metrics = new Map();
  const observers = [];

  const record = (name, value) => metrics.set(name, Math.max(metrics.get(name) || 0, value));
  const observe = (type, handler, options = {}) => {
    if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return;
    const observer = new PerformanceObserver((list) => handler(list.getEntries()));
    observer.observe({ type, buffered: true, ...options });
    observers.push(observer);
  };

  observe('largest-contentful-paint', (entries) => {
    const last = entries.at(-1);
    if (last) metrics.set('LCP', last.startTime);
  });
  observe('layout-shift', (entries) => {
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) metrics.set('CLS', (metrics.get('CLS') || 0) + entry.value);
    });
  });
  observe('event', (entries) => entries.forEach((entry) => record('INP', entry.duration)), { durationThreshold: 40 });
  observe('paint', (entries) => {
    const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) metrics.set('FCP', fcp.startTime);
  });

  const flush = () => {
    metrics.forEach((value, name) => {
      const payload = JSON.stringify({ name, value, route, rating: ratingFor(name, value) });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/vitals', new Blob([payload], { type: 'application/json' }));
    });
    metrics.clear();
  };
  const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    flush();
    observers.forEach((observer) => observer.disconnect());
    document.removeEventListener('visibilitychange', onVisibility);
  };
}