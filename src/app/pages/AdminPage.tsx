import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Images, LogOut, Eye, Users, TrendingUp,
  Upload, Star, Trash2, Pencil, Menu, X, ArrowUpRight,
  Mail, Phone, Calendar, MoreHorizontal, GripVertical,
} from "lucide-react";
import { useVercelAnalytics } from "@/app/hooks/useVercelAnalytics";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-2.png";

/* ─── Mock data ──────────────────────────────────────────── */

const visitData = [
  { day: "21/05", visits: 234 },
  { day: "22/05", visits: 312 },
  { day: "23/05", visits: 198 },
  { day: "24/05", visits: 445 },
  { day: "25/05", visits: 389 },
  { day: "26/05", visits: 521 },
  { day: "27/05", visits: 467 },
  { day: "28/05", visits: 398 },
  { day: "29/05", visits: 612 },
  { day: "30/05", visits: 534 },
  { day: "31/05", visits: 478 },
  { day: "01/06", visits: 689 },
  { day: "02/06", visits: 723 },
  { day: "03/06", visits: 845 },
];

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

const mockLeads: Lead[] = [
  { id: 1, name: "Carolina Mendes", email: "carolina@email.com", phone: "(11) 98765-4321", message: "Tenho interesse em reformar meu apartamento de 120m²...", date: "03/06/2026", status: "novo" },
  { id: 2, name: "Ricardo Fonseca", email: "r.fonseca@email.com", phone: "(11) 97654-3210", message: "Preciso de um projeto completo para minha cozinha e sala...", date: "02/06/2026", status: "contato" },
  { id: 3, name: "Bianca Torres", email: "bianca.t@email.com", phone: "(11) 96543-2109", message: "Estou procurando uma arquiteta para minha suíte master...", date: "01/06/2026", status: "fechado" },
  { id: 4, name: "André Lustosa", email: "andre@email.com", phone: "(11) 95432-1098", message: "Gostaria de saber sobre marcenaria sob medida...", date: "31/05/2026", status: "novo" },
  { id: 5, name: "Fernanda Lima", email: "flima@email.com", phone: "(11) 94321-0987", message: "Interesse em projeto de interiores para apartamento...", date: "30/05/2026", status: "perdido" },
];

type PhotoCategory = "arquitetura" | "marcenaria";

interface SubPhoto {
  id: number;
  preview: string | null;
  gradient: string;
  pathname?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: PhotoCategory;
  order: number;
  featured: boolean;
  mainPhoto: { preview: string | null; gradient: string; pathname?: string };
  subPhotos: SubPhoto[];
}

interface ApiProject {
  id: number;
  title: string;
  description: string;
  category: PhotoCategory;
  order: number;
  featured: boolean;
  mainPhoto: { id: number; url?: string; preview?: string | null; pathname?: string; gradient?: string };
  subPhotos: { id: number; url?: string; preview?: string | null; pathname?: string; gradient?: string }[];
}

const categoryConfig: Record<PhotoCategory, { label: string; color: string; bg: string }> = {
  arquitetura: { label: "Arquitetura", color: "#B59F78", bg: "rgba(181,159,120,0.15)" },
  marcenaria:  { label: "Marcenaria",  color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
};

/* ─── Helpers ────────────────────────────────────────────── */

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  novo:     { label: "Novo",      color: "#B59F78", bg: "rgba(181,159,120,0.12)" },
  contato:  { label: "Contato",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  fechado:  { label: "Fechado",   color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  perdido:  { label: "Perdido",   color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

function normalizeProject(project: ApiProject): Project {
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

function appendProjectFormData(
  formData: FormData,
  form: { title: string; description: string; category: PhotoCategory; order: number; featured: boolean },
) {
  formData.set("title", form.title);
  formData.set("description", form.description);
  formData.set("category", form.category);
  formData.set("order", String(form.order));
  formData.set("featured", String(form.featured));
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="px-3 py-1 rounded-full text-xs"
      style={{ color: cfg.color, background: cfg.bg, fontWeight: 500 }}
    >
      {cfg.label}
    </span>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-[12px] border"
      style={{
        background: "rgba(12,17,17,0.95)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(181,159,120,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-[#A7A39B] text-xs mb-1" style={{ fontWeight: 400 }}>{label}</p>
      <p className="text-[#F2F0EA] text-base" style={{ fontWeight: 500 }}>
        {payload[0].value.toLocaleString("pt-BR")}
        <span className="text-[#A7A39B] text-xs ml-1">visitas</span>
      </p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

type Tab = "dashboard" | "gallery";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<PhotoCategory | "todos">("todos");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [subFiles, setSubFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [subPreviews, setSubPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSubSlot, setActiveSubSlot] = useState<number | null>(null);
  const [photoForm, setPhotoForm] = useState({ title: "", description: "", category: "arquitetura" as PhotoCategory, order: 1, featured: false });
  const mainFileRef = useRef<HTMLInputElement>(null);
  const subFileRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editMainFile, setEditMainFile] = useState<File | null>(null);
  const [editMainPreview, setEditMainPreview] = useState<string | null>(null);
  const [editMainGradient, setEditMainGradient] = useState<string>("");
  const [editSubSlots, setEditSubSlots] = useState<(SubPhoto | null)[]>([null, null, null, null]);
  const [editSubFiles, setEditSubFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [editActiveSubSlot, setEditActiveSubSlot] = useState<number | null>(null);
  const [editIsDragging, setEditIsDragging] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "arquitetura" as PhotoCategory, order: 1, featured: false });
  const editMainFileRef = useRef<HTMLInputElement>(null);
  const editSubFileRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File): Promise<string> =>
    new Promise((res) => { const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(file); });

  const handleMainFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setMainFile(file);
    setMainPreview(await readFile(file));
  }, []);

  const onDropMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleMainFile(file);
  }, [handleMainFile]);

  const openSubSlot = (slot: number) => {
    setActiveSubSlot(slot);
    subFileRef.current?.click();
  };

  const handleSubFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSubSlot === null) return;
    const url = await readFile(file);
    setSubFiles((prev) => prev.map((p, i) => i === activeSubSlot ? file : p));
    setSubPreviews((prev) => prev.map((p, i) => i === activeSubSlot ? url : p));
    e.target.value = "";
  };

  const removeSubPreview = (slot: number) => {
    setSubFiles((prev) => prev.map((p, i) => i === slot ? null : p));
    setSubPreviews((prev) => prev.map((p, i) => i === slot ? null : p));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainFile || projectSaving) return;

    const formData = new FormData();
    appendProjectFormData(formData, photoForm);
    formData.set("mainPhoto", mainFile);
    subFiles.forEach((file) => {
      if (file) formData.append("subPhotos", file);
    });

    setProjectSaving(true);
    try {
      const response = await fetch("/api/projects", { method: "POST", body: formData });
      if (!response.ok) throw new Error("project_create_failed");
      const result = await response.json() as { data: ApiProject };
      const newProject = normalizeProject(result.data);
      setProjects((prev) => [...prev.filter((p) => p.id !== newProject.id), newProject].sort((a, b) => a.order - b.order));
      setProjectsError(false);
      setMainFile(null);
      setMainPreview(null);
      setSubFiles([null, null, null, null]);
      setSubPreviews([null, null, null, null]);
      setPhotoForm({ title: "", description: "", category: "arquitetura", order: projects.length + 2, featured: false });
    } catch {
      setProjectsError(true);
    } finally {
      setProjectSaving(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadLeads() {
      try {
        const response = await fetch("/api/leads");
        if (!response.ok) throw new Error("leads_load_failed");
        const result = await response.json() as { data?: Lead[] };
        if (active) {
          setLeads(Array.isArray(result.data) ? result.data : []);
          setLeadsError(false);
        }
      } catch {
        if (active) {
          setLeads([]);
          setLeadsError(true);
        }
      } finally {
        if (active) setLeadsLoading(false);
      }
    }

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("projects_load_failed");
        const result = await response.json() as { data?: ApiProject[] };
        if (active) {
          const nextProjects = Array.isArray(result.data) ? result.data.map(normalizeProject) : [];
          setProjects(nextProjects);
          setPhotoForm((prev) => ({ ...prev, order: nextProjects.length + 1 }));
          setProjectsError(false);
        }
      } catch {
        if (active) setProjectsError(true);
      } finally {
        if (active) setProjectsLoading(false);
      }
    }

    loadLeads();
    loadProjects();
    return () => { active = false; };
  }, []);

  const updateLeadStatus = async (id: number, status: LeadStatus) => {
    const previousLeads = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) throw new Error("lead_status_update_failed");
      setLeadsError(false);
    } catch {
      setLeads(previousLeads);
      setLeadsError(true);
    }
  };

  const saveProject = async (project: Project, form: typeof editForm, main: File | null, subSlots: (SubPhoto | null)[], slotFiles: (File | null)[]) => {
    const formData = new FormData();
    formData.set("id", String(project.id));
    appendProjectFormData(formData, form);
    if (main) formData.set("mainPhoto", main);
    formData.set("keptSubPhotoIds", JSON.stringify(subSlots.map((sub) => sub?.id ?? null)));
    slotFiles.forEach((file, slot) => {
      if (file) formData.set(`subPhoto_${slot}`, file);
    });

    const response = await fetch("/api/projects", { method: "PATCH", body: formData });
    if (!response.ok) throw new Error("project_update_failed");
    const result = await response.json() as { data: ApiProject };
    const updated = normalizeProject(result.data);
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p).sort((a, b) => a.order - b.order));
    setProjectsError(false);
    return updated;
  };

  const toggleFeatured = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const previousProjects = projects;
    setProjects((prev) => prev.map((p) => ({ ...p, featured: p.id === id ? !p.featured : p.featured })));

    try {
      await saveProject(project, { title: project.title, description: project.description, category: project.category, order: project.order, featured: !project.featured }, null, project.subPhotos, [null, null, null, null]);
    } catch {
      setProjects(previousProjects);
      setProjectsError(true);
    }
  };

  const deleteProject = async (id: number) => {
    const previousProjects = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);

    try {
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("project_delete_failed");
      setProjectsError(false);
    } catch {
      setProjects(previousProjects);
      setProjectsError(true);
    }
  };

  const openEdit = (project: Project) => {
    setEditMainFile(null);
    setEditMainPreview(project.mainPhoto.preview);
    setEditMainGradient(project.mainPhoto.gradient);
    const slots: (SubPhoto | null)[] = [null, null, null, null];
    project.subPhotos.forEach((sub, i) => { if (i < 4) slots[i] = sub; });
    setEditSubSlots(slots);
    setEditSubFiles([null, null, null, null]);
    setEditForm({ title: project.title, description: project.description, category: project.category, order: project.order, featured: project.featured });
    setEditingProject(project);
  };

  const handleEditMainFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setEditMainFile(file);
    setEditMainPreview(await readFile(file));
    setEditMainGradient("");
  }, []);

  const openEditSubSlot = (slot: number) => {
    setEditActiveSubSlot(slot);
    editSubFileRef.current?.click();
  };

  const handleEditSubFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editActiveSubSlot === null) return;
    const url = await readFile(file);
    const newSub: SubPhoto = { id: Date.now(), preview: url, gradient: "" };
    setEditSubSlots((prev) => prev.map((s, i) => i === editActiveSubSlot ? newSub : s));
    setEditSubFiles((prev) => prev.map((s, i) => i === editActiveSubSlot ? file : s));
    e.target.value = "";
  };

  const removeEditSubSlot = (slot: number) => {
    setEditSubSlots((prev) => prev.map((s, i) => i === slot ? null : s));
    setEditSubFiles((prev) => prev.map((s, i) => i === slot ? null : s));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || projectSaving) return;

    setProjectSaving(true);
    try {
      await saveProject(editingProject, editForm, editMainFile, editSubSlots, editSubFiles);
      setEditingProject(null);
    } catch {
      setProjectsError(true);
    } finally {
      setProjectSaving(false);
    }
  };

  const { totalViews, last14Days, loading: analyticsLoading } = useVercelAnalytics();
  const chartData = last14Days.length > 0 ? last14Days : visitData;
  const visitsDisplay = analyticsLoading ? "..." : totalViews.toLocaleString("pt-BR");

  const stats = [
    { icon: Eye,          label: "Total de Visitas",    value: visitsDisplay, trend: "últimos 14 dias", up: true, sub: "acessos ao site" },
    { icon: Users,        label: "Leads Gerados",        value: String(leads.length), trend: `${leads.filter((l) => l.status === "novo").length} novos`, up: true, sub: "este mês" },
    { icon: TrendingUp,   label: "Taxa de Conversão",    value: leads.length === 0 ? "—" : ((leads.filter(l => l.status === "fechado").length / leads.length) * 100).toFixed(1).replace(".", ",") + "%", trend: "", up: true, sub: "leads fechados" },
    { icon: MoreHorizontal, label: "Formulários Recebidos", value: String(leads.length), trend: `${leads.filter((l) => l.status === "novo").length} novos`, up: true, sub: "aguardando resposta" },
  ];

  const navItems = [
    { id: "dashboard" as Tab, icon: LayoutDashboard, label: "Dashboard" },
    { id: "gallery" as Tab, icon: Images, label: "Galeria" },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#050808]"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            style={{ backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={`
          fixed lg:relative z-50 lg:z-auto
          w-[260px] flex-shrink-0 h-full flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "linear-gradient(180deg, #06100f 0%, #050808 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <div className="p-7 pb-6 flex items-center justify-between">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <ImageWithFallback src={logoImg} alt="A.M Arquitetura" className="h-9 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#A7A39B] hover:text-[#F2F0EA] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Label */}
        <div className="px-7 mb-6">
          <span
            className="text-[10px] tracking-[0.14em] uppercase"
            style={{ color: "#B59F78", fontWeight: 500 }}
          >
            Painel do Administrador
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group"
                style={{
                  background: active ? "rgba(181,159,120,0.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(181,159,120,0.2)" : "transparent"}`,
                }}
              >
                <item.icon
                  size={18}
                  style={{ color: active ? "#B59F78" : "#A7A39B" }}
                  className="group-hover:text-[#B59F78] transition-colors duration-200"
                />
                <span
                  className="text-sm transition-colors duration-200"
                  style={{
                    color: active ? "#F2F0EA" : "#A7A39B",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B59F78]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] mb-2"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: "rgba(181,159,120,0.15)", color: "#B59F78", fontWeight: 600 }}
            >
              A
            </div>
            <div className="min-w-0">
              <p className="text-[#F2F0EA] text-sm truncate" style={{ fontWeight: 500 }}>Admin</p>
              <p className="text-[#A7A39B] text-xs truncate" style={{ fontWeight: 400 }}>amarqemarcenaria@gmail.com</p>
            </div>
          </div>
          <Link
            to="/login"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] transition-all duration-200 hover:bg-white/5 group"
          >
            <LogOut size={16} className="text-[#A7A39B] group-hover:text-[#f87171] transition-colors duration-200" />
            <span className="text-sm text-[#A7A39B] group-hover:text-[#f87171] transition-colors duration-200" style={{ fontWeight: 400 }}>
              Sair
            </span>
          </Link>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex-shrink-0 h-16 flex items-center justify-between px-6 lg:px-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,8,8,0.8)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#A7A39B] hover:text-[#F2F0EA] transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-[#F2F0EA] text-base" style={{ fontWeight: 500 }}>
                {activeTab === "dashboard" ? "Dashboard" : "Galeria"}
              </h1>
              <p className="text-[#A7A39B] text-xs hidden sm:block" style={{ fontWeight: 400 }}>
                {activeTab === "dashboard"
                  ? "Visão geral do desempenho do site"
                  : "Gerencie as fotos do portfólio"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              <span className="text-[#4ade80] text-xs" style={{ fontWeight: 500 }}>Online</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">

          {/* ── DASHBOARD ── */}
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="p-5 rounded-[16px] border group hover:border-[#B59F78]/20 transition-all duration-300"
                      style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(181,159,120,0.1)" }}>
                          <s.icon size={18} style={{ color: "#B59F78" }} />
                        </div>
                        {s.trend && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ color: "#4ade80", background: "rgba(74,222,128,0.1)", fontWeight: 500 }}>
                            <ArrowUpRight size={12} />
                            {s.trend}
                          </span>
                        )}
                      </div>
                      <p className="text-[#F2F0EA] text-2xl mb-0.5" style={{ fontWeight: 400 }}>{s.value}</p>
                      <p className="text-[#A7A39B] text-xs" style={{ fontWeight: 400 }}>{s.label}</p>
                      <p className="text-[#A7A39B]/50 text-[11px] mt-0.5" style={{ fontWeight: 400 }}>{s.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 rounded-[20px] border"
                  style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
                        ACESSOS AO SITE
                      </p>
                      <h2 className="text-[#F2F0EA] text-xl" style={{ fontWeight: 400 }}>
                        Últimos 14 dias
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[#F2F0EA] text-2xl" style={{ fontWeight: 400 }}>
                        {analyticsLoading ? "..." : chartData.reduce((s, d) => s + d.visits, 0).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-[#A7A39B] text-xs flex items-center justify-end gap-1 mt-0.5" style={{ fontWeight: 400 }}>
                        últimos 14 dias
                      </p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B59F78" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#B59F78" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#A7A39B", fontSize: 11, fontFamily: "Manrope" }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tick={{ fill: "#A7A39B", fontSize: 11, fontFamily: "Manrope" }}
                        axisLine={false}
                        tickLine={false}
                        dx={-4}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(181,159,120,0.2)", strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        stroke="#B59F78"
                        strokeWidth={2}
                        fill="url(#goldGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: "#B59F78", stroke: "#050808", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Leads table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[20px] border overflow-hidden"
                  style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div>
                      <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
                        FORMULÁRIOS RECEBIDOS
                      </p>
                      <h2 className="text-[#F2F0EA] text-xl" style={{ fontWeight: 400 }}>
                        Últimos leads
                      </h2>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: "rgba(181,159,120,0.1)", color: "#B59F78", fontWeight: 500 }}
                    >
                      {leadsLoading ? "Carregando..." : `${leads.filter((l) => l.status === "novo").length} novos`}
                    </span>
                  </div>
                  {leadsError && (
                    <div className="px-6 py-3 border-b text-[#f87171] text-xs" style={{ borderColor: "rgba(255,255,255,0.05)", fontWeight: 400 }}>
                      Nao foi possivel carregar os leads salvos. Verifique a configuracao do Redis.
                    </div>
                  )}

                  {/* Table desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          {["Nome", "Contato", "Mensagem", "Data", "Status", "Ações"].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-[11px] tracking-[0.1em] uppercase" style={{ color: "#A7A39B", fontWeight: 500 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!leadsLoading && leads.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-[#A7A39B] text-sm">
                              Nenhum lead recebido ainda.
                            </td>
                          </tr>
                        )}
                        {leads.map((lead, i) => (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + i * 0.05 }}
                            className="group transition-colors duration-150 hover:bg-white/[0.02]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                                  style={{ background: "rgba(181,159,120,0.12)", color: "#B59F78", fontWeight: 600 }}
                                >
                                  {lead.name.charAt(0)}
                                </div>
                                <span className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>{lead.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[#A7A39B] text-xs">
                                  <Mail size={11} />
                                  {lead.email}
                                </div>
                                <div className="flex items-center gap-1.5 text-[#A7A39B] text-xs">
                                  <Phone size={11} />
                                  {lead.phone}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-[220px]">
                              <p className="text-[#A7A39B] text-sm truncate" style={{ fontWeight: 400 }}>
                                {lead.message}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-[#A7A39B] text-xs">
                                <Calendar size={11} />
                                {lead.date}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={lead.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                {([
                                  { status: "contato" as LeadStatus, label: "Em Contato", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
                                  { status: "fechado"  as LeadStatus, label: "Fechado",    color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
                                  { status: "perdido"  as LeadStatus, label: "Perdido",    color: "#f87171", bg: "rgba(248,113,113,0.12)" },
                                ]).map((action) => {
                                  const isActive = lead.status === action.status;
                                  return (
                                    <button
                                      key={action.status}
                                      onClick={() => updateLeadStatus(lead.id, action.status)}
                                      className="px-2.5 py-1 rounded-full text-[11px] transition-all duration-200 whitespace-nowrap"
                                      style={{
                                        color: action.color,
                                        background: isActive ? action.bg : "transparent",
                                        border: `1px solid ${isActive ? action.color + "55" : "rgba(255,255,255,0.07)"}`,
                                        fontWeight: isActive ? 600 : 400,
                                        opacity: isActive ? 1 : 0.6,
                                      }}
                                    >
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards mobile */}
                  <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    {!leadsLoading && leads.length === 0 && (
                      <div className="p-5 text-center text-[#A7A39B] text-sm">
                        Nenhum lead recebido ainda.
                      </div>
                    )}
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>{lead.name}</span>
                          <StatusBadge status={lead.status} />
                        </div>
                        <p className="text-[#A7A39B] text-xs">{lead.email}</p>
                        <p className="text-[#A7A39B] text-xs truncate">{lead.message}</p>
                        <p className="text-[#A7A39B]/60 text-[11px]">{lead.date}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          {([
                            { status: "contato" as LeadStatus, label: "Em Contato", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
                            { status: "fechado"  as LeadStatus, label: "Fechado",    color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
                            { status: "perdido"  as LeadStatus, label: "Perdido",    color: "#f87171", bg: "rgba(248,113,113,0.12)" },
                          ]).map((action) => {
                            const isActive = lead.status === action.status;
                            return (
                              <button
                                key={action.status}
                                onClick={() => updateLeadStatus(lead.id, action.status)}
                                className="px-2.5 py-1 rounded-full text-[11px] transition-all duration-200 whitespace-nowrap"
                                style={{
                                  color: action.color,
                                  background: isActive ? action.bg : "transparent",
                                  border: `1px solid ${isActive ? action.color + "55" : "rgba(255,255,255,0.07)"}`,
                                  fontWeight: isActive ? 600 : 400,
                                  opacity: isActive ? 1 : 0.6,
                                }}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── GALLERY ── */}
            {activeTab === "gallery" && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Hidden sub-photo file input */}
                <input
                  ref={subFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSubFileChange}
                />

                {/* Upload card */}
                <div
                  className="p-6 lg:p-8 rounded-[20px] border"
                  style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
                    NOVO PROJETO
                  </p>
                  <h2 className="text-[#F2F0EA] text-xl mb-6" style={{ fontWeight: 400 }}>
                    Adicionar ao portfólio
                  </h2>

                  <form onSubmit={handleProjectSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      {/* LEFT: foto principal + subfotos */}
                      <div className="space-y-3">
                        {/* Main photo drop zone */}
                        <p className="text-[#A7A39B] text-xs tracking-wide uppercase" style={{ fontWeight: 500 }}>Foto Principal</p>
                        <div
                          className="relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden"
                          style={{
                            minHeight: "200px",
                            borderColor: isDragging ? "#B59F78" : "rgba(181,159,120,0.25)",
                            background: isDragging ? "rgba(181,159,120,0.05)" : "rgba(255,255,255,0.02)",
                          }}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={onDropMain}
                          onClick={() => mainFileRef.current?.click()}
                        >
                          {mainPreview ? (
                            <>
                              <img src={mainPreview} alt="Foto principal" className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <div className="flex flex-col items-center gap-2 text-white">
                                  <Upload size={22} />
                                  <span className="text-sm" style={{ fontWeight: 500 }}>Trocar</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3 p-6 text-center">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(181,159,120,0.1)" }}>
                                <Upload size={20} style={{ color: "#B59F78" }} />
                              </div>
                              <p className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>Arraste ou clique</p>
                              <p className="text-[#A7A39B] text-xs">PNG, JPG, WEBP — até 10MB</p>
                            </div>
                          )}
                          <input ref={mainFileRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainFile(f); }} />
                        </div>

                        {/* Sub-photos 2×2 grid */}
                        <p className="text-[#A7A39B] text-xs tracking-wide uppercase pt-1" style={{ fontWeight: 500 }}>
                          Subfotos <span style={{ color: "rgba(167,163,155,0.5)", textTransform: "none", letterSpacing: 0 }}>(até 4)</span>
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {[0, 1, 2, 3].map((slot) => {
                            const preview = subPreviews[slot];
                            return (
                              <div key={slot} className="relative group">
                                <div
                                  className="relative rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 border"
                                  style={{
                                    aspectRatio: "1/1",
                                    background: preview ? "transparent" : "rgba(255,255,255,0.03)",
                                    borderColor: preview ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)",
                                    borderStyle: preview ? "solid" : "dashed",
                                  }}
                                  onClick={() => openSubSlot(slot)}
                                >
                                  {preview ? (
                                    <img src={preview} alt={`Subfoto ${slot + 1}`} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span style={{ color: "rgba(181,159,120,0.4)", fontSize: "20px", lineHeight: 1 }}>+</span>
                                    </div>
                                  )}
                                </div>
                                {preview && (
                                  <button
                                    type="button"
                                    onClick={() => removeSubPreview(slot)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    style={{ background: "#f87171", zIndex: 10 }}
                                  >
                                    <X size={10} style={{ color: "#fff" }} />
                                  </button>
                                )}
                                <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded"
                                  style={{ background: "rgba(0,0,0,0.55)", color: "#A7A39B", fontWeight: 500 }}>
                                  {slot + 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* RIGHT: form fields */}
                      <div className="space-y-4">
                        {/* Title */}
                        <div className="relative">
                          <input type="text" id="proj-title" value={photoForm.title}
                            onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                            placeholder=" "
                            className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                            style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }}
                            required />
                          <label htmlFor="proj-title"
                            className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                            style={{ fontWeight: 400 }}>Título do projeto</label>
                        </div>

                        {/* Description */}
                        <div className="relative">
                          <textarea id="proj-desc" value={photoForm.description}
                            onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                            placeholder=" " rows={3}
                            className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none resize-none peer transition-all duration-200"
                            style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                          <label htmlFor="proj-desc"
                            className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                            style={{ fontWeight: 400 }}>Descrição</label>
                        </div>

                        {/* Category */}
                        <div className="flex gap-3">
                          {(["arquitetura", "marcenaria"] as PhotoCategory[]).map((cat) => {
                            const active = photoForm.category === cat;
                            const cfg = categoryConfig[cat];
                            return (
                              <button key={cat} type="button"
                                onClick={() => setPhotoForm({ ...photoForm, category: cat })}
                                className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
                                style={{
                                  background: active ? cfg.bg : "#0E1414",
                                  border: `1px solid ${active ? cfg.color + "55" : "rgba(255,255,255,0.06)"}`,
                                  color: active ? cfg.color : "#A7A39B",
                                  fontWeight: active ? 500 : 400,
                                }}>
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Order + Featured */}
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <input type="number" id="proj-order" value={photoForm.order} min={1}
                              onChange={(e) => setPhotoForm({ ...photoForm, order: Number(e.target.value) })}
                              placeholder=" "
                              className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                              style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                            <label htmlFor="proj-order"
                              className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                              style={{ fontWeight: 400 }}>Ordem</label>
                          </div>
                          <button type="button"
                            onClick={() => setPhotoForm({ ...photoForm, featured: !photoForm.featured })}
                            className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] transition-all duration-300 flex-shrink-0"
                            style={{
                              background: photoForm.featured ? "rgba(181,159,120,0.12)" : "#0E1414",
                              border: `1px solid ${photoForm.featured ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)"}`,
                            }}>
                            <Star size={16} style={{ color: photoForm.featured ? "#B59F78" : "#A7A39B", fill: photoForm.featured ? "#B59F78" : "none" }} />
                            <span className="text-sm whitespace-nowrap" style={{ color: photoForm.featured ? "#B59F78" : "#A7A39B", fontWeight: photoForm.featured ? 500 : 400 }}>
                              Destaque
                            </span>
                          </button>
                        </div>

                        {/* Submit */}
                        <motion.button type="submit"
                          whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                          disabled={!mainFile || projectSaving}
                          className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300"
                          style={{
                            background: mainFile && !projectSaving ? "#B59F78" : "rgba(181,159,120,0.2)",
                            color: mainFile && !projectSaving ? "#050808" : "#B59F78",
                            fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em",
                            boxShadow: mainFile && !projectSaving ? "0 10px 30px rgba(181,159,120,0.2)" : "none",
                            cursor: mainFile && !projectSaving ? "pointer" : "not-allowed",
                          }}>
                          <Upload size={16} />
                          Adicionar ao portfólio
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Projects grid */}
                <div>
                  {/* Filter + count */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    {projectsError && (
                      <p className="basis-full text-[#f87171] text-xs leading-relaxed" style={{ fontWeight: 400 }}>
                        Nao foi possivel sincronizar a galeria. Verifique STORAGE_REDIS_URL e BLOB_READ_WRITE_TOKEN.
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {([
                        { id: "todos",       label: "Todos",       count: projects.length },
                        { id: "arquitetura", label: "Arquitetura", count: projects.filter((p) => p.category === "arquitetura").length },
                        { id: "marcenaria",  label: "Marcenaria",  count: projects.filter((p) => p.category === "marcenaria").length },
                      ] as { id: PhotoCategory | "todos"; label: string; count: number }[]).map((tab) => {
                        const active = galleryFilter === tab.id;
                        return (
                          <button key={tab.id} onClick={() => setGalleryFilter(tab.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200"
                            style={{
                              background: active ? "rgba(181,159,120,0.12)" : "transparent",
                              border: `1px solid ${active ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.07)"}`,
                              color: active ? "#B59F78" : "#A7A39B",
                              fontWeight: active ? 500 : 400,
                            }}>
                            {tab.label}
                            <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                              style={{ background: active ? "rgba(181,159,120,0.2)" : "rgba(255,255,255,0.06)", color: active ? "#B59F78" : "#A7A39B" }}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GripVertical size={14} style={{ color: "#A7A39B" }} />
                      <span className="text-[#A7A39B] text-xs hidden sm:block" style={{ fontWeight: 400 }}>
                        {projectsLoading ? "Carregando projetos..." : "Ordene pelo campo Ordem"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {!projectsLoading && projects.filter((p) => galleryFilter === "todos" || p.category === galleryFilter).length === 0 && (
                      <div
                        className="sm:col-span-2 lg:col-span-3 py-12 text-center rounded-[16px] border"
                        style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
                      >
                        <p className="text-[#A7A39B] text-sm" style={{ fontWeight: 400 }}>
                          Nenhum projeto cadastrado.
                        </p>
                      </div>
                    )}
                    {projects
                      .filter((p) => galleryFilter === "todos" || p.category === galleryFilter)
                      .map((project, i) => {
                        const isExpanded = expandedId === project.id;
                        const catCfg = categoryConfig[project.category];
                        return (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="group rounded-[16px] overflow-hidden border transition-all duration-300 hover:border-[#B59F78]/20"
                            style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                          >
                            {/* Main photo */}
                            <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                              {project.mainPhoto.preview ? (
                                <img src={project.mainPhoto.preview} alt={project.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                                  style={{ background: project.mainPhoto.gradient }} />
                              )}

                              {/* Hover controls */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <button onClick={() => toggleFeatured(project.id)}
                                  className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                  style={{ background: "rgba(181,159,120,0.25)", backdropFilter: "blur(8px)" }} title="Alternar destaque">
                                  <Star size={16} style={{ color: "#B59F78", fill: project.featured ? "#B59F78" : "none" }} />
                                </button>
                                <button onClick={() => openEdit(project)}
                                  className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }} title="Editar projeto">
                                  <Pencil size={15} style={{ color: "#F2F0EA" }} />
                                </button>
                                <button onClick={() => deleteProject(project.id)}
                                  className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                  style={{ background: "rgba(248,113,113,0.25)", backdropFilter: "blur(8px)" }} title="Excluir projeto">
                                  <Trash2 size={16} style={{ color: "#f87171" }} />
                                </button>
                              </div>

                              {/* Featured badge */}
                              {project.featured && (
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                                  style={{ background: "rgba(181,159,120,0.9)", backdropFilter: "blur(8px)" }}>
                                  <Star size={10} style={{ color: "#050808", fill: "#050808" }} />
                                  <span className="text-[10px] text-[#050808]" style={{ fontWeight: 600 }}>Destaque</span>
                                </div>
                              )}

                              {/* Order */}
                              <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(5,8,8,0.7)", backdropFilter: "blur(8px)" }}>
                                <span className="text-[#A7A39B] text-xs" style={{ fontWeight: 600 }}>{project.order}</span>
                              </div>

                              {/* Category */}
                              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full"
                                style={{ background: catCfg.bg, backdropFilter: "blur(8px)" }}>
                                <span className="text-[10px]" style={{ color: catCfg.color, fontWeight: 600 }}>{catCfg.label}</span>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 pb-3">
                              <p className="text-[#F2F0EA] text-sm mb-1 truncate" style={{ fontWeight: 500 }}>{project.title}</p>
                              <p className="text-[#A7A39B] text-xs leading-relaxed line-clamp-2" style={{ fontWeight: 400 }}>{project.description}</p>
                            </div>

                            {/* Sub-photos strip + toggle */}
                            <div className="px-4 pb-4 space-y-3">
                              {/* Thumbnails row */}
                              <div className="flex items-center gap-1.5">
                                {[0, 1, 2, 3].map((slot) => {
                                  const sub = project.subPhotos[slot];
                                  return (
                                    <div key={slot}
                                      className="rounded-[6px] overflow-hidden flex-1 border"
                                      style={{ aspectRatio: "1/1", background: sub ? "transparent" : "rgba(255,255,255,0.03)", borderColor: sub ? "rgba(181,159,120,0.2)" : "rgba(255,255,255,0.05)" }}>
                                      {sub?.preview ? (
                                        <img src={sub.preview} alt="" className="w-full h-full object-cover" />
                                      ) : sub ? (
                                        <div className="w-full h-full" style={{ background: sub.gradient }} />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "12px" }}>+</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                                  className="flex-shrink-0 ml-1 text-xs px-2.5 py-1.5 rounded-[8px] transition-all duration-200 whitespace-nowrap"
                                  style={{
                                    background: isExpanded ? "rgba(181,159,120,0.12)" : "rgba(255,255,255,0.04)",
                                    color: isExpanded ? "#B59F78" : "#A7A39B",
                                    border: `1px solid ${isExpanded ? "rgba(181,159,120,0.25)" : "rgba(255,255,255,0.06)"}`,
                                    fontWeight: 500,
                                  }}>
                                  {project.subPhotos.length} foto{project.subPhotos.length !== 1 ? "s" : ""}
                                </button>
                              </div>

                              {/* Expanded sub-photos */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                      <p className="text-[#A7A39B] text-[10px] tracking-widest uppercase mb-2" style={{ fontWeight: 500 }}>
                                        Subfotos do projeto
                                      </p>
                                      {project.subPhotos.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-1.5">
                                          {project.subPhotos.map((sub) => (
                                            <div key={sub.id} className="rounded-[8px] overflow-hidden" style={{ aspectRatio: "4/3" }}>
                                              {sub.preview ? (
                                                <img src={sub.preview} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full" style={{ background: sub.gradient }} />
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-[#A7A39B]/50 text-xs text-center py-3" style={{ fontWeight: 400 }}>
                                          Nenhuma subfoto adicionada
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editingProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="fixed inset-0 z-50 bg-black/70"
              style={{ backdropFilter: "blur(8px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] border pointer-events-auto"
                style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div>
                    <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>EDITAR PROJETO</p>
                    <h2 className="text-[#F2F0EA] text-xl" style={{ fontWeight: 400 }}>{editingProject.title}</h2>
                  </div>
                  <button
                    onClick={() => setEditingProject(null)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                    style={{ color: "#A7A39B" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Hidden inputs */}
                <input ref={editMainFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEditMainFile(f); }} />
                <input ref={editSubFileRef} type="file" accept="image/*" className="hidden"
                  onChange={handleEditSubFileChange} />

                {/* Form */}
                <form onSubmit={handleEditSubmit} className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* LEFT: fotos */}
                    <div className="space-y-3">
                      <p className="text-[#A7A39B] text-xs tracking-wide uppercase" style={{ fontWeight: 500 }}>Foto Principal</p>
                      <div
                        className="relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden"
                        style={{ minHeight: "180px", borderColor: editIsDragging ? "#B59F78" : "rgba(181,159,120,0.25)", background: editIsDragging ? "rgba(181,159,120,0.05)" : "rgba(255,255,255,0.02)" }}
                        onDragOver={(e) => { e.preventDefault(); setEditIsDragging(true); }}
                        onDragLeave={() => setEditIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setEditIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleEditMainFile(f); }}
                        onClick={() => editMainFileRef.current?.click()}
                      >
                        {editMainPreview ? (
                          <>
                            <img src={editMainPreview} alt="Foto principal" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="flex flex-col items-center gap-2 text-white"><Upload size={20} /><span className="text-sm" style={{ fontWeight: 500 }}>Trocar</span></div>
                            </div>
                          </>
                        ) : editMainGradient ? (
                          <>
                            <div className="absolute inset-0" style={{ background: editMainGradient }} />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="flex flex-col items-center gap-2 text-white"><Upload size={20} /><span className="text-sm" style={{ fontWeight: 500 }}>Trocar</span></div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 p-6 text-center">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(181,159,120,0.1)" }}>
                              <Upload size={18} style={{ color: "#B59F78" }} />
                            </div>
                            <p className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>Arraste ou clique</p>
                          </div>
                        )}
                      </div>

                      <p className="text-[#A7A39B] text-xs tracking-wide uppercase pt-1" style={{ fontWeight: 500 }}>
                        Subfotos <span style={{ color: "rgba(167,163,155,0.5)", textTransform: "none", letterSpacing: 0 }}>(até 4)</span>
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((slot) => {
                          const sub = editSubSlots[slot];
                          return (
                            <div key={slot} className="relative group">
                              <div
                                className="relative rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 border"
                                style={{ aspectRatio: "1/1", background: sub ? "transparent" : "rgba(255,255,255,0.03)", borderColor: sub ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)", borderStyle: sub ? "solid" : "dashed" }}
                                onClick={() => openEditSubSlot(slot)}
                              >
                                {sub?.preview ? (
                                  <img src={sub.preview} alt="" className="w-full h-full object-cover" />
                                ) : sub?.gradient ? (
                                  <div className="w-full h-full" style={{ background: sub.gradient }} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span style={{ color: "rgba(181,159,120,0.4)", fontSize: "20px", lineHeight: 1 }}>+</span>
                                  </div>
                                )}
                              </div>
                              {sub && (
                                <button type="button" onClick={() => removeEditSubSlot(slot)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  style={{ background: "#f87171", zIndex: 10 }}>
                                  <X size={10} style={{ color: "#fff" }} />
                                </button>
                              )}
                              <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded"
                                style={{ background: "rgba(0,0,0,0.55)", color: "#A7A39B", fontWeight: 500 }}>{slot + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* RIGHT: campos */}
                    <div className="space-y-4">
                      <div className="relative">
                        <input type="text" id="edit-title" value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder=" "
                          className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                          style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }}
                          required />
                        <label htmlFor="edit-title"
                          className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                          style={{ fontWeight: 400 }}>Título do projeto</label>
                      </div>

                      <div className="relative">
                        <textarea id="edit-desc" value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder=" " rows={3}
                          className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none resize-none peer transition-all duration-200"
                          style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                        <label htmlFor="edit-desc"
                          className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                          style={{ fontWeight: 400 }}>Descrição</label>
                      </div>

                      <div className="flex gap-3">
                        {(["arquitetura", "marcenaria"] as PhotoCategory[]).map((cat) => {
                          const active = editForm.category === cat;
                          const cfg = categoryConfig[cat];
                          return (
                            <button key={cat} type="button"
                              onClick={() => setEditForm({ ...editForm, category: cat })}
                              className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
                              style={{ background: active ? cfg.bg : "#0E1414", border: `1px solid ${active ? cfg.color + "55" : "rgba(255,255,255,0.06)"}`, color: active ? cfg.color : "#A7A39B", fontWeight: active ? 500 : 400 }}>
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <input type="number" id="edit-order" value={editForm.order} min={1}
                            onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })}
                            placeholder=" "
                            className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                            style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                          <label htmlFor="edit-order"
                            className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                            style={{ fontWeight: 400 }}>Ordem</label>
                        </div>
                        <button type="button"
                          onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] transition-all duration-300 flex-shrink-0"
                          style={{ background: editForm.featured ? "rgba(181,159,120,0.12)" : "#0E1414", border: `1px solid ${editForm.featured ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                          <Star size={16} style={{ color: editForm.featured ? "#B59F78" : "#A7A39B", fill: editForm.featured ? "#B59F78" : "none" }} />
                          <span className="text-sm whitespace-nowrap" style={{ color: editForm.featured ? "#B59F78" : "#A7A39B", fontWeight: editForm.featured ? 500 : 400 }}>Destaque</span>
                        </button>
                      </div>

                      <motion.button type="submit"
                        whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                        disabled={projectSaving}
                        className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300 mt-2"
                        style={{ background: projectSaving ? "rgba(181,159,120,0.2)" : "#B59F78", color: projectSaving ? "#B59F78" : "#050808", fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em", boxShadow: projectSaving ? "none" : "0 10px 30px rgba(181,159,120,0.2)", cursor: projectSaving ? "not-allowed" : "pointer" }}>
                        Salvar alterações
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
