import { createHmac } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

function computeToken(secret: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`admin-session:${day}`).digest("hex");
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

    const body = await readJson(req);
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (email !== adminEmail || password !== adminPassword) {
      await new Promise((r) => setTimeout(r, 300));
      reply(res, 401, { error: "invalid_credentials" });
      return;
    }

    reply(res, 200, { token: computeToken(adminSecret) });
  } catch (err) {
    reply(res, 500, { error: "internal_error", detail: String(err) });
  }
}
