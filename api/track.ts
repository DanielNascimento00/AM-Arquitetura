import Redis from "ioredis";

export const config = { runtime: "nodejs" };

const getClient = (() => {
  let client: Redis | null = null;
  return () => {
    if (!client) {
      const url = process.env.STORAGE_REDIS_URL!;
      client = new Redis(url, {
        tls: url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 5000,
        commandTimeout: 4000,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
      });
    }
    return client;
  };
})();

export default async function handler(): Promise<Response> {
  const url = process.env.STORAGE_REDIS_URL;
  if (!url) {
    return Response.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  try {
    const r = getClient();
    const key = `visits:${new Date().toISOString().split("T")[0]}`;
    await r.incr(key);
    await r.expire(key, 7_776_000); // 90 dias
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
