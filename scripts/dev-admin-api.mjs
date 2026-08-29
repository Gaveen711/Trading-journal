import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const environmentPath = path.join(rootDirectory, '.env.local');
const vercelEntry = path.join(rootDirectory, 'node_modules', 'vercel', 'dist', 'index.js');

function loadEnvironmentFile(filePath) {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(filePath);
    return;
  }

  const source = readFileSync(filePath, 'utf8');
  for (const rawLine of source.split(/\r?\n/)) {
    const match = rawLine.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    let value = (match[2] ?? '').trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'" || quote === '`') && value.endsWith(quote)) {
      value = value.slice(1, -1);
      if (quote === '"') value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    process.env[match[1]] = value;
  }
}

let environmentLoaded = false;
try {
  if (!existsSync(environmentPath)) throw new Error('missing env file');
  loadEnvironmentFile(environmentPath);
  environmentLoaded = true;
} catch {
  console.error('[admin api] Unable to load the root .env.local file.');
  process.exitCode = 1;
}

if (environmentLoaded && !process.env.FIREBASE_SERVICE_ACCOUNT?.trim()) {
  console.error('[admin api] FIREBASE_SERVICE_ACCOUNT is required for local admin API routes.');
  process.exitCode = 1;
} else if (environmentLoaded && !existsSync(vercelEntry)) {
  console.error('[admin api] Vercel CLI is missing. Run npm install at the repository root.');
  process.exitCode = 1;
} else if (environmentLoaded) {
  const child = spawn(process.execPath, [
    vercelEntry,
    'dev',
    '--local',
    '--listen',
    '127.0.0.1:3000',
    '--yes',
    '--no-color',
  ], {
    cwd: rootDirectory,
    env: { ...process.env, XAU_ADMIN_LOCAL_API_RUNTIME: '1' },
    stdio: 'inherit',
    windowsHide: true,
  });

  const forward = (signal) => {
    if (!child.killed) child.kill(signal);
  };
  process.once('SIGINT', () => forward('SIGINT'));
  process.once('SIGTERM', () => forward('SIGTERM'));
  child.once('error', (error) => {
    console.error(`[admin api] Failed to start the local Vercel runtime: ${error.message}`);
    process.exitCode = 1;
  });
  child.once('exit', (code, signal) => {
    if (signal) process.exitCode = 1;
    else process.exitCode = code ?? 1;
  });
}
