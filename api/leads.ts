import Redis from "ioredis";

export const config = { runtime: "nodejs" };

type LeadStatus = "novo" | "contato" | "fechado" | "perdido";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: LeadStatus;
}

const LEADS_KEY = "leads";
const statuses: LeadStatus[] = ["novo", "contato", "fechado", "perdido"];

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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function sanitize(value: unknown): string {
  return String(value ?? "").trim().slice(0, 1000);
}

async function readLeads(r: Redis): Promise<Lead[]> {
  const items = await r.lrange(LEADS_KEY, 0, 99);
  return items
    .map((item) => {
      try {
        return JSON.parse(item) as Lead;
      } catch {
        return null;
      }
    })
    .filter((lead): lead is Lead => lead !== null);
}

export default async function handler(request: Request): Promise<Response> {
  const url = process.env.STORAGE_REDIS_URL;
  if (!url) {
    return Response.json({ error: "redis_not_configured" }, { status: 503 });
  }

  try {
    const r = getClient();

    if (request.method === "GET") {
      return Response.json({ data: await readLeads(r) });
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => null) as Partial<Lead> | null;
      const name = sanitize(body?.name);
      const email = sanitize(body?.email);
      const phone = sanitize(body?.phone);
      const message = sanitize(body?.message);

      if (!name || !email || !message) {
        return Response.json({ error: "missing_required_fields" }, { status: 400 });
      }

      const lead: Lead = {
        id: Date.now(),
        name,
        email,
        phone,
        message,
        date: formatDate(new Date()),
        status: "novo",
      };

      await r.lpush(LEADS_KEY, JSON.stringify(lead));
      await r.ltrim(LEADS_KEY, 0, 99);
      return Response.json({ data: lead }, { status: 201 });
    }

    if (request.method === "PATCH") {
      const body = await request.json().catch(() => null) as { id?: number; status?: LeadStatus } | null;
      const id = Number(body?.id);
      const status = body?.status;

      if (!Number.isFinite(id) || !statuses.includes(status as LeadStatus)) {
        return Response.json({ error: "invalid_payload" }, { status: 400 });
      }

      const leads = await readLeads(r);
      const nextLeads = leads.map((lead) => lead.id === id ? { ...lead, status: status as LeadStatus } : lead);
      const updated = nextLeads.find((lead) => lead.id === id);

      if (!updated) {
        return Response.json({ error: "lead_not_found" }, { status: 404 });
      }

      await r.del(LEADS_KEY);
      if (nextLeads.length > 0) {
        await r.rpush(LEADS_KEY, ...nextLeads.map((lead) => JSON.stringify(lead)));
      }

      return Response.json({ data: updated });
    }

    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  } catch {
    return Response.json({ error: "redis_error" }, { status: 500 });
  }
}
