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

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
    server: {
      proxy: {
        '/api/analytics': {
          target: 'https://vercel.com',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const token     = env.VITE_VERCEL_TOKEN;
              const projectId = env.VITE_VERCEL_PROJECT_ID;
              const teamId    = env.VITE_VERCEL_TEAM_ID;

              if (token) proxyReq.setHeader('Authorization', `Bearer ${token}`);

              const qs = new URLSearchParams(proxyReq.path.split('?')[1] ?? '');
              if (projectId) qs.set('projectId', projectId);
              if (teamId)    qs.set('teamId', teamId);
              qs.set('environment', 'production');
              qs.set('granularity', '1d');

              proxyReq.path = `/api/web-analytics/timeseries?${qs.toString()}`;
            });
          },
        },
      },
    },
  };
})
