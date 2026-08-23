// Builds public/og.png (1200×630) — the social card every public route shares.
// Composes the real dashboard capture from public/shots onto the Vitrine ground.
// Run after `npm run shots`:  node scripts/build-og.mjs
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shot = path.join(root, 'public', 'shots', 'dashboard.webp');
const out = path.join(root, 'public', 'og.png');

const W = 1200;
const H = 630;

async function main() {
  if (!existsSync(shot)) {
    console.error(`missing ${shot} — run \`npm run shots\` first`);
    process.exitCode = 1;
    return;
  }
  const { default: sharp } = await import('sharp');

  // The plate: the capture scaled to 860px wide, top-left anchored, under a
  // 1px glass hairline with rounded corners. It bleeds off the bottom-right.
  const plateW = 860;
  const plateH = Math.round((plateW * 900) / 1440);
  const radius = 14;
  const plate = await sharp(shot)
    .resize(plateW, plateH, { fit: 'cover', position: 'left top' })
    .composite([{
      input: Buffer.from(
        `<svg width="${plateW}" height="${plateH}">
           <rect x="0.5" y="0.5" width="${plateW - 1}" height="${plateH - 1}" rx="${radius}" ry="${radius}"
                 fill="none" stroke="rgba(255,255,255,0.16)"/>
         </svg>`,
      ),
      blend: 'over',
    }])
    .png()
    .toBuffer();

  // Round the plate's corners with an alpha mask.
  const mask = Buffer.from(
    `<svg width="${plateW}" height="${plateH}">
       <rect width="${plateW}" height="${plateH}" rx="${radius}" ry="${radius}" fill="#fff"/>
     </svg>`,
  );
  const rounded = await sharp(plate)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const text = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0" stop-color="#0d0f12"/>
           <stop offset="1" stop-color="#08090b"/>
         </linearGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="url(#g)"/>
       <text x="72" y="96" font-family="Consolas, 'Courier New', monospace" font-size="16" letter-spacing="3"
             fill="#8d939a">XAU/USD · TRADING JOURNAL</text>
       <text x="72" y="178" font-family="Georgia, 'Times New Roman', serif" font-size="58" fill="#eceae4">
         xau<tspan fill="#e2a63d">/</tspan>journal</text>
       <text x="72" y="236" font-family="Georgia, 'Times New Roman', serif" font-size="32" fill="#eceae4">
         The journal that knows which</text>
       <text x="72" y="278" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-style="italic" fill="#eceae4">
         session <tspan font-style="normal">pays you.</tspan></text>
       <text x="72" y="334" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#8d939a">
         MT4 / MT5 auto-sync · sessions · setups · discipline rules</text>
       <circle cx="78" cy="382" r="4" fill="#e2a63d"/>
       <text x="92" y="387" font-family="Consolas, 'Courier New', monospace" font-size="14" letter-spacing="2"
             fill="#e2a63d">FREE PLAN · NO CARD</text>
     </svg>`,
  );

  const card = await sharp({ create: { width: W, height: H, channels: 4, background: '#08090b' } })
    .composite([
      { input: text, top: 0, left: 0 },
      { input: rounded, top: 352, left: 500 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, card);
  console.log(`wrote ${path.relative(root, out)} (${(card.length / 1024).toFixed(0)} KB)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
