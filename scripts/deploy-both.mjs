#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const adminDir = resolve(rootDir, 'admin-dashboard');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const vercelCommand = process.platform === 'win32'
  ? resolve(rootDir, 'node_modules', '.bin', 'vercel.cmd')
  : resolve(rootDir, 'node_modules', '.bin', 'vercel');

function usage() {
  console.log(`Usage:
  npm run deploy                  Deploy both Vercel projects to production.
  npm run deploy:all -- [options] Advanced/preview deployment control.

Options:
  --prod             Deploy both projects to production.
  --preview          Deploy both projects as preview deployments (default).
  --public           Deploy only the public Vercel project.
  --admin            Deploy only the admin Vercel project.
  --with-firebase    Also deploy Firebase functions, Firestore rules, and Storage rules.
  --skip-build       Skip local public/admin builds before deploying.
  --help              Show this help.

Examples:
  npm run deploy
  npm run deploy:all -- --preview
  npm run deploy:all -- --prod
  npm run deploy:all -- --prod --with-firebase
  npm run deploy:all -- --admin --preview

Admin Vercel setup:
  Link the admin Vercel project once with 'vercel link' from admin-dashboard/, or set
  VERCEL_ADMIN_PROJECT_ID and VERCEL_ADMIN_ORG_ID in the environment.`);
}

function run(command, args, cwd, env = process.env) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  // Windows .cmd shims (npm, npx, and the local Vercel CLI) cannot be
  // spawned directly by Node. Running them through cmd.exe keeps the same
  // argument contract as Unix while avoiding spawnSync EINVAL on Windows.
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed with exit code ${result.status ?? 'unknown'}.`);
}

function firebaseDefaultProject() {
  const configPath = resolve(rootDir, '.firebaserc');
  if (!existsSync(configPath)) return 'xaujournal29';
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return config.projects?.default || 'xaujournal29';
  } catch {
    return 'xaujournal29';
  }
}

const args = new Set(process.argv.slice(2));
if (args.has('--help') || args.has('-h')) {
  usage();
  process.exitCode = 0;
} else {
  const deployPublic = !args.has('--admin');
  const deployAdmin = !args.has('--public');
  const production = args.has('--prod');

  if (production && args.has('--preview')) {
    console.error('Choose either --prod or --preview, not both.');
    process.exitCode = 1;
  } else if (!existsSync(vercelCommand)) {
    console.error('Vercel CLI is missing. Run npm ci at the repository root first.');
    process.exitCode = 1;
  } else {
    try {
      if (!args.has('--skip-build')) {
        if (deployPublic) run(npmCommand, ['run', 'build'], rootDir);
        if (deployAdmin) run(npmCommand, ['run', 'admin:build'], rootDir);
      }

      const vercelArgs = ['deploy', '--yes'];
      if (production) vercelArgs.push('--prod');

      if (deployPublic) {
        const publicEnv = { ...process.env };
        // VERCEL_ORG_ID + VERCEL_PROJECT_ID is a global Vercel pair. When an
        // admin-only project ID is provided, do not leak its org ID into the
        // public deployment or Vercel rejects the incomplete public pair.
        if (publicEnv.VERCEL_ADMIN_PROJECT_ID && !publicEnv.VERCEL_PROJECT_ID) {
          delete publicEnv.VERCEL_ORG_ID;
        }
        run(vercelCommand, vercelArgs, rootDir, publicEnv);
      }

      if (args.has('--with-firebase')) {
        const firebaseProject = process.env.FIREBASE_PROJECT || firebaseDefaultProject();
        const firebaseArgs = [
          '--yes', 'firebase-tools', 'deploy',
          '--only', 'functions,firestore:rules,storage',
          '--project', firebaseProject,
        ];
        run(process.platform === 'win32' ? 'npx.cmd' : 'npx', firebaseArgs, rootDir);
      }

      if (deployAdmin) {
        const adminEnv = { ...process.env };
        const adminProjectId = adminEnv.VERCEL_ADMIN_PROJECT_ID;
        const adminOrgId = adminEnv.VERCEL_ADMIN_ORG_ID || adminEnv.VERCEL_ORG_ID;
        if (adminProjectId) {
          adminEnv.VERCEL_PROJECT_ID = adminProjectId;
          if (adminOrgId) adminEnv.VERCEL_ORG_ID = adminOrgId;
        }
        // Vercel CLI 58+ may record a Git-aware project link outside the
        // legacy .vercel/project.json file. Let the CLI resolve that link when
        // an explicit admin project ID is not supplied.
        run(vercelCommand, vercelArgs, adminDir, adminEnv);
      }

      console.log(`\nDeployment complete (${production ? 'production' : 'preview'}).`);
    } catch (error) {
      console.error(`\nDeployment stopped: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
}
