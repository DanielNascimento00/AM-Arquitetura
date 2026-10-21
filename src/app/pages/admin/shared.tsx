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
  projectsError: boolean;
  setProjectsError: (value: boolean) => void;
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
