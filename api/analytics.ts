import Redis from "ioredis";

export const config = { runtime: "nodejs" };

const getClient = (() => {
  let client: Redis | null = null;
  return () => {
    if (!client) {
      const url = process.env.STORAGE_REDIS_URL!;
      client = new Redis(url, {
        tls: url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
        maxRetriesPerRequest: 2,
      });
    }
    return client;
  };
})();

function formatDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

export default async function handler(): Promise<Response> {
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
    return Response.json({ data: days });
  } catch {
    return Response.json({ error: "redis_error" }, { status: 500 });
  }
}
