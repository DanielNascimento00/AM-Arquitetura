import { Redis } from "@upstash/redis";

export const config = { runtime: "edge" };

export default async function handler(): Promise<Response> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return Response.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  try {
    const redis = new Redis({ url, token });
    const key = `visits:${new Date().toISOString().split("T")[0]}`;
    await redis.pipeline().incr(key).expire(key, 7_776_000).exec();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
