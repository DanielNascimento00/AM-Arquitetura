import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { Readable } from 'stream'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import Redis from 'ioredis'
import projectsHandler from './api/projects'
import { validateAdminRequest, computeToken } from './api/_adminAuth'

type LeadStatus = 'novo' | 'contato' | 'fechado' | 'perdido'

interface Lead {
  id: number
  name: string
  email: string
  phone: string
  message: string
  date: string
  status: LeadStatus
}

const LEADS_KEY = 'leads'
const leadStatuses: LeadStatus[] = ['novo', 'contato', 'fechado', 'perdido']

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
  let memoryLeads: Lead[] = [];

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

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

  const sanitize = (value: unknown) => String(value ?? '').trim().slice(0, 1000);

  const readBody = (req: import('http').IncomingMessage) =>
    new Promise<Record<string, unknown>>((resolve) => {
      let raw = '';
      req.on('data', (chunk) => { raw += chunk; });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });

  const syncServerEnv = () => {
    if (env.STORAGE_REDIS_URL) process.env.STORAGE_REDIS_URL = env.STORAGE_REDIS_URL;
    if (env.BLOB_READ_WRITE_TOKEN) process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
    if (env.ADMIN_EMAIL) process.env.ADMIN_EMAIL = env.ADMIN_EMAIL;
    if (env.ADMIN_PASSWORD) process.env.ADMIN_PASSWORD = env.ADMIN_PASSWORD;
    if (env.ADMIN_SECRET) process.env.ADMIN_SECRET = env.ADMIN_SECRET;
  };

  const handleWebResponse = async (webResponse: Response, res: import('http').ServerResponse) => {
    res.statusCode = webResponse.status;
    webResponse.headers.forEach((value, key) => res.setHeader(key, value));
    const body = Buffer.from(await webResponse.arrayBuffer());
    res.end(body);
  };

  const toWebRequest = (req: import('http').IncomingMessage) => {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => headers.append(key, item));
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    });

    const init: RequestInit & { duplex?: 'half' } = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = Readable.toWeb(req) as RequestInit['body'];
      init.duplex = 'half';
    }

    return new Request(`http://localhost${req.url ?? ''}`, init);
  };

  const readLeads = async (r: Redis | null) => {
    if (!r) return memoryLeads;
    const items = await r.lrange(LEADS_KEY, 0, 99);
    return items
      .map((item) => {
        try {
          return JSON.parse(item) as Lead;
        } catch {
          return null;
        }
      })
      .filter((lead): lead is Lead => lead !== null);
  };

  const writeLeads = async (r: Redis | null, leads: Lead[]) => {
    if (!r) {
      memoryLeads = leads;
      return;
    }

    await r.del(LEADS_KEY);
    if (leads.length > 0) {
      await r.rpush(LEADS_KEY, ...leads.map((lead) => JSON.stringify(lead)));
    }
  };

  const analyticsDevPlugin = {
    name: 'analytics-dev-proxy',
    configureServer(server: import('vite').ViteDevServer) {
      syncServerEnv();

      // POST /api/auth — valida credenciais e retorna token (dev only)
      server.middlewares.use('/api/auth', async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'method_not_allowed' }));
          return;
        }
        const body = await readBody(req);
        const email = String(body.email ?? '').trim();
        const password = String(body.password ?? '');
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminEmail || !adminPassword || !adminSecret) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'auth_not_configured' }));
          return;
        }
        if (email !== adminEmail || password !== adminPassword) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid_credentials' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token: computeToken(adminSecret) }));
      });

      // GET /api/analytics — retorna últimos 14 dias
      server.middlewares.use('/api/analytics', async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        if (!validateAdminRequest(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'unauthorized' }));
          return;
        }
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

      server.middlewares.use('/api/leads', async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        const r = getRedis();
        try {
          if (req.method === 'GET') {
            if (!validateAdminRequest(req)) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'unauthorized' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: await readLeads(r) }));
            return;
          }

          if (req.method === 'POST') {
            const body = await readBody(req);
            const name = sanitize(body.name);
            const email = sanitize(body.email);
            const phone = sanitize(body.phone);
            const message = sanitize(body.message);

            if (!name || !email || !message) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'missing_required_fields' }));
              return;
            }

            const lead: Lead = {
              id: Date.now(),
              name,
              email,
              phone,
              message,
              date: formatDate(new Date()),
              status: 'novo',
            };

            if (r) {
              await r.lpush(LEADS_KEY, JSON.stringify(lead));
              await r.ltrim(LEADS_KEY, 0, 99);
            } else {
              memoryLeads = [lead, ...memoryLeads].slice(0, 100);
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: lead }));
            return;
          }

          if (req.method === 'PATCH') {
            if (!validateAdminRequest(req)) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'unauthorized' }));
              return;
            }
            const body = await readBody(req);
            const id = Number(body.id);
            const status = body.status as LeadStatus;

            if (!Number.isFinite(id) || !leadStatuses.includes(status)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'invalid_payload' }));
              return;
            }

            const leads = await readLeads(r);
            const nextLeads = leads.map((lead) => lead.id === id ? { ...lead, status } : lead);
            const updated = nextLeads.find((lead) => lead.id === id);

            if (!updated) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'lead_not_found' }));
              return;
            }

            await writeLeads(r, nextLeads);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: updated }));
            return;
          }

          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'method_not_allowed' }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      server.middlewares.use('/api/projects', async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
        syncServerEnv();
        try {
          await handleWebResponse(await projectsHandler(toWebRequest(req)), res);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
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
