import { del, put } from "@vercel/blob";
import Redis from "ioredis";
import { Readable } from "stream";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: false,
  },
};

type PhotoCategory = "arquitetura" | "marcenaria";

interface ProjectPhoto {
  id: number;
  url: string;
  pathname: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: PhotoCategory;
  order: number;
  featured: boolean;
  mainPhoto: ProjectPhoto;
  subPhotos: ProjectPhoto[];
  createdAt: string;
  updatedAt: string;
}

const PROJECTS_KEY = "portfolio:projects";
const categories: PhotoCategory[] = ["arquitetura", "marcenaria"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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

function sanitize(value: unknown, limit = 1000): string {
  return String(value ?? "").trim().slice(0, limit);
}

function toBool(value: unknown): boolean {
  return value === true || value === "true" || value === "1" || value === "on";
}

function toOrder(value: unknown, fallback: number): number {
  const order = Number(value);
  return Number.isFinite(order) && order > 0 ? Math.round(order) : fallback;
}

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order || b.id - a.id);
}

async function readProjects(r: Redis): Promise<Project[]> {
  const raw = await r.get(PROJECTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? sortProjects(parsed) : [];
  } catch {
    return [];
  }
}

async function writeProjects(r: Redis, projects: Project[]): Promise<void> {
  await r.set(PROJECTS_KEY, JSON.stringify(sortProjects(projects)));
}

function json(status: number, body: unknown): { status: number; body: unknown } {
  return { status, body };
}

function reply(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function assertRedisConfigured(): { status: number; body: unknown } | null {
  if (!process.env.STORAGE_REDIS_URL) {
    return json(503, { error: "redis_not_configured" });
  }
  return null;
}

function assertBlobConfigured(): { status: number; body: unknown } | null {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(503, { error: "blob_not_configured" });
  }
  return null;
}

function validateImage(file: File): { status: number; body: unknown } | null {
  if (!file.type.startsWith("image/")) {
    return json(400, { error: "invalid_image_type" });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return json(400, { error: "image_too_large" });
  }
  return null;
}

function safeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "foto";
}

async function uploadPhoto(projectId: number, file: File, slot: string): Promise<ProjectPhoto> {
  const pathname = `portfolio/${projectId}/${slot}-${Date.now()}-${safeFileName(file.name)}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    url: blob.url,
    pathname: blob.pathname,
  };
}

async function deletePhotos(photos: ProjectPhoto[]): Promise<void> {
  const pathnames = photos.map((photo) => photo.pathname).filter(Boolean);
  if (pathnames.length === 0) return;
  await del(pathnames).catch(() => undefined);
}

function getFile(form: FormData, key: string): File | null {
  const value = form.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) as Record<string, unknown> : {});
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

async function readFormData(req: IncomingMessage): Promise<FormData> {
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers.host ?? "localhost";
  const url = `${protocol}://${host}${req.url ?? "/api/projects"}`;
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: Readable.toWeb(req) as ReadableStream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  return Promise.race([
    request.formData(),
    new Promise<FormData>((_, reject) => {
      setTimeout(() => reject(new Error("form_data_timeout")), 15_000);
    }),
  ]);
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const configurationError = assertRedisConfigured() ?? (req.method === "GET" ? null : assertBlobConfigured());
  if (configurationError) {
    reply(res, configurationError.status, configurationError.body);
    return;
  }

  try {
    const r = getClient();

    if (req.method === "GET") {
      reply(res, 200, { data: await readProjects(r) });
      return;
    }

    if (req.method === "POST") {
      const form = await readFormData(req);
      const title = sanitize(form.get("title"), 180);
      const description = sanitize(form.get("description"), 800);
      const category = sanitize(form.get("category")) as PhotoCategory;
      const featured = toBool(form.get("featured"));
      const projects = await readProjects(r);
      const order = toOrder(form.get("order"), projects.length + 1);
      const mainFile = getFile(form, "mainPhoto");

      if (!title || !categories.includes(category) || !mainFile) {
        reply(res, 400, { error: "missing_required_fields" });
        return;
      }

      const mainValidation = validateImage(mainFile);
      if (mainValidation) {
        reply(res, mainValidation.status, mainValidation.body);
        return;
      }

      const subFiles = form.getAll("subPhotos").filter((file): file is File => file instanceof File && file.size > 0).slice(0, 4);
      for (const file of subFiles) {
        const validation = validateImage(file);
        if (validation) {
          reply(res, validation.status, validation.body);
          return;
        }
      }

      const id = Date.now();
      const now = new Date().toISOString();
      const mainPhoto = await uploadPhoto(id, mainFile, "main");
      const subPhotos = await Promise.all(subFiles.map((file, index) => uploadPhoto(id, file, `sub-${index + 1}`)));

      const project: Project = {
        id,
        title,
        description,
        category,
        order,
        featured,
        mainPhoto,
        subPhotos,
        createdAt: now,
        updatedAt: now,
      };

      await writeProjects(r, [...projects, project]);
      reply(res, 201, { data: project });
      return;
    }

    if (req.method === "PATCH") {
      const form = await readFormData(req);
      const id = Number(form.get("id"));
      const projects = await readProjects(r);
      const current = projects.find((project) => project.id === id);

      if (!Number.isFinite(id) || !current) {
        reply(res, 404, { error: "project_not_found" });
        return;
      }

      const category = sanitize(form.get("category")) as PhotoCategory;
      if (!categories.includes(category)) {
        reply(res, 400, { error: "invalid_category" });
        return;
      }

      const mainFile = getFile(form, "mainPhoto");
      if (mainFile) {
        const validation = validateImage(mainFile);
        if (validation) {
          reply(res, validation.status, validation.body);
          return;
        }
      }

      const nextMainPhoto = mainFile ? await uploadPhoto(id, mainFile, "main") : current.mainPhoto;
      const keptSubPhotoIds = JSON.parse(sanitize(form.get("keptSubPhotoIds")) || "[]") as number[];
      const nextSubPhotos: ProjectPhoto[] = [];

      for (let slot = 0; slot < 4; slot += 1) {
        const slotFile = getFile(form, `subPhoto_${slot}`);
        if (slotFile) {
          const validation = validateImage(slotFile);
          if (validation) {
            reply(res, validation.status, validation.body);
            return;
          }
          nextSubPhotos.push(await uploadPhoto(id, slotFile, `sub-${slot + 1}`));
          continue;
        }

        const kept = current.subPhotos.find((photo) => photo.id === keptSubPhotoIds[slot]);
        if (kept) nextSubPhotos.push(kept);
      }

      const updated: Project = {
        ...current,
        title: sanitize(form.get("title"), 180),
        description: sanitize(form.get("description"), 800),
        category,
        order: toOrder(form.get("order"), current.order),
        featured: toBool(form.get("featured")),
        mainPhoto: nextMainPhoto,
        subPhotos: nextSubPhotos,
        updatedAt: new Date().toISOString(),
      };

      if (!updated.title) {
        reply(res, 400, { error: "missing_required_fields" });
        return;
      }

      const oldPhotos = [current.mainPhoto, ...current.subPhotos];
      const nextPhotoPaths = new Set([updated.mainPhoto, ...updated.subPhotos].map((photo) => photo.pathname));
      await deletePhotos(oldPhotos.filter((photo) => !nextPhotoPaths.has(photo.pathname)));
      await writeProjects(r, projects.map((project) => project.id === id ? updated : project));

      reply(res, 200, { data: updated });
      return;
    }

    if (req.method === "DELETE") {
      const body = await readJson(req) as { id?: number } | null;
      const id = Number(body?.id);
      const projects = await readProjects(r);
      const project = projects.find((item) => item.id === id);

      if (!Number.isFinite(id) || !project) {
        reply(res, 404, { error: "project_not_found" });
        return;
      }

      await deletePhotos([project.mainPhoto, ...project.subPhotos]);
      await writeProjects(r, projects.filter((item) => item.id !== id));
      reply(res, 200, { data: project });
      return;
    }

    reply(res, 405, { error: "method_not_allowed" });
  } catch {
    reply(res, 500, { error: "projects_error" });
  }
}
