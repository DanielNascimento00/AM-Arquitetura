import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

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

  const analyticsDevPlugin = {
    name: 'analytics-dev-proxy',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/analytics', async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        const token     = env.VITE_VERCEL_TOKEN     ?? '';
        const projectId = env.VITE_VERCEL_PROJECT_ID ?? '';
        const teamId    = env.VITE_VERCEL_TEAM_ID    ?? '';

        if (!token || !projectId) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'not_configured' }));
          return;
        }

        const qs      = (req.url ?? '').split('?')[1] ?? '';
        const params  = new URLSearchParams(qs);
        const now     = Date.now();
        const startMs = Number(params.get('startAt') ?? now - 14 * 24 * 60 * 60 * 1000);
        const endMs   = Number(params.get('endAt')   ?? now);

        const vercelParams = new URLSearchParams({
          projectId,
          from:        new Date(startMs).toISOString(),
          to:          new Date(endMs).toISOString(),
          environment: 'production',
          granularity: '1d',
          ...(teamId ? { teamId } : {}),
        });

        const apiUrl = `https://vercel.com/api/web-analytics/timeseries?${vercelParams}`;
        console.log('[Analytics] →', apiUrl);

        try {
          const apiRes = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const text = await apiRes.text();
          console.log('[Analytics] status:', apiRes.status, '| body:', text.slice(0, 400));
          res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
          res.end(text);
        } catch (err) {
          console.error('[Analytics] erro:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'proxy_error' }));
        }
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
