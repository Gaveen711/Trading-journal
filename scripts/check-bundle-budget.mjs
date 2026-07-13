import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const budgets = [
  { name: 'entry', pattern: /^index-.*\.js$/, maxKb: 160 },
  { name: 'firebase', pattern: /^firebase-.*\.js$/, maxKb: 90 },
  { name: 'charts', pattern: /^chart-.*\.js$/, maxKb: 65 },
  { name: 'share-image', pattern: /^ShareTradeModal-.*\.js$/, maxKb: 55 },
  { name: 'gsap', pattern: /^gsap-.*\.js$/, maxKb: 47 },
  { name: 'global-css', pattern: /^index-.*\.css$/, maxKb: 40 },
];

let failed = false;
const files = readdirSync(directory);
for (const budget of budgets) {
  const matches = files.filter((file) => budget.pattern.test(file));
  for (const file of matches) {
    const gzipKb = gzipSync(readFileSync(join(directory, file))).byteLength / 1024;
    const ok = gzipKb <= budget.maxKb;
    console.log((ok ? 'PASS' : 'FAIL') + ' ' + budget.name + ': ' + gzipKb.toFixed(2) + ' kB gzip / ' + budget.maxKb + ' kB');
    failed ||= !ok;
  }
}
if (failed) process.exit(1);