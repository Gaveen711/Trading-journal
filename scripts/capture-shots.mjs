#!/usr/bin/env node
// Renders the six marketing screenshots in public/shots from the dev-only
// showcase routes (the real dashboard on in-memory demo data — see
// src/showcase). Usage:
//
//   npm run shots                       # dev server already running on :5173
//   BASE_URL=http://localhost:5174 npm run shots
//   SHOTS_DEBUG_DIR=./tmp npm run shots # also keeps the raw PNGs
//
// Drives headless Chrome (Edge as fallback) over the DevTools protocol with
// Node's built-in WebSocket — no puppeteer download. Never starts or stops a
// dev server: if nothing answers on BASE_URL it says so and exits 1.
//
// Everything the pages draw from the dataset is pinned (clock included), so
// five of the six frames are byte-stable across runs. The dashboard is the
// exception by design: its market strip embeds a live TradingView chart, so
// the spot quote next to it is left live too — a pinned quote beside a live
// chart would contradict it.
//
// Windows: never process.exit() right after fetch — see
// .claude/skills/run-xaujournal/smoke.mjs. process.exitCode is set instead.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { DEMO_NOW } from '../src/showcase/demoData.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'shots');
const BASE_URL = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const DEBUG_DIR = process.env.SHOTS_DEBUG_DIR ? path.resolve(process.env.SHOTS_DEBUG_DIR) : null;
const VERBOSE = process.env.SHOTS_VERBOSE === '1';

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };
const SIZE_LIMIT = 220 * 1024;
const QUALITY_START = 82;
const QUALITY_FLOOR = 70;
const QUALITY_STEP = 4;
const READY_TIMEOUT_MS = 45_000;
const NETWORK_IDLE_MS = 800;
const NETWORK_IDLE_CAP_MS = 8_000;
const SETTLE_MS = 1_500;
const TIMEZONE = 'Europe/London';

const BROWSERS = [
  process.env.BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

// What each capture must show before the shutter fires, on top of the shared
// gate below (showcase data landed, no skeleton or loader, fonts and images in).
const ROUTES = [
  {
    name: 'dashboard',
    path: '/app',
    ready: "!!document.querySelector('.dashboard-activity tbody tr') && !!document.querySelector('.dashboard-analysis-grid canvas')",
  },
  {
    name: 'analytics',
    path: '/app/analytics',
    ready: "document.querySelectorAll('canvas').length >= 4 && document.querySelectorAll('tbody tr').length >= 5",
  },
  {
    name: 'calendar',
    path: '/app/calendar',
    ready: "document.querySelectorAll('button[aria-pressed]').length >= 28 && /[+\\u2212]\\$\\d/.test(document.body.innerText)",
  },
  {
    name: 'history',
    path: '/app/history',
    ready: "document.querySelectorAll('tbody tr').length >= 10",
  },
  {
    name: 'journal',
    path: '/app/journal',
    ready: "/\\d+ entries/.test(document.body.innerText) && document.querySelectorAll('li').length >= 5",
  },
  {
    name: 'sync',
    path: '/app/sync',
    ready: "document.body.innerText.includes('Connected') && !!document.querySelector('img[alt=\"IC Markets logo\"]')",
  },
];

const SHARED_GATE = [
  'window.__showcaseReady === true',
  "!document.querySelector('[data-slot=\"skeleton\"], .loader-wrapper')",
  "document.fonts.status === 'loaded'",
  'Array.from(document.images).every((img) => img.complete)',
];

// Runs before any page script: pins the clock to the dataset's capture
// instant (offset, not frozen — timers still advance) and seeds the
// preferences the capture wants: dark, gold accent, sidebar open, onboarding
// done, showcase opted in.
const BOOTSTRAP = `(() => {
  const FIXED = ${Date.parse(DEMO_NOW)};
  const RealDate = Date;
  const origin = RealDate.now();
  const now = () => FIXED + (RealDate.now() - origin);
  class ShowcaseDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now()])); }
    static now() { return now(); }
  }
  Object.defineProperty(ShowcaseDate, 'name', { value: 'Date' });
  window.Date = ShowcaseDate;
  try {
    localStorage.setItem('xau-theme', 'dark');
    localStorage.setItem('xau-template', 'royal-gold');
    localStorage.setItem('xau-sidebar-expanded', 'true');
    localStorage.setItem('xau-onboarded', '1');
    sessionStorage.setItem('xau-showcase', '1');
  } catch {}
})();`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (...args) => console.log(...args);
const debug = (...args) => { if (VERBOSE) console.log('  ·', ...args); };

async function serverUp() {
  try {
    const response = await fetch(`${BASE_URL}/app`, { signal: AbortSignal.timeout(5_000) });
    const text = await response.text();
    return response.ok && text.includes('<div id="root">');
  } catch {
    return false;
  }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/** Minimal CDP client over the browser websocket; page sessions share it (flatten mode). */
class Cdp {
  #socket;
  #nextId = 1;
  #pending = new Map();
  #listeners = new Set();

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error(`Could not open ${url}`)), { once: true });
    });
    return new Cdp(socket);
  }

  constructor(socket) {
    this.#socket = socket;
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());
      if (message.id && this.#pending.has(message.id)) {
        const { resolve, reject, method } = this.#pending.get(message.id);
        this.#pending.delete(message.id);
        if (message.error) reject(new Error(`${method}: ${message.error.message}`));
        else resolve(message.result);
        return;
      }
      if (message.method) {
        for (const listener of this.#listeners) listener(message);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject, method });
      this.#socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  on(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  close() {
    this.#socket.close();
  }
}

async function launchBrowser() {
  const binary = BROWSERS.find((candidate) => existsSync(candidate));
  if (!binary) throw new Error('No Chrome or Edge found. Set BROWSER_PATH to a Chromium binary.');
  const profile = await mkdtemp(path.join(os.tmpdir(), 'xj-shots-'));
  const port = await freePort();
  const child = spawn(binary, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--lang=en-US',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });

  const deadline = Date.now() + 20_000;
  let version = null;
  while (Date.now() < deadline && !version) {
    try {
      version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    } catch {
      await sleep(200);
    }
  }
  if (!version) {
    child.kill();
    throw new Error(`${path.basename(binary)} did not expose DevTools on port ${port}.`);
  }
  debug(`${path.basename(binary)} ${version.Browser}`);
  const exited = new Promise((resolve) => child.once('exit', resolve));
  return {
    child,
    profile,
    endpoint: version.webSocketDebuggerUrl,
    /** Resolves once the process is gone; kills it if Browser.close did not take within `graceMs`. */
    exited: (graceMs) => new Promise((resolve) => {
      const timer = setTimeout(() => { child.kill(); }, graceMs);
      exited.then(() => { clearTimeout(timer); resolve(); });
    }),
  };
}

async function openPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);

  const inflight = new Set();
  let lastActivity = Date.now();
  const errors = [];
  cdp.on((message) => {
    if (message.sessionId !== sessionId) return;
    const { method, params } = message;
    if (method === 'Network.requestWillBeSent') {
      inflight.add(params.requestId);
      lastActivity = Date.now();
    } else if (method === 'Network.loadingFinished' || method === 'Network.loadingFailed') {
      inflight.delete(params.requestId);
      lastActivity = Date.now();
    } else if (method === 'Runtime.exceptionThrown') {
      errors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'exception');
    } else if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
      errors.push(params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, mobile: false });
  await send('Emulation.setTimezoneOverride', { timezoneId: TIMEZONE });
  await send('Emulation.setLocaleOverride', { locale: 'en-US' });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: BOOTSTRAP });

  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.text);
    return result.value;
  };

  return {
    errors,
    evaluate,
    async navigate(url) {
      errors.length = 0;
      inflight.clear();
      await send('Page.navigate', { url });
    },
    async waitForReady(clauses) {
      const deadline = Date.now() + READY_TIMEOUT_MS;
      const probe = (clause) => evaluate(`(() => { try { return Boolean(${clause}); } catch (e) { return 'ERR ' + e.message; } })()`);
      let last = null;
      while (Date.now() < deadline) {
        try {
          last = await probe(clauses.join(' && '));
          if (last === true) return;
        } catch (error) {
          last = error.message;
        }
        await sleep(250);
      }
      // Name the clause that held the shutter, not just "false".
      const report = [];
      for (const clause of clauses) {
        const value = await probe(clause).catch((error) => error.message);
        if (value !== true) report.push(`${clause} → ${value}`);
      }
      throw new Error(`not ready after ${READY_TIMEOUT_MS / 1000}s: ${report.join('; ') || last}`);
    },
    async waitForNetworkIdle() {
      const cap = Date.now() + NETWORK_IDLE_CAP_MS;
      while (Date.now() < cap) {
        if (inflight.size === 0 && Date.now() - lastActivity >= NETWORK_IDLE_MS) return true;
        await sleep(100);
      }
      return false;
    },
    async screenshot() {
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      return Buffer.from(data, 'base64');
    },
    async close() {
      await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
    },
  };
}

async function encode(png) {
  let quality = QUALITY_START;
  for (;;) {
    const webp = await sharp(png).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (webp.length <= SIZE_LIMIT || quality <= QUALITY_FLOOR) return { webp, quality };
    quality -= QUALITY_STEP;
  }
}

async function captureRoute(page, route) {
  await page.navigate(`${BASE_URL}${route.path}`);
  try {
    await page.waitForReady([...SHARED_GATE, route.ready]);
  } catch (error) {
    if (DEBUG_DIR) await writeFile(path.join(DEBUG_DIR, `${route.name}-failed.png`), await page.screenshot());
    throw error;
  }
  const idle = await page.waitForNetworkIdle();
  debug(`${route.name}: ready${idle ? '' : ' (network still busy)'}`);
  await sleep(SETTLE_MS);
  await page.evaluate('window.scrollTo(0, 0)');
  await sleep(100);
  const png = await page.screenshot();
  const meta = await sharp(png).metadata();
  if (DEBUG_DIR) await writeFile(path.join(DEBUG_DIR, `${route.name}.png`), png);
  const { webp, quality } = await encode(png);
  await writeFile(path.join(OUT_DIR, `${route.name}.webp`), webp);
  return { width: meta.width, height: meta.height, quality, bytes: webp.length, errors: [...page.errors] };
}

async function main() {
  if (!(await serverUp())) {
    console.error(`No dev server at ${BASE_URL}. Start one with \`npm run dev\` (or set BASE_URL), then re-run \`npm run shots\`.`);
    process.exitCode = 1;
    return;
  }
  await mkdir(OUT_DIR, { recursive: true });
  if (DEBUG_DIR) await mkdir(DEBUG_DIR, { recursive: true });

  const browser = await launchBrowser();
  const cdp = await Cdp.connect(browser.endpoint);
  const expected = `${VIEWPORT.width * VIEWPORT.deviceScaleFactor}×${VIEWPORT.height * VIEWPORT.deviceScaleFactor}`;
  let failed = 0;
  try {
    const page = await openPage(cdp);
    for (const route of ROUTES) {
      try {
        const result = await captureRoute(page, route);
        const size = `${result.width}×${result.height}`;
        const over = result.bytes > SIZE_LIMIT ? `  OVER ${(SIZE_LIMIT / 1024).toFixed(0)} KB at the quality floor` : '';
        log(`${route.name.padEnd(10)} ${size}${size === expected ? '' : ' (UNEXPECTED)'}  q${result.quality}  ${(result.bytes / 1024).toFixed(1).padStart(6)} KB${over}`);
        if (over || size !== expected) failed += 1;
        if (VERBOSE && result.errors.length) log('  page errors:', result.errors.join(' | '));
      } catch (error) {
        failed += 1;
        console.error(`${route.name.padEnd(10)} FAILED — ${error.message}`);
        if (page.errors.length) console.error('  page errors:', page.errors.slice(-5).join(' | '));
      }
    }
    await page.close();
  } finally {
    await cdp.send('Browser.close').catch(() => {});
    cdp.close();
    await browser.exited(5_000);
    // The profile is only removable once Chrome has let go of its lock files.
    await rm(browser.profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }).catch(() => {});
  }
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
