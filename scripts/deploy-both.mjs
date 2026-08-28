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
  console.log(`Usage: npm run deploy:all -- [options]

Options:
  --prod             Deploy both projects to production.
  --preview          Deploy both projects as preview deployments (default).
  --public           Deploy only the public Vercel project.
  --admin            Deploy only the admin Vercel project.
  --with-firebase    Also deploy Firebase functions, Firestore rules, and Storage rules.
  --skip-build       Skip local public/admin builds before deploying.
  --help              Show this help.

Examples:
  npm run deploy:all -- --preview
  npm run deploy:all -- --prod
  npm run deploy:all -- --prod --with-firebase
  npm run deploy:all -- --admin --preview

Admin Vercel setup:
  Link the admin Vercel project once with 'vercel link' from admin-dashboard/, or set
  VERCEL_ADMIN_PROJECT_ID and VERCEL_ORG_ID in the environment.`);
}

function run(command, args, cwd, env = process.env) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
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
        run(vercelCommand, vercelArgs, rootDir);
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
        const adminProjectFile = resolve(adminDir, '.vercel', 'project.json');
        if (adminProjectId) {
          adminEnv.VERCEL_PROJECT_ID = adminProjectId;
        } else if (!existsSync(adminProjectFile)) {
          throw new Error('Admin Vercel project is not linked. Run `vercel link` from admin-dashboard/ or set VERCEL_ADMIN_PROJECT_ID.');
        }
        run(vercelCommand, vercelArgs, adminDir, adminEnv);
      }

      console.log(`\nDeployment complete (${production ? 'production' : 'preview'}).`);
    } catch (error) {
      console.error(`\nDeployment stopped: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
}
