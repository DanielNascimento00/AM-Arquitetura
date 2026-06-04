import Redis from "ioredis";
import { createHmac } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

const MAX_ATTEMPTS = 10;
const LOCKOUT_SECS = 15 * 60;

const getClient = (() => {
  let client: Redis | null = null;
  return () => {
    const url = process.env.STORAGE_REDIS_URL;
    if (!url) return null;
    if (!client) {
      client = new Redis(url, {
        tls: url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 3000,
        commandTimeout: 2000,
        maxRetriesPerRequest: 0,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      client.on("error", () => {});
    }
    return client;
  };
})();

function computeToken(secret: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`admin-session:${day}`).digest("hex");
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (raw ?? "unknown").trim();
}

async function isBruteForceBlocked(ip: string): Promise<boolean> {
  const r = getClient();
  if (!r) return false;
  try {
    const key = `brute:auth:${ip}`;
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, LOCKOUT_SECS);
    return count > MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

async function clearBruteForce(ip: string): Promise<void> {
  const r = getClient();
  if (!r) return;
  try { await r.del(`brute:auth:${ip}`); } catch { /* ignora */ }
}

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) as Record<string, unknown> : {}); }
      catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    if (req.method !== "POST") {
      reply(res, 405, { error: "method_not_allowed" });
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminEmail || !adminPassword || !adminSecret) {
      reply(res, 503, { error: "auth_not_configured" });
      return;
    }

    const ip = getClientIp(req);

    if (await isBruteForceBlocked(ip)) {
      reply(res, 429, { error: "too_many_attempts" });
      return;
    }

    const body = await readJson(req);
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (email !== adminEmail || password !== adminPassword) {
      await new Promise((r) => setTimeout(r, 300));
      reply(res, 401, { error: "invalid_credentials" });
      return;
    }

    await clearBruteForce(ip);
    reply(res, 200, { token: computeToken(adminSecret) });
  } catch {
    reply(res, 500, { error: "internal_error" });
  }
}
