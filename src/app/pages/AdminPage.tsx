import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Images, LogOut, Eye, Users, TrendingUp,
  Upload, Star, Trash2, Menu, X, ArrowUpRight, ArrowDownRight,
  Mail, Phone, Calendar, MoreHorizontal, GripVertical,
} from "lucide-react";
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

interface Photo {
  id: number;
  title: string;
  description: string;
  order: number;
  featured: boolean;
  preview: string | null;
  gradient: string;
}

const mockPhotos: Photo[] = [
  { id: 1, title: "Sala de Estar Contemporânea", description: "Projeto com marcenaria sob medida e iluminação cênica", order: 1, featured: true, preview: null, gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { id: 2, title: "Cozinha Integrada", description: "Americana com ilha central e acabamento premium", order: 2, featured: false, preview: null, gradient: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)" },
  { id: 3, title: "Suíte Master", description: "Closet integrado com banheira e iluminação indireta", order: 3, featured: false, preview: null, gradient: "linear-gradient(135deg, #1c0a00 0%, #3d1a00 50%, #6b3a2a 100%)" },
  { id: 4, title: "Home Office", description: "Espaço funcional com estante planejada e mesa sob medida", order: 4, featured: false, preview: null, gradient: "linear-gradient(135deg, #0a1628 0%, #1a2f4a 50%, #2d4a6e 100%)" },
  { id: 5, title: "Varanda Gourmet", description: "Integração sala-varanda com pergolado e churrasqueira", order: 5, featured: false, preview: null, gradient: "linear-gradient(135deg, #0d1a0d 0%, #1a3a1a 50%, #2d5a2d 100%)" },
  { id: 6, title: "Banheiro de Luxo", description: "Mármore carrara com metais dourados e banheira freestanding", order: 6, featured: false, preview: null, gradient: "linear-gradient(135deg, #1a1008 0%, #3a2510 50%, #5a3a1a 100%)" },
];

/* ─── Helpers ────────────────────────────────────────────── */

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  novo:     { label: "Novo",      color: "#B59F78", bg: "rgba(181,159,120,0.12)" },
  contato:  { label: "Contato",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  fechado:  { label: "Fechado",   color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  perdido:  { label: "Perdido",   color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

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
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState({ title: "", description: "", order: mockPhotos.length + 1, featured: false });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) return;
    const newPhoto: Photo = {
      id: Date.now(),
      title: photoForm.title,
      description: photoForm.description,
      order: photoForm.order,
      featured: photoForm.featured,
      preview: uploadPreview,
      gradient: "",
    };
    setPhotos((prev) => [...prev, newPhoto].sort((a, b) => a.order - b.order));
    setUploadPreview(null);
    setPhotoForm({ title: "", description: "", order: photos.length + 2, featured: false });
  };

  const toggleFeatured = (id: number) =>
    setPhotos((prev) => prev.map((p) => ({ ...p, featured: p.id === id ? !p.featured : p.featured })));

  const deletePhoto = (id: number) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id));

  const stats = [
    { icon: Eye, label: "Total de Visitas", value: "12.847", trend: "+12%", up: true, sub: "vs. mês anterior" },
    { icon: Users, label: "Leads Gerados", value: "48", trend: "+8%", up: true, sub: "este mês" },
    { icon: TrendingUp, label: "Taxa de Conversão", value: "3,7%", trend: "+0,4pp", up: true, sub: "leads / visitas" },
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
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(181,159,120,0.1)" }}
                        >
                          <s.icon size={18} style={{ color: "#B59F78" }} />
                        </div>
                        <span
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                          style={{
                            color: s.up ? "#4ade80" : "#f87171",
                            background: s.up ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                            fontWeight: 500,
                          }}
                        >
                          {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {s.trend}
                        </span>
                      </div>
                      <p className="text-[#F2F0EA] text-2xl mb-0.5" style={{ fontWeight: 400 }}>
                        {s.value}
                      </p>
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
                      <p className="text-[#F2F0EA] text-2xl" style={{ fontWeight: 400 }}>6.844</p>
                      <p className="text-[#4ade80] text-xs flex items-center justify-end gap-1 mt-0.5" style={{ fontWeight: 500 }}>
                        <ArrowUpRight size={12} /> +18% vs. período anterior
                      </p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={visitData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                      {leads.filter((l) => l.status === "novo").length} novos
                    </span>
                  </div>

                  {/* Table desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          {["Nome", "Contato", "Mensagem", "Data", "Status"].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-[11px] tracking-[0.1em] uppercase" style={{ color: "#A7A39B", fontWeight: 500 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
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
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards mobile */}
                  <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>{lead.name}</span>
                          <StatusBadge status={lead.status} />
                        </div>
                        <p className="text-[#A7A39B] text-xs">{lead.email}</p>
                        <p className="text-[#A7A39B] text-xs truncate">{lead.message}</p>
                        <p className="text-[#A7A39B]/60 text-[11px]">{lead.date}</p>
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
                {/* Upload card */}
                <div
                  className="p-6 lg:p-8 rounded-[20px] border"
                  style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
                    NOVA FOTO
                  </p>
                  <h2 className="text-[#F2F0EA] text-xl mb-6" style={{ fontWeight: 400 }}>
                    Adicionar ao portfólio
                  </h2>

                  <form onSubmit={handlePhotoSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Drop zone */}
                      <div
                        className="relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden"
                        style={{
                          minHeight: "240px",
                          borderColor: isDragging ? "#B59F78" : "rgba(181,159,120,0.2)",
                          background: isDragging ? "rgba(181,159,120,0.05)" : "rgba(255,255,255,0.02)",
                        }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileRef.current?.click()}
                      >
                        {uploadPreview ? (
                          <>
                            <img
                              src={uploadPreview}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="flex flex-col items-center gap-2 text-white">
                                <Upload size={24} />
                                <span className="text-sm" style={{ fontWeight: 500 }}>Trocar imagem</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 p-8 text-center">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                              style={{ background: "rgba(181,159,120,0.1)" }}
                            >
                              <Upload size={22} style={{ color: "#B59F78" }} />
                            </div>
                            <p className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>
                              Arraste ou clique para enviar
                            </p>
                            <p className="text-[#A7A39B] text-xs" style={{ fontWeight: 400 }}>
                              PNG, JPG, WEBP — até 10MB
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                        />
                      </div>

                      {/* Form fields */}
                      <div className="space-y-4">
                        {/* Title */}
                        <div className="relative">
                          <input
                            type="text"
                            id="photo-title"
                            value={photoForm.title}
                            onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                            placeholder=" "
                            className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] transition-all duration-300 focus:outline-none peer"
                            style={{
                              background: "#0E1414",
                              border: "1px solid rgba(255,255,255,0.06)",
                              fontFamily: "Manrope, sans-serif",
                              fontSize: "15px",
                            }}
                            required
                          />
                          <label
                            htmlFor="photo-title"
                            className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                            style={{ fontWeight: 400 }}
                          >
                            Título da foto
                          </label>
                        </div>

                        {/* Description */}
                        <div className="relative">
                          <textarea
                            id="photo-desc"
                            value={photoForm.description}
                            onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                            placeholder=" "
                            rows={3}
                            className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] transition-all duration-300 focus:outline-none resize-none peer"
                            style={{
                              background: "#0E1414",
                              border: "1px solid rgba(255,255,255,0.06)",
                              fontFamily: "Manrope, sans-serif",
                              fontSize: "15px",
                            }}
                          />
                          <label
                            htmlFor="photo-desc"
                            className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                            style={{ fontWeight: 400 }}
                          >
                            Descrição
                          </label>
                        </div>

                        {/* Order + Featured row */}
                        <div className="flex items-center gap-4">
                          {/* Order */}
                          <div className="relative flex-1">
                            <input
                              type="number"
                              id="photo-order"
                              value={photoForm.order}
                              min={1}
                              onChange={(e) => setPhotoForm({ ...photoForm, order: Number(e.target.value) })}
                              placeholder=" "
                              className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] transition-all duration-300 focus:outline-none peer"
                              style={{
                                background: "#0E1414",
                                border: "1px solid rgba(255,255,255,0.06)",
                                fontFamily: "Manrope, sans-serif",
                                fontSize: "15px",
                              }}
                            />
                            <label
                              htmlFor="photo-order"
                              className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                              style={{ fontWeight: 400 }}
                            >
                              Ordem
                            </label>
                          </div>

                          {/* Featured toggle */}
                          <button
                            type="button"
                            onClick={() => setPhotoForm({ ...photoForm, featured: !photoForm.featured })}
                            className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] transition-all duration-300 flex-shrink-0"
                            style={{
                              background: photoForm.featured ? "rgba(181,159,120,0.12)" : "#0E1414",
                              border: `1px solid ${photoForm.featured ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            <Star
                              size={16}
                              style={{
                                color: photoForm.featured ? "#B59F78" : "#A7A39B",
                                fill: photoForm.featured ? "#B59F78" : "none",
                              }}
                            />
                            <span
                              className="text-sm whitespace-nowrap"
                              style={{
                                color: photoForm.featured ? "#B59F78" : "#A7A39B",
                                fontWeight: photoForm.featured ? 500 : 400,
                              }}
                            >
                              Destaque
                            </span>
                          </button>
                        </div>

                        {/* Submit */}
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300"
                          style={{
                            background: uploadPreview ? "#B59F78" : "rgba(181,159,120,0.2)",
                            color: uploadPreview ? "#050808" : "#B59F78",
                            fontWeight: 500,
                            fontSize: "15px",
                            letterSpacing: "0.03em",
                            boxShadow: uploadPreview ? "0 10px 30px rgba(181,159,120,0.2)" : "none",
                            cursor: uploadPreview ? "pointer" : "not-allowed",
                          }}
                        >
                          <Upload size={16} />
                          Adicionar ao portfólio
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Photos grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#F2F0EA] text-base" style={{ fontWeight: 500 }}>
                      Fotos no portfólio
                      <span className="ml-2 text-[#A7A39B] text-sm" style={{ fontWeight: 400 }}>
                        ({photos.length} fotos)
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <GripVertical size={14} style={{ color: "#A7A39B" }} />
                      <span className="text-[#A7A39B] text-xs hidden sm:block" style={{ fontWeight: 400 }}>
                        Ordene pelo campo Ordem
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative rounded-[16px] overflow-hidden border transition-all duration-300 hover:border-[#B59F78]/20"
                        style={{
                          background: "#0C1111",
                          borderColor: "rgba(255,255,255,0.05)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        }}
                      >
                        {/* Image area */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                          {photo.preview ? (
                            <img src={photo.preview} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div
                              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                              style={{ background: photo.gradient }}
                            />
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button
                              onClick={() => toggleFeatured(photo.id)}
                              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                              style={{ background: "rgba(181,159,120,0.2)", backdropFilter: "blur(8px)" }}
                              title="Alternar destaque"
                            >
                              <Star
                                size={16}
                                style={{
                                  color: "#B59F78",
                                  fill: photo.featured ? "#B59F78" : "none",
                                }}
                              />
                            </button>
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                              style={{ background: "rgba(248,113,113,0.2)", backdropFilter: "blur(8px)" }}
                              title="Excluir foto"
                            >
                              <Trash2 size={16} style={{ color: "#f87171" }} />
                            </button>
                          </div>

                          {/* Featured badge */}
                          {photo.featured && (
                            <div
                              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(181,159,120,0.85)", backdropFilter: "blur(8px)" }}
                            >
                              <Star size={11} style={{ color: "#050808", fill: "#050808" }} />
                              <span className="text-[10px] text-[#050808]" style={{ fontWeight: 600 }}>Destaque</span>
                            </div>
                          )}

                          {/* Order badge */}
                          <div
                            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(5,8,8,0.7)", backdropFilter: "blur(8px)" }}
                          >
                            <span className="text-[#A7A39B] text-xs" style={{ fontWeight: 600 }}>{photo.order}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <p className="text-[#F2F0EA] text-sm mb-1 truncate" style={{ fontWeight: 500 }}>
                            {photo.title}
                          </p>
                          <p className="text-[#A7A39B] text-xs leading-relaxed line-clamp-2" style={{ fontWeight: 400 }}>
                            {photo.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
