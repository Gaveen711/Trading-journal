import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminDirectory = path.join(rootDirectory, 'admin-dashboard');
const apiEntry = path.join(rootDirectory, 'scripts', 'dev-admin-api.mjs');
const vercelEntry = path.join(rootDirectory, 'node_modules', 'vercel', 'dist', 'index.js');
const adminViteEntry = path.join(adminDirectory, 'node_modules', 'vite', 'bin', 'vite.js');

const requiredFiles = [
  [apiEntry, 'local admin API launcher'],
  [vercelEntry, 'root Vercel CLI dependency'],
  [adminViteEntry, 'admin-dashboard dependencies'],
];
const missing = requiredFiles.filter(([filePath]) => !existsSync(filePath));

if (missing.length > 0) {
  for (const [, label] of missing) console.error(`[admin dev] Missing ${label}.`);
  console.error('[admin dev] Run npm install, then npm install --prefix admin-dashboard.');
  process.exitCode = 1;
} else if (process.argv.includes('--check')) {
  console.log('[admin dev] Ready: UI http://127.0.0.1:4174 -> API http://127.0.0.1:3000');
} else {
  const children = new Set();
  let stopping = false;

  const start = (name, entry, args = [], cwd = rootDirectory) => {
    const child = spawn(process.execPath, [entry, ...args], {
      cwd,
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    });
    children.add(child);
    child.once('error', (error) => {
      console.error(`[admin dev] ${name} failed to start: ${error.message}`);
      process.exitCode = 1;
      stopAll('SIGTERM');
    });
    child.once('exit', (code, signal) => {
      children.delete(child);
      if (!stopping) {
        console.error(`[admin dev] ${name} stopped (${signal || `exit ${code ?? 'unknown'}`}).`);
        process.exitCode = code ?? 1;
        stopAll('SIGTERM');
      }
    });
    return child;
  };

  const waitForPort = (port, timeoutMs = 10_000) => new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const probe = () => {
      const socket = net.createConnection({ host: '127.0.0.1', port });
      socket.setTimeout(500);
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      const retry = () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) reject(new Error(`port ${port} did not become ready`));
        else setTimeout(probe, 150);
      };
      socket.once('error', retry);
      socket.once('timeout', retry);
    };
    probe();
  });

  const stopAll = (signal) => {
    if (!stopping) stopping = true;
    for (const child of children) {
      if (!child.killed) child.kill(signal);
    }
  };

  process.once('SIGINT', () => {
    process.exitCode = 0;
    stopAll('SIGINT');
  });
  process.once('SIGTERM', () => {
    process.exitCode = 0;
    stopAll('SIGTERM');
  });

  console.log('[admin dev] Starting UI http://127.0.0.1:4174 and API http://127.0.0.1:3000');
  start(
    'admin UI',
    adminViteEntry,
    ['--host', '127.0.0.1', '--port', '4174', '--strictPort'],
    adminDirectory,
  );
  try {
    await waitForPort(4174);
    if (!stopping) start('admin API', apiEntry);
  } catch (error) {
    console.error(`[admin dev] Admin UI did not become ready: ${error.message}`);
    process.exitCode = 1;
    stopAll('SIGTERM');
  }
}
