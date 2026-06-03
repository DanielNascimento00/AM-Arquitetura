import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import Redis from 'ioredis'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  let redisClient: Redis | null = null;
  const getRedis = () => {
    if (!redisClient) {
      const url = env.STORAGE_REDIS_URL;
      if (!url) return null;
      redisClient = new Redis(url, {
        tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
        maxRetriesPerRequest: 2,
      });
    }
    return redisClient;
  };

  const analyticsDevPlugin = {
    name: 'analytics-dev-proxy',
    configureServer(server: import('vite').ViteDevServer) {
      // GET /api/analytics — retorna últimos 14 dias
      server.middlewares.use('/api/analytics', async (_req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        const r = getRedis();
        if (!r) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'STORAGE_REDIS_URL não configurado no .env' }));
          return;
        }
        try {
          const days = [];
          for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const [, month, day] = dateStr.split('-');
            const count = Number((await r.get(`visits:${dateStr}`)) ?? 0);
            days.push({ key: `${day}/${month}`, total: count });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ data: days }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // POST /api/track — incrementa visita do dia
      server.middlewares.use('/api/track', async (_req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        const r = getRedis();
        if (r) {
          const key = `visits:${new Date().toISOString().split('T')[0]}`;
          await r.incr(key).catch(() => {});
          await r.expire(key, 7_776_000).catch(() => {});
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      });
    },
  };

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
      analyticsDevPlugin,
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  };
})
