import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Eye, Users, TrendingUp, ArrowUpRight, Mail, Phone, Calendar, MoreHorizontal,
} from "lucide-react";
import { useVercelAnalytics } from "@/app/hooks/useVercelAnalytics";
import { authHeaders } from "@/app/auth";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdmin } from "./shared";

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

export function AnalyticsPage() {
  const { handleUnauthorized } = useAdmin();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLeads() {
      try {
        const response = await fetch("/api/leads", { headers: authHeaders() });
        if (response.status === 401) { handleUnauthorized(); return; }
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

    loadLeads();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLeadStatus = async (id: number, status: LeadStatus) => {
    const previousLeads = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ id, status }),
      });

      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) throw new Error("lead_status_update_failed");
      setLeadsError(false);
    } catch {
      setLeads(previousLeads);
      setLeadsError(true);
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
