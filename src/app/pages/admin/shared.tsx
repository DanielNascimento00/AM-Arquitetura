import { useOutletContext } from "react-router";

export const MAX_SUB_MEDIA = 12;
export const MEDIA_ACCEPT = "image/*,video/mp4";
export const emptyFileSlots = () => Array.from({ length: MAX_SUB_MEDIA }, () => null) as (File | null)[];
export const emptyPreviewSlots = () => Array.from({ length: MAX_SUB_MEDIA }, () => null) as (string | null)[];
export const emptySubPhotoSlots = () => Array.from({ length: MAX_SUB_MEDIA }, () => null) as (SubPhoto | null)[];

export type PhotoCategory = "arquitetura" | "marcenaria";

export interface SubPhoto {
  id: number;
  preview: string | null;
  gradient: string;
  pathname?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: PhotoCategory;
  order: number;
  featured: boolean;
  mainPhoto: { preview: string | null; gradient: string; pathname?: string };
  subPhotos: SubPhoto[];
}

export interface ApiProject {
  id: number;
  title: string;
  description: string;
  category: PhotoCategory;
  order: number;
  featured: boolean;
  mainPhoto: { id: number; url?: string; preview?: string | null; pathname?: string; gradient?: string };
  subPhotos: { id: number; url?: string; preview?: string | null; pathname?: string; gradient?: string }[];
}

export interface AdminProfile {
  email: string;
  displayName: string;
  avatar: string;
}

export interface AdminContext {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  projectsLoading: boolean;
  profile: AdminProfile;
  setProfile: (profile: AdminProfile) => void;
  handleUnauthorized: () => void;
}

export function useAdmin() {
  return useOutletContext<AdminContext>();
}

export function isVideoSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("data:video/") || src.toLowerCase().includes(".mp4");
}

export function MediaPreview({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  if (isVideoSrc(src)) {
    return (
      <video
        src={src}
        className={className}
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  return <img src={src} alt={alt ?? ""} className={className} />;
}

export const categoryConfig: Record<PhotoCategory, { label: string; color: string; bg: string }> = {
  arquitetura: { label: "Arquitetura", color: "#B59F78", bg: "rgba(181,159,120,0.15)" },
  marcenaria:  { label: "Marcenaria",  color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
};

export function normalizeProject(project: ApiProject): Project {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    order: project.order,
    featured: project.featured,
    mainPhoto: {
      preview: project.mainPhoto.url ?? project.mainPhoto.preview ?? null,
      gradient: project.mainPhoto.gradient ?? "",
      pathname: project.mainPhoto.pathname,
    },
    subPhotos: project.subPhotos.map((photo) => ({
      id: photo.id,
      preview: photo.url ?? photo.preview ?? null,
      gradient: photo.gradient ?? "",
      pathname: photo.pathname,
    })),
  };
}

export function appendProjectFormData(
  formData: FormData,
  form: { title: string; description: string; category: PhotoCategory; order: number; featured: boolean },
) {
  formData.set("title", form.title);
  formData.set("description", form.description);
  formData.set("category", form.category);
  formData.set("order", String(form.order));
  formData.set("featured", String(form.featured));
}

export const readFile = (file: File): Promise<string> =>
  new Promise((res) => { const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(file); });

/** Limite de corpo das funções serverless da Vercel (4,5 MB), com margem. */
export const MAX_UPLOAD_BYTES = 4.2 * 1024 * 1024;

/** Reduz imagens grandes (máx. 2400px, JPEG) para caber no limite de envio. Vídeos e GIFs passam direto. */
export async function prepareMedia(file: File): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size <= 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Traduz a resposta de erro da API de projetos em uma mensagem para o administrador. */
export async function describeProjectError(response: Response | null, verb = "salvar"): Promise<string> {
  if (!response) return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
  if (response.status === 413) return "Os arquivos são grandes demais para um único envio (limite de 4,5 MB). Use imagens menores ou menos submídias.";
  if (response.status === 429) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  const body = await response.json().catch(() => ({})) as { error?: string; detail?: string };
  switch (body.error) {
    case "redis_not_configured": return "O banco de dados do site ainda não está configurado. Avise o suporte técnico.";
    case "blob_not_configured": return "O armazenamento de fotos e vídeos ainda não está configurado. Avise o suporte técnico.";
    case "missing_required_fields": return "Preencha o título e envie a foto principal.";
    case "invalid_media_type": return "Formato de arquivo não aceito. Use imagens ou MP4.";
    case "media_too_large": return "Um dos arquivos excede o tamanho máximo.";
    default: return `Não foi possível ${verb} o projeto agora. Tente novamente em instantes.`;
  }
}
