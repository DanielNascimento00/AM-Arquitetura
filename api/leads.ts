import Redis from "ioredis";
import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { IncomingMessage, ServerResponse } from "http";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function buildEmailHtml(lead: { name: string; email: string; phone: string; message: string; date: string }): string {
  const template = readFileSync(join(__dirname, "../emails/new-lead.html"), "utf8");
  const adminUrl = process.env.ADMIN_URL ?? "https://ammarquitetura.vercel.app/admin";
  const year = new Date().getFullYear().toString();
  return template
    .replace(/\{\{lead\.name\}\}/g, escapeHtml(lead.name))
    .replace(/\{\{lead\.email\}\}/g, escapeHtml(lead.email))
    .replace(/mailto:\{\{lead\.email\}\}/g, `mailto:${escapeHtml(lead.email)}`)
    .replace(/\{\{lead\.phone\}\}/g, escapeHtml(lead.phone || "—"))
    .replace(/\{\{lead\.message\}\}/g, escapeHtml(lead.message).replace(/\n/g, "<br>"))
    .replace(/\{\{lead\.date\}\}/g, escapeHtml(lead.date))
    .replace(/\{\{adminUrl\}\}/g, adminUrl)
    .replace(/\{\{year\}\}/g, year);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const config = { runtime: "nodejs" };

function validateAdminRequest(req: IncomingMessage): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const day = new Date().toISOString().slice(0, 10);
  const expected = createHmac("sha256", secret).update(`admin-session:${day}`).digest("hex");
  const provided = (req.headers["x-admin-token"] as string | undefined) ?? "";
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (raw ?? "unknown").trim();
}

async function checkLeadRateLimit(r: Redis, req: IncomingMessage): Promise<boolean> {
  const ip = getClientIp(req);
  const bucket = new Date().toISOString().slice(0, 13); // janela por hora
  const key = `ratelimit:lead:${ip}:${bucket}`;
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, 3600);
  return count <= 5;
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
      if (!validateAdminRequest(req)) {
        reply(res, 401, { error: "unauthorized" });
        return;
      }
      reply(res, 200, { data: await readLeads(r) });
      return;
    }

    if (req.method === "POST") {
      if (!await checkLeadRateLimit(r, req)) {
        reply(res, 429, { error: "too_many_requests" });
        return;
      }

      const body = await readJson(req) as Partial<Lead> | null;
      const name = sanitize(body?.name);
      const email = sanitize(body?.email);
      const phone = sanitize(body?.phone);
      const message = sanitize(body?.message);

      if (!name || !email || !message) {
        reply(res, 400, { error: "missing_required_fields" });
        return;
      }

      if (!isValidEmail(email)) {
        reply(res, 400, { error: "invalid_email" });
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

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "AM Arquitetura <onboarding@resend.dev>",
          to: "danielsnascimento00@gmail.com",
          subject: `Novo contato: ${lead.name}`,
          html: buildEmailHtml(lead),
        }).catch(() => {});
      }

      reply(res, 201, { data: lead });
      return;
    }

    if (req.method === "PATCH") {
      if (!validateAdminRequest(req)) {
        reply(res, 401, { error: "unauthorized" });
        return;
      }
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
      if (!validateAdminRequest(req)) {
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
