import Redis from "ioredis";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

const PROFILE_KEY = "admin:profile";
const PASSWORD_KEY = "admin:password";
const MAX_BODY = 400 * 1024;
const MAX_AVATAR = 200 * 1024;
const MAX_NAME = 60;
const MIN_PASSWORD = 8;
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

function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    let raw = "";
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) { resolve(null); req.destroy(); return; }
      raw += chunk;
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) as Record<string, unknown> : {}); }
      catch { resolve(null); }
    });
    req.on("error", () => resolve(null));
  });
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (raw ?? "unknown").trim();
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    if (!validateAdminRequest(req)) {
      reply(res, 401, { error: "unauthorized" });
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL ?? "";
    const redis = getClient();

    if (req.method === "GET") {
      let displayName = "";
      let avatar = "";
      if (redis) {
        try {
          const stored = await redis.hgetall(PROFILE_KEY);
          displayName = stored.displayName ?? "";
          avatar = stored.avatar ?? "";
        } catch { /* segue com o perfil padrão */ }
      }
      reply(res, 200, { data: { email: adminEmail, displayName, avatar } });
      return;
    }

    if (req.method !== "PATCH") {
      reply(res, 405, { error: "method_not_allowed" });
      return;
    }

    if (!redis) {
      reply(res, 503, { error: "storage_not_configured" });
      return;
    }

    const body = await readJson(req);
    if (!body) {
      reply(res, 400, { error: "invalid_body" });
      return;
    }

    // Alteração de senha
    if (typeof body.newPassword === "string") {
      const currentPassword = String(body.currentPassword ?? "");
      const newPassword = body.newPassword;

      if (newPassword.length < MIN_PASSWORD || newPassword.length > 128) {
        reply(res, 400, { error: "weak_password" });
        return;
      }

      const bruteKey = `brute:pwd:${getClientIp(req)}`;
      const attempts = await redis.incr(bruteKey);
      if (attempts === 1) await redis.expire(bruteKey, LOCKOUT_SECS);
      if (attempts > MAX_ATTEMPTS) {
        reply(res, 429, { error: "too_many_attempts" });
        return;
      }

      const stored = await redis.get(PASSWORD_KEY);
      const envPassword = process.env.ADMIN_PASSWORD ?? "";
      const valid = stored ? verifyHash(currentPassword, stored) : safeEqual(currentPassword, envPassword);
      if (!valid) {
        await new Promise((r) => setTimeout(r, 300));
        reply(res, 401, { error: "invalid_current_password" });
        return;
      }

      await redis.set(PASSWORD_KEY, hashPassword(newPassword));
      await redis.del(bruteKey);
      reply(res, 200, { data: { passwordChanged: true } });
      return;
    }

    // Alteração de nome e/ou foto
    const updates: Record<string, string> = {};

    if ("displayName" in body) {
      const name = String(body.displayName ?? "").trim();
      if (name.length > MAX_NAME) {
        reply(res, 400, { error: "name_too_long" });
        return;
      }
      updates.displayName = name;
    }

    if ("avatar" in body) {
      const avatar = String(body.avatar ?? "");
      if (avatar !== "") {
        if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar) || avatar.length > MAX_AVATAR) {
          reply(res, 400, { error: "invalid_avatar" });
          return;
        }
      }
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      reply(res, 400, { error: "nothing_to_update" });
      return;
    }

    await redis.hset(PROFILE_KEY, updates);
    const stored = await redis.hgetall(PROFILE_KEY);
    reply(res, 200, { data: { email: adminEmail, displayName: stored.displayName ?? "", avatar: stored.avatar ?? "" } });
  } catch {
    reply(res, 500, { error: "internal_error" });
  }
}
