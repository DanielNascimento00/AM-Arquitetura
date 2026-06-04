import { createHmac, timingSafeEqual } from "crypto";
import type { IncomingMessage } from "http";

export function computeToken(secret: string): string {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return createHmac("sha256", secret).update(`admin-session:${day}`).digest("hex");
}

export function validateAdminRequest(req: IncomingMessage): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const expected = computeToken(secret);
  const provided = (req.headers["x-admin-token"] as string | undefined) ?? "";
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}
