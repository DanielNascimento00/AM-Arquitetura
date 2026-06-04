import Redis from "ioredis";
import type { IncomingMessage, ServerResponse } from "http";
import { validateAdminRequest } from "./_adminAuth";

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

function formatDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!validateAdminRequest(req)) {
    reply(res, 401, { error: "unauthorized" });
    return;
  }

  const url = process.env.STORAGE_REDIS_URL;
  if (!url) {
    reply(res, 503, { error: "redis_not_configured" });
    return;
  }

  try {
    const r = getClient();
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = Number((await r.get(`visits:${dateStr}`)) ?? 0);
      days.push({ key: formatDay(dateStr), total: count });
    }
    reply(res, 200, { data: days });
  } catch {
    reply(res, 500, { error: "redis_error" });
  }
}
