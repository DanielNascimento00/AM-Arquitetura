import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Images, LogOut, Menu, X, FolderPlus, Settings,
} from "lucide-react";
import { logout, authHeaders } from "@/app/auth";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useToast } from "@/app/components/Toast";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-4.png";
import {
  normalizeProject, type AdminContext, type AdminProfile, type ApiProject, type Project,
} from "./admin/shared";

const navItems = [
  { to: "/admin/adicionar",     icon: FolderPlus,      label: "Adicionar Projetos" },
  { to: "/admin/galeria",       icon: Images,          label: "Galeria de Projetos" },
  { to: "/admin/analitico",     icon: LayoutDashboard, label: "Painel Analítico" },
  { to: "/admin/configuracoes", icon: Settings,        label: "Configurações" },
];

const pageInfo: Record<string, { title: string; subtitle: string }> = {
  "/admin/adicionar":     { title: "Adicionar Projetos",  subtitle: "Cadastre novos projetos no portfólio" },
  "/admin/galeria":       { title: "Galeria de Projetos", subtitle: "Visualize, organize e gerencie os projetos" },
  "/admin/analitico":     { title: "Painel Analítico",    subtitle: "Visão geral do desempenho do site" },
  "/admin/configuracoes": { title: "Configurações",       subtitle: "Perfil e segurança da conta" },
};

export function AdminPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleUnauthorized = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const toast = useToast();
  const [profile, setProfile] = useState<AdminProfile>({ email: "", displayName: "", avatar: "" });

  const displayName = profile.displayName.trim() || "Admin";
  const page = pageInfo[pathname.replace(/\/$/, "")] ?? pageInfo["/admin/adicionar"];

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("projects_load_failed");
        const result = await response.json() as { data?: ApiProject[] };
        if (active) {
          setProjects(Array.isArray(result.data) ? result.data.map(normalizeProject) : []);
        }
      } catch {
        if (active) toast.error("Não foi possível carregar os projetos. Atualize a página para tentar de novo.");
      } finally {
        if (active) setProjectsLoading(false);
      }
    }

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { headers: authHeaders() });
        if (response.status === 401) { handleUnauthorized(); return; }
        if (!response.ok) throw new Error("profile_load_failed");
        const result = await response.json() as { data?: AdminProfile };
        if (active && result.data) setProfile(result.data);
      } catch {
        /* mantém o perfil padrão */
      }
    }

    loadProjects();
    loadProfile();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context: AdminContext = {
    projects, setProjects, projectsLoading,
    profile, setProfile, handleUnauthorized,
  };

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
        <nav className="flex-1 px-4 space-y-1" aria-label="Menu do administrador">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group"
              style={({ isActive }) => ({
                background: isActive ? "rgba(181,159,120,0.1)" : "transparent",
                border: `1px solid ${isActive ? "rgba(181,159,120,0.2)" : "transparent"}`,
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    style={{ color: isActive ? "#B59F78" : "#A7A39B" }}
                    className="group-hover:text-[#B59F78] transition-colors duration-200"
                  />
                  <span
                    className="text-sm transition-colors duration-200"
                    style={{
                      color: isActive ? "#F2F0EA" : "#A7A39B",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B59F78]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] mb-2"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: "rgba(181,159,120,0.15)", color: "#B59F78", fontWeight: 600 }}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[#F2F0EA] text-sm truncate" style={{ fontWeight: 500 }}>{displayName}</p>
              <p className="text-[#A7A39B] text-xs truncate" style={{ fontWeight: 400 }}>{profile.email}</p>
            </div>
          </div>
          <Link
            to="/login"
            onClick={logout}
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
                {page.title}
              </h1>
              <p className="text-[#A7A39B] text-xs hidden sm:block" style={{ fontWeight: 400 }}>
                {page.subtitle}
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
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet context={context} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
