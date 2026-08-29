import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin, type ProxyOptions } from 'vite';

const ADMIN_HOST = '127.0.0.1';
const ADMIN_PORT = 4174;
const DEFAULT_PROXY_TARGET = 'http://127.0.0.1:3000';
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

function parseAllowedHosts(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

function parseSafeOrigin(value: string, label: string, allowedHosts: Set<string>): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`[admin config] ${label} must be an absolute http(s) origin.`);
  }

  const hostname = url.hostname.toLowerCase();
  const isLoopback = LOOPBACK_HOSTS.has(hostname);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`[admin config] ${label} must use http or https.`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`[admin config] ${label} must not contain credentials, a query, or a fragment.`);
  }
  if (url.pathname !== '/' && url.pathname !== '') {
    throw new Error(`[admin config] ${label} must be an origin without a path.`);
  }
  if (url.protocol === 'http:' && !isLoopback) {
    throw new Error(`[admin config] ${label} may use plain HTTP only for a loopback host.`);
  }
  if (!isLoopback && !allowedHosts.has(hostname)) {
    throw new Error(
      `[admin config] ${label} host "${hostname}" is not allowlisted. ` +
        'Add that exact hostname to ADMIN_DEV_PROXY_ALLOWED_HOSTS.',
    );
  }

  return url;
}

function validateDirectApiBase(value: string, allowedHosts: Set<string>): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      '[admin config] VITE_ADMIN_DEV_API_BASE_URL must be /api/admin or an absolute API URL.',
    );
  }

  const isLoopback = LOOPBACK_HOSTS.has(url.hostname.toLowerCase());
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
    throw new Error(
      '[admin config] A direct admin API URL must use HTTPS, except for a loopback origin.',
    );
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      '[admin config] VITE_ADMIN_DEV_API_BASE_URL must not contain credentials, a query, or a fragment.',
    );
  }
  if (!url.pathname.replace(/\/$/, '').endsWith('/api/admin')) {
    throw new Error('[admin config] A direct admin API URL must end with /api/admin.');
  }
  if (!isLoopback && !allowedHosts.has(url.hostname.toLowerCase())) {
    throw new Error(
      `[admin config] Direct admin API host "${url.hostname}" is not allowlisted. ` +
        'Add that exact hostname to ADMIN_DEV_PROXY_ALLOWED_HOSTS.',
    );
  }

  return url;
}

function topologyNotice(message: string): Plugin {
  return {
    name: 'xaujournal-admin-topology',
    configureServer(server) {
      server.config.logger.info(`\n[admin topology] ${message}`);
      server.config.logger.info(
        `[admin topology] UI: http://${ADMIN_HOST}:${ADMIN_PORT} (loopback only)`,
      );
      server.config.logger.info(
        '[admin topology] Run "npm run smoke:local -- --route-only" after both dev servers start.\n',
      );
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devApiBase = (env.VITE_ADMIN_DEV_API_BASE_URL || '/api/admin').trim();
  const usesLocalProxy = devApiBase.startsWith('/');
  const allowedHosts = parseAllowedHosts(env.ADMIN_DEV_PROXY_ALLOWED_HOSTS);
  let proxy: Record<string, string | ProxyOptions> | undefined;
  let topology: string;

  if (command === 'serve' && usesLocalProxy) {
    if (devApiBase.replace(/\/$/, '') !== '/api/admin') {
      throw new Error(
        '[admin config] Relative VITE_ADMIN_DEV_API_BASE_URL must be exactly /api/admin.',
      );
    }

    const target = parseSafeOrigin(
      (env.ADMIN_DEV_PROXY_TARGET || DEFAULT_PROXY_TARGET).trim(),
      'ADMIN_DEV_PROXY_TARGET',
      allowedHosts,
    );

    proxy = {
      '/api': {
        target: target.origin,
        changeOrigin: !LOOPBACK_HOSTS.has(target.hostname.toLowerCase()),
        secure: true,
        configure(proxyServer) {
          proxyServer.on('error', (_error, request) => {
            const path = request.url?.split('?')[0] ?? '/api';
            console.error(
              `[admin proxy] ${path} could not reach ${target.origin}. ` +
                'Start the upstream server or run the local smoke check.',
            );
          });
        },
      },
    };
    topology = `${devApiBase} -> ${target.origin}`;
  } else if (command === 'serve') {
    const directApi = validateDirectApiBase(devApiBase, allowedHosts);
    topology = `browser -> ${directApi.origin}${directApi.pathname.replace(/\/$/, '')} (CORS required)`;
  } else {
    topology = 'production build uses VITE_ADMIN_API_BASE_URL; no development proxy is embedded';
  }

  return {
    plugins: [tailwindcss(), react(), topologyNotice(topology)],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      host: ADMIN_HOST,
      port: ADMIN_PORT,
      strictPort: true,
      proxy,
    },
    preview: {
      host: ADMIN_HOST,
      port: ADMIN_PORT,
      strictPort: true,
    },
    build: {
      sourcemap: false,
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
  };
});
