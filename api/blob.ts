import type { IncomingMessage, ServerResponse } from "http";

export const config = { runtime: "nodejs" };

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    reply(res, 503, { error: "blob_not_configured" });
    return;
  }

  try {
    const requestUrl = new URL(req.url ?? "", `https://${req.headers.host ?? "localhost"}`);
    const rawUrl = requestUrl.searchParams.get("url");
    if (!rawUrl) {
      reply(res, 400, { error: "missing_url" });
      return;
    }

    const blobUrl = new URL(rawUrl);
    if (!blobUrl.hostname.endsWith(".private.blob.vercel-storage.com")) {
      reply(res, 400, { error: "invalid_blob_url" });
      return;
    }

    const response = await fetch(blobUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok || !response.body) {
      reply(res, response.status, { error: "blob_fetch_failed" });
      return;
    }

    const contentType = response.headers.get("Content-Type") ?? "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch {
    reply(res, 500, { error: "blob_proxy_error" });
  }
}
