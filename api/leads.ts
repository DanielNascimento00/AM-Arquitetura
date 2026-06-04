import Redis from "ioredis";
import type { IncomingMessage, ServerResponse } from "http";

export const config = { runtime: "nodejs" };

type LeadStatus = "novo" | "contato" | "fechado" | "perdido";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: LeadStatus;
}

const LEADS_KEY = "leads";
const statuses: LeadStatus[] = ["novo", "contato", "fechado", "perdido"];

const getClient = (() => {
  let client: Redis | null = null;
  return () => {
    if (!client) {
      const url = process.env.STORAGE_REDIS_URL!;
      client = new Redis(url, {
        tls: url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 8000,
        commandTimeout: 6000,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true,
      });
    }
    return client;
  };
})();

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function sanitize(value: unknown): string {
  return String(value ?? "").trim().slice(0, 1000);
}

async function readLeads(r: Redis): Promise<Lead[]> {
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
}

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readHeader(req: IncomingMessage, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function validateAdminToken(req: IncomingMessage): boolean {
  const configuredToken = process.env.LEADS_ADMIN_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  const providedToken = readHeader(req, "x-admin-token");
  return Boolean(configuredToken) && providedToken === configuredToken;
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) as Record<string, unknown> : {});
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = process.env.STORAGE_REDIS_URL;
  if (!url) {
    reply(res, 503, { error: "redis_not_configured" });
    return;
  }

  try {
    const r = getClient();

    if (req.method === "GET") {
      reply(res, 200, { data: await readLeads(r) });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req) as Partial<Lead> | null;
      const name = sanitize(body?.name);
      const email = sanitize(body?.email);
      const phone = sanitize(body?.phone);
      const message = sanitize(body?.message);

      if (!name || !email || !message) {
        reply(res, 400, { error: "missing_required_fields" });
        return;
      }

      const lead: Lead = {
        id: Date.now(),
        name,
        email,
        phone,
        message,
        date: formatDate(new Date()),
        status: "novo",
      };

      await r.lpush(LEADS_KEY, JSON.stringify(lead));
      await r.ltrim(LEADS_KEY, 0, 99);
      reply(res, 201, { data: lead });
      return;
    }

    if (req.method === "PATCH") {
      const body = await readJson(req) as { id?: number; status?: LeadStatus } | null;
      const id = Number(body?.id);
      const status = body?.status;

      if (!Number.isFinite(id) || !statuses.includes(status as LeadStatus)) {
        reply(res, 400, { error: "invalid_payload" });
        return;
      }

      const leads = await readLeads(r);
      const nextLeads = leads.map((lead) => lead.id === id ? { ...lead, status: status as LeadStatus } : lead);
      const updated = nextLeads.find((lead) => lead.id === id);

      if (!updated) {
        reply(res, 404, { error: "lead_not_found" });
        return;
      }

      await r.del(LEADS_KEY);
      if (nextLeads.length > 0) {
        await r.rpush(LEADS_KEY, ...nextLeads.map((lead) => JSON.stringify(lead)));
      }

      reply(res, 200, { data: updated });
      return;
    }

    if (req.method === "DELETE") {
      if (!validateAdminToken(req)) {
        reply(res, 401, { error: "unauthorized" });
        return;
      }

      const before = await r.llen(LEADS_KEY);
      await r.del(LEADS_KEY);
      reply(res, 200, { data: { before, after: 0 } });
      return;
    }

    reply(res, 405, { error: "method_not_allowed" });
  } catch {
    reply(res, 500, { error: "redis_error" });
  }
}
