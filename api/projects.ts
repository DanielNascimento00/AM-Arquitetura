import { del, put } from "@vercel/blob";
import Redis from "ioredis";

export const config = { runtime: "nodejs" };

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
        connectTimeout: 5000,
        commandTimeout: 4000,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
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

function assertRedisConfigured(): Response | null {
  if (!process.env.STORAGE_REDIS_URL) {
    return Response.json({ error: "redis_not_configured" }, { status: 503 });
  }
  return null;
}

function assertBlobConfigured(): Response | null {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "blob_not_configured" }, { status: 503 });
  }
  return null;
}

function validateImage(file: File): Response | null {
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "invalid_image_type" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json({ error: "image_too_large" }, { status: 400 });
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

export default async function handler(request: Request): Promise<Response> {
  const configurationError = assertRedisConfigured() ?? (request.method === "GET" ? null : assertBlobConfigured());
  if (configurationError) return configurationError;

  try {
    const r = getClient();

    if (request.method === "GET") {
      return Response.json({ data: await readProjects(r) });
    }

    if (request.method === "POST") {
      const form = await request.formData();
      const title = sanitize(form.get("title"), 180);
      const description = sanitize(form.get("description"), 800);
      const category = sanitize(form.get("category")) as PhotoCategory;
      const featured = toBool(form.get("featured"));
      const projects = await readProjects(r);
      const order = toOrder(form.get("order"), projects.length + 1);
      const mainFile = getFile(form, "mainPhoto");

      if (!title || !categories.includes(category) || !mainFile) {
        return Response.json({ error: "missing_required_fields" }, { status: 400 });
      }

      const mainValidation = validateImage(mainFile);
      if (mainValidation) return mainValidation;

      const subFiles = form.getAll("subPhotos").filter((file): file is File => file instanceof File && file.size > 0).slice(0, 4);
      for (const file of subFiles) {
        const validation = validateImage(file);
        if (validation) return validation;
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
      return Response.json({ data: project }, { status: 201 });
    }

    if (request.method === "PATCH") {
      const form = await request.formData();
      const id = Number(form.get("id"));
      const projects = await readProjects(r);
      const current = projects.find((project) => project.id === id);

      if (!Number.isFinite(id) || !current) {
        return Response.json({ error: "project_not_found" }, { status: 404 });
      }

      const category = sanitize(form.get("category")) as PhotoCategory;
      if (!categories.includes(category)) {
        return Response.json({ error: "invalid_category" }, { status: 400 });
      }

      const mainFile = getFile(form, "mainPhoto");
      if (mainFile) {
        const validation = validateImage(mainFile);
        if (validation) return validation;
      }

      const nextMainPhoto = mainFile ? await uploadPhoto(id, mainFile, "main") : current.mainPhoto;
      const keptSubPhotoIds = JSON.parse(sanitize(form.get("keptSubPhotoIds")) || "[]") as number[];
      const nextSubPhotos: ProjectPhoto[] = [];

      for (let slot = 0; slot < 4; slot += 1) {
        const slotFile = getFile(form, `subPhoto_${slot}`);
        if (slotFile) {
          const validation = validateImage(slotFile);
          if (validation) return validation;
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
        return Response.json({ error: "missing_required_fields" }, { status: 400 });
      }

      const oldPhotos = [current.mainPhoto, ...current.subPhotos];
      const nextPhotoPaths = new Set([updated.mainPhoto, ...updated.subPhotos].map((photo) => photo.pathname));
      await deletePhotos(oldPhotos.filter((photo) => !nextPhotoPaths.has(photo.pathname)));
      await writeProjects(r, projects.map((project) => project.id === id ? updated : project));

      return Response.json({ data: updated });
    }

    if (request.method === "DELETE") {
      const body = await request.json().catch(() => null) as { id?: number } | null;
      const id = Number(body?.id);
      const projects = await readProjects(r);
      const project = projects.find((item) => item.id === id);

      if (!Number.isFinite(id) || !project) {
        return Response.json({ error: "project_not_found" }, { status: 404 });
      }

      await deletePhotos([project.mainPhoto, ...project.subPhotos]);
      await writeProjects(r, projects.filter((item) => item.id !== id));
      return Response.json({ data: project });
    }

    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  } catch {
    return Response.json({ error: "projects_error" }, { status: 500 });
  }
}
