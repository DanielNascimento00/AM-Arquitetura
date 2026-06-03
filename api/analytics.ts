export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  const token     = process.env.VITE_VERCEL_TOKEN     ?? "";
  const projectId = process.env.VITE_VERCEL_PROJECT_ID ?? "";
  const teamId    = process.env.VITE_VERCEL_TEAM_ID    ?? "";

  if (!token || !projectId) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const endAt   = searchParams.get("endAt")   ?? String(Date.now());
  const startAt = searchParams.get("startAt") ?? String(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    projectId,
    startAt,
    endAt,
    environment: "production",
    granularity: "1d",
    ...(teamId ? { teamId } : {}),
  });

  const res = await fetch(
    `https://vercel.com/api/web-analytics/timeseries?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    return Response.json({ error: "api_error", status: res.status }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
