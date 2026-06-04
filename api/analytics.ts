import { Redis } from "@upstash/redis";

export const config = { runtime: "edge" };

function formatDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

export default async function handler(): Promise<Response> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return Response.json({ error: "redis_not_configured" }, { status: 503 });
  }

  try {
    const redis = new Redis({ url, token });

    const dateStrs: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateStrs.push(d.toISOString().split("T")[0]);
    }

    const pipeline = redis.pipeline();
    for (const dateStr of dateStrs) {
      pipeline.get(`visits:${dateStr}`);
    }
    const results = await pipeline.exec();

    const days = dateStrs.map((dateStr, i) => ({
      key:   formatDay(dateStr),
      total: Number(results[i] ?? 0),
    }));

    return Response.json({ data: days });
  } catch {
    return Response.json({ error: "redis_error" }, { status: 500 });
  }
}
