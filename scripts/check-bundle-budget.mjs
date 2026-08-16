import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const htmlPath = fileURLToPath(new URL('../dist/index.html', import.meta.url));

// Ceilings are ~8-10% above the measured size, so ordinary drift is fine and a
// structural regression is not.
const budgets = [
  { name: 'entry', pattern: /^index-.*\.js$/, maxKb: 45 },
  { name: 'react-vendor', pattern: /^react-vendor-.*\.js$/, maxKb: 76 },
  { name: 'charts', pattern: /^chart-.*\.js$/, maxKb: 62 },
  { name: 'share-image', pattern: /^ShareTradeModal-.*\.js$/, maxKb: 52 },
  // Was temporarily raised 40 → 48 during the Console rebuild. Cutting the
  // App → PublicNavbar → PublicSite.css edge moved 1094 lines of marketing CSS
  // into a lazy chunk, which put this back under the original 40 target.
  { name: 'global-css', pattern: /^index-.*\.css$/, maxKb: 42 },
];

// Everything the browser must fetch before it can paint. This is the number that
// actually regressed when chart.js got folded in with React, and the only one a
// per-chunk budget cannot catch: every individual chunk stayed under its limit
// the whole time.
const EAGER_BUDGET_KB = 158;

const gzipKb = (file) => gzipSync(readFileSync(join(directory, file))).byteLength / 1024;

let failed = false;
const files = readdirSync(directory);

for (const budget of budgets) {
  const matches = files.filter((file) => budget.pattern.test(file));
  // A pattern that matches nothing used to pass silently, which meant renaming a
  // chunk switched its budget off rather than failing.
  if (matches.length === 0) {
    console.log(`FAIL ${budget.name}: pattern ${budget.pattern} matched no files (renamed chunk?)`);
    failed = true;
    continue;
  }
  for (const file of matches) {
    const size = gzipKb(file);
    const ok = size <= budget.maxKb;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${budget.name}: ${size.toFixed(2)} kB gzip / ${budget.maxKb} kB`);
    failed ||= !ok;
  }
}

const html = readFileSync(htmlPath, 'utf8');
const eager = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+)"/g)].map((match) => match[1]);
const eagerKb = eager.reduce((total, file) => total + gzipKb(file), 0);
const eagerOk = eagerKb <= EAGER_BUDGET_KB;
console.log(`${eagerOk ? 'PASS' : 'FAIL'} eager-total: ${eagerKb.toFixed(2)} kB gzip / ${EAGER_BUDGET_KB} kB`);
console.log(`     eager assets: ${eager.join(', ')}`);
failed ||= !eagerOk;

if (failed) process.exit(1);
