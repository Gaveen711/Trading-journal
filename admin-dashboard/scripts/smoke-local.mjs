import process from 'node:process';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const TIMEOUT_MS = 8_000;
const ROUTE_ONLY = process.argv.includes('--route-only');
const UI_URL = process.env.ADMIN_SMOKE_UI_URL || 'http://127.0.0.1:4174';
const API_PATH = process.env.ADMIN_SMOKE_API_PATH || '/api/admin/health';

function fail(message) {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function parseLocalUiUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('ADMIN_SMOKE_UI_URL must be an absolute loopback http URL.');
  }

  if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('ADMIN_SMOKE_UI_URL is restricted to a loopback HTTP origin.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('ADMIN_SMOKE_UI_URL must not contain credentials, a query, or a fragment.');
  }
  return url;
}

function parseApiPath(value) {
  if (!value.startsWith('/api/admin/')) {
    throw new Error('ADMIN_SMOKE_API_PATH must begin with /api/admin/.');
  }
  const url = new URL(value, 'http://local.invalid');
  if (url.origin !== 'http://local.invalid' || url.search || url.hash) {
    throw new Error('ADMIN_SMOKE_API_PATH must be a relative path without a query or fragment.');
  }
  return url.pathname;
}

async function fetchChecked(url, init = {}) {
  try {
    return await fetch(url, {
      ...init,
      redirect: 'error',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown network error';
    throw new Error(`${url.pathname} is unreachable (${detail})`);
  }
}

async function readHiddenToken() {
  const environmentToken = process.env.ADMIN_SMOKE_ID_TOKEN?.trim();
  if (environmentToken) return environmentToken;

  if (!process.stdin.isTTY || !process.stdout.isTTY || !process.stdin.setRawMode) {
    throw new Error(
      'An authenticated smoke check needs an interactive terminal or ADMIN_SMOKE_ID_TOKEN.',
    );
  }

  process.stdout.write('Paste a short-lived Firebase admin ID token (input hidden): ');
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return await new Promise((resolve, reject) => {
    let value = '';

    const finish = (error) => {
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(value.trim());
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          finish(new Error('authenticated smoke check cancelled'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        if (character >= ' ' && character <= '~') value += character;
      }
    };

    process.stdin.on('data', onData);
  });
}

async function checkUi(uiOrigin) {
  const loginUrl = new URL('/login', uiOrigin);
  const response = await fetchChecked(loginUrl, {
    headers: { Accept: 'text/html' },
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`admin UI returned HTTP ${response.status}`);
  }
  if (!response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('admin UI did not return HTML');
  }
  if (!body.includes('id="root"')) {
    throw new Error('admin UI HTML is missing the React root element');
  }

  pass(`admin UI shell is serving on ${uiOrigin.origin}`);
}

async function checkApi(uiOrigin, apiPath) {
  const apiUrl = new URL(apiPath, uiOrigin);
  const headers = { Accept: 'application/json' };

  if (!ROUTE_ONLY) {
    const token = await readHiddenToken();
    if (!token) throw new Error('an empty token cannot authenticate the admin health check');
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchChecked(apiUrl, { headers });

  if (ROUTE_ONLY) {
    if (![401, 403].includes(response.status)) {
      throw new Error(
        `unauthenticated admin API probe returned HTTP ${response.status}; expected 401 or 403`,
      );
    }
    pass('admin API route is reachable and rejects an unauthenticated request');
    return;
  }

  if (!response.ok) {
    throw new Error(`authenticated admin API health check returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('authenticated admin API health check did not return JSON');
  }

  pass('authenticated admin API health check succeeded (token was not logged)');
}

async function main() {
  const uiOrigin = parseLocalUiUrl(UI_URL);
  const apiPath = parseApiPath(API_PATH);

  await checkUi(uiOrigin);
  await checkApi(uiOrigin, apiPath);
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : 'smoke check failed');
}
