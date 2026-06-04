import Redis from "ioredis";
import type { IncomingMessage, ServerResponse } from "http";

export const config = { runtime: "nodejs" };

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

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Rejeita requisições cross-origin (bloqueia bots que enviam Origin de outro domínio)
  const host = (req.headers["host"] ?? "").split(":")[0];
  const origin = req.headers["origin"] ?? "";
  if (origin && !origin.includes(host)) {
    reply(res, 403, { ok: false, error: "forbidden" });
    return;
  }

  const url = process.env.STORAGE_REDIS_URL;
  if (!url) {
    reply(res, 503, { ok: false, error: "redis_not_configured" });
    return;
  }

  try {
    const r = getClient();
    const key = `visits:${new Date().toISOString().split("T")[0]}`;
    await r.incr(key);
    await r.expire(key, 7_776_000);
    reply(res, 200, { ok: true });
  } catch {
    reply(res, 500, { ok: false, error: "redis_error" });
  }
}
