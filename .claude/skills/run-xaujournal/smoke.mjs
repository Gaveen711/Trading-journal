#!/usr/bin/env node
// Smoke-check the xaujournal dev server. Usage:
//   node .claude/skills/run-xaujournal/smoke.mjs
//   BASE_URL=http://localhost:5174 node .claude/skills/run-xaujournal/smoke.mjs
// Exits 0 when every check passes, 1 otherwise. Needs Node 18+ (global fetch).
// Note: auth is client-side (React Router), so every route returns the SPA
// shell with HTTP 200 — these checks prove the server serves the app, not
// that a given route renders. Use the browser pane for rendered-state checks.

const base = process.env.BASE_URL || 'http://localhost:5173';

const checks = [
  ['/', (t) => t.includes('<div id="root">'), 'SPA root div served'],
  ['/', (t) => /xaujournal/i.test(t), 'brand title present'],
  ['/pricing', (t) => t.includes('<div id="root">'), 'public route serves SPA shell'],
  ['/app', (t) => t.includes('<div id="root">'), 'app route serves SPA shell (auth gate is client-side)'],
];

let failed = 0;
for (const [path, test, label] of checks) {
  try {
    const res = await fetch(base + path);
    const text = await res.text();
    const ok = res.ok && test(text);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${path} — ${label} (HTTP ${res.status})`);
    if (!ok) failed++;
  } catch (err) {
    console.log(`FAIL ${path} — ${label} (${err.message})`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed. Is the dev server running on ${base}? Start it with: npm run dev`);
}
// Set exitCode instead of calling process.exit(): an abrupt exit right after
// fetch crashes Node on Windows with "Assertion failed: !(handle->flags &
// UV_HANDLE_CLOSING), file src\win\async.c" (libuv teardown race).
process.exitCode = failed ? 1 : 0;
