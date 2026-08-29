/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Strips Rollup's virtual-module decorations so the same physical file always
 * yields the same id. Rollup prefixes interop/proxy modules with \0 and an
 * optional `plugin-name:` tag, and Vite appends `?commonjs-*` / `?v=` queries —
 * without this, one file on disk looks like several.
 * The `\w{2,}:` guard is deliberate: it strips `commonjs-proxy:` but not a
 * Windows drive letter, which is always a single character.
 */
function normalizeId(id) {
  return id
    .replace(/\\/g, '/')
    .replace(/^\0/, '')
    .replace(/^\w{2,}:/, '')
    .split('?')[0];
}

/** Owning npm package for a module id, or null for first-party source. */
function packageOf(id) {
  const path = normalizeId(id);
  const marker = '/node_modules/';
  const index = path.lastIndexOf(marker);
  if (index === -1) return null;
  const [head, next] = path.slice(index + marker.length).split('/');
  return head.startsWith('@') ? `${head}/${next}` : head;
}

// React runtime + router: 100% entry-eager on every route, so merging them costs
// nothing and saves a round trip. They change ~never, so this chunk survives app
// deploys in the HTTP cache.
const REACT_VENDOR = new Set([
  'react', 'react-dom', 'scheduler', 'react-is', 'react-router', 'react-router-dom',
]);

// Reachable only from the AnalyticsPage / LogTradePage lazy chunks. Name kept so
// check-bundle-budget.mjs's /^chart-.*\.js$/ still binds.
const CHART_VENDOR = new Set(['chart.js', 'react-chartjs-2']);

// Vendors that must never reach the entry's static graph. Match by exact package
// name — `id.includes('react')` would swallow react-chartjs-2, lucide-react and
// react-router-dom, which is how the chart/React chunk inversion happened.
const EAGER_FORBIDDEN = ['chart.js', 'react-chartjs-2', 'html2canvas'];

/**
 * Asserts the shape of the emitted bundle against Rollup's own module graph —
 * the only authoritative answer to "how many copies of React are there".
 * Two React copies silently break hooks, so this fails the build instead.
 */
function bundleInvariants() {
  return {
    name: 'xj-bundle-invariants',
    apply: 'build',
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((chunk) => chunk.type === 'chunk');

      // 1. React exists exactly once, in exactly one chunk.
      for (const name of ['react', 'react-dom', 'scheduler']) {
        const owners = new Set(); // output chunks containing this package
        const copies = new Set(); // physical node_modules directories
        const dir = `/node_modules/${name}/`;
        for (const chunk of chunks) {
          for (const moduleId of Object.keys(chunk.modules)) {
            if (packageOf(moduleId) !== name) continue;
            const path = normalizeId(moduleId);
            owners.add(chunk.fileName);
            copies.add(path.slice(0, path.lastIndexOf(dir) + dir.length));
          }
        }
        if (owners.size === 0) this.error(`[bundle] "${name}" missing from the build`);
        if (owners.size > 1) {
          this.error(`[bundle] "${name}" split across ${owners.size} chunks: ${[...owners].join(', ')}`);
        }
        if (copies.size > 1) {
          this.error(`[bundle] ${copies.size} physical copies of "${name}": ${[...copies].join(', ')}`);
        }
      }

      // 2. The eager graph must not contain lazy-only vendors. chunk.imports is
      //    static-only, so this walk reproduces exactly the set Vite emits
      //    <link rel="modulepreload"> for.
      const entry = chunks.find((chunk) => chunk.isEntry);
      const eager = new Set();
      const walk = (fileName) => {
        if (eager.has(fileName) || !bundle[fileName]) return;
        eager.add(fileName);
        bundle[fileName].imports.forEach(walk);
      };
      walk(entry.fileName);

      const eagerPackages = new Set();
      for (const fileName of eager) {
        for (const moduleId of Object.keys(bundle[fileName].modules)) {
          const pkg = packageOf(moduleId);
          if (pkg) eagerPackages.add(pkg);
        }
      }
      console.log(`[bundle] eager chunks   : ${[...eager].join(', ')}`);
      console.log(`[bundle] eager packages : ${[...eagerPackages].sort().join(', ')}`);

      const banned = EAGER_FORBIDDEN.filter((pkg) => eagerPackages.has(pkg));
      if (banned.length) {
        this.error(`[bundle] must stay lazy but are in the entry graph: ${banned.join(', ')}`);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [react(), bundleInvariants()],
    server: {
      watch: {
        // The admin project is developed and built independently. Ignoring its
        // generated output prevents Vercel's root dev runtime from crashing on
        // Windows when an admin production build replaces locked dist assets.
        ignored: ['**/admin-dashboard/dist/**', '**/graphify-out/**'],
      },
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'https://xaujournal.vercel.app',
          changeOrigin: true,
        }
      }
    },
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
  resolve: {
    alias: {
      "@": __dirname + "/src",
    },
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Only React and chart.js are placed by hand. Everything else is left to
        // Rollup's reachability analysis, which already keeps Firestore out of
        // the entry graph — naming a `firebase` chunk would drag it back in.
        manualChunks(id) {
          const pkg = packageOf(id);
          if (!pkg) return undefined;                      // app code → route chunks
          if (REACT_VENDOR.has(pkg)) return 'react-vendor';
          if (CHART_VENDOR.has(pkg)) return 'chart';
          return undefined;
        }
      }
    }
  }
}})
