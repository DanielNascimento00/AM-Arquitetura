import { del, put } from "@vercel/blob";
import { readFile } from "fs/promises";
import formidable, { type Fields, type Files, type File as FormidableFile } from "formidable";
import Redis from "ioredis";
import { createHmac, timingSafeEqual } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

function validateAdminRequest(req: IncomingMessage): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const day = new Date().toISOString().slice(0, 10);
  const expected = createHmac("sha256", secret).update(`admin-session:${day}`).digest("hex");
  const provided = (req.headers["x-admin-token"] as string | undefined) ?? "";
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

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
const MAX_MEDIA_SIZE = 100 * 1024 * 1024;
const MAX_SUB_MEDIA = 12;

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

function firstField(fields: Fields, key: string): string {
  const value = fields[key];
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
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

function validateMedia(file: FormidableFile): { status: number; body: unknown } | null {
  const mimetype = file.mimetype ?? "";
  if (!mimetype.startsWith("image/") && mimetype !== "video/mp4") {
    return json(400, { error: "invalid_media_type" });
  }
  if (file.size > MAX_MEDIA_SIZE) {
    return json(400, { error: "media_too_large" });
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

function proxiedPrivateBlobUrl(url: string): string {
  return `/api/blob?url=${encodeURIComponent(url)}`;
}

async function putPhoto(pathname: string, buffer: Buffer, file: FormidableFile, access: "public" | "private") {
  return put(pathname, buffer, {
    access,
    addRandomSuffix: true,
    contentType: file.mimetype ?? "application/octet-stream",
  });
}

async function uploadPhoto(projectId: number, file: FormidableFile, slot: string): Promise<ProjectPhoto> {
  const buffer = await readFile(file.filepath);
  const pathname = `portfolio/${projectId}/${slot}-${Date.now()}-${safeFileName(file.originalFilename ?? "foto")}`;
  let blob = null;
  let access: "public" | "private" = "public";

  try {
    blob = await putPhoto(pathname, buffer, file, "public");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("private store")) throw error;
    access = "private";
    blob = await putPhoto(pathname, buffer, file, "private");
  }

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    url: access === "private" ? proxiedPrivateBlobUrl(blob.url) : blob.url,
    pathname: blob.pathname,
  };
}

async function deletePhotos(photos: ProjectPhoto[]): Promise<void> {
  const pathnames = photos.map((photo) => photo.pathname).filter(Boolean);
  if (pathnames.length === 0) return;
  await del(pathnames).catch(() => undefined);
}

function getFile(files: Files, key: string): FormidableFile | null {
  const value = files[key];
  const file = Array.isArray(value) ? value[0] : value;
  return file && file.size > 0 ? file : null;
}

function getFiles(files: Files, key: string): FormidableFile[] {
  const value = files[key];
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter((file) => file.size > 0);
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

async function readMultipart(req: IncomingMessage): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({
    maxFileSize: MAX_MEDIA_SIZE,
    multiples: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ fields, files });
    });
  });
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
      if (!validateAdminRequest(req)) {
        reply(res, 401, { error: "unauthorized" });
        return;
      }
      const { fields, files } = await readMultipart(req);
      const title = sanitize(firstField(fields, "title"), 180);
      const description = sanitize(firstField(fields, "description"), 800);
      const category = sanitize(firstField(fields, "category")) as PhotoCategory;
      const featured = toBool(firstField(fields, "featured"));
      const projects = await readProjects(r);
      const order = toOrder(firstField(fields, "order"), projects.length + 1);
      const mainFile = getFile(files, "mainPhoto");

      if (!title || !categories.includes(category) || !mainFile) {
        reply(res, 400, { error: "missing_required_fields" });
        return;
      }

      const mainValidation = validateMedia(mainFile);
      if (mainValidation) {
        reply(res, mainValidation.status, mainValidation.body);
        return;
      }

      const subFiles = getFiles(files, "subPhotos").slice(0, MAX_SUB_MEDIA);
      for (const file of subFiles) {
        const validation = validateMedia(file);
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
      if (!validateAdminRequest(req)) {
        reply(res, 401, { error: "unauthorized" });
        return;
      }
      const { fields, files } = await readMultipart(req);
      const id = Number(firstField(fields, "id"));
      const projects = await readProjects(r);
      const current = projects.find((project) => project.id === id);

      if (!Number.isFinite(id) || !current) {
        reply(res, 404, { error: "project_not_found" });
        return;
      }

      const category = sanitize(firstField(fields, "category")) as PhotoCategory;
      if (!categories.includes(category)) {
        reply(res, 400, { error: "invalid_category" });
        return;
      }

      const mainFile = getFile(files, "mainPhoto");
      if (mainFile) {
        const validation = validateMedia(mainFile);
        if (validation) {
          reply(res, validation.status, validation.body);
          return;
        }
      }

      const nextMainPhoto = mainFile ? await uploadPhoto(id, mainFile, "main") : current.mainPhoto;
      const keptSubPhotoIds = JSON.parse(sanitize(firstField(fields, "keptSubPhotoIds")) || "[]") as number[];
      const nextSubPhotos: ProjectPhoto[] = [];

      for (let slot = 0; slot < MAX_SUB_MEDIA; slot += 1) {
        const slotFile = getFile(files, `subPhoto_${slot}`);
        if (slotFile) {
          const validation = validateMedia(slotFile);
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
        title: sanitize(firstField(fields, "title"), 180),
        description: sanitize(firstField(fields, "description"), 800),
        category,
        order: toOrder(firstField(fields, "order"), current.order),
        featured: toBool(firstField(fields, "featured")),
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
      if (!validateAdminRequest(req)) {
        reply(res, 401, { error: "unauthorized" });
        return;
      }
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
  } catch (error) {
    reply(res, 500, { error: "projects_error" });
  }
}
