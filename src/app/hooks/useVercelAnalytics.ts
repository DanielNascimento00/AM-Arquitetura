import { useState, useEffect } from "react";

export interface DayData {
  day: string;
  visits: number;
}

interface AnalyticsResult {
  totalViews: number;
  last14Days: DayData[];
  loading: boolean;
  error: boolean;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function extractRows(json: unknown): { key: string; total: number }[] {
  if (!json || typeof json !== "object") return [];
  const j = json as Record<string, unknown>;

  // Tenta os formatos possíveis da API do Vercel
  const candidates = [
    j["data"],
    (j["data"] as Record<string, unknown>)?.["result"],
    j["result"],
    j["timeseries"],
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      return c.map((row: Record<string, unknown>) => ({
        key:   String(row["key"] ?? row["timestamp"] ?? row["date"] ?? ""),
        total: Number(row["total"] ?? row["pageviews"] ?? row["views"] ?? row["count"] ?? 0),
      }));
    }
  }
  return [];
}

export function useVercelAnalytics(): AnalyticsResult {
  const [totalViews, setTotalViews] = useState(0);
  const [last14Days, setLast14Days] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const endAt   = Date.now();
    const startAt = endAt - 14 * 24 * 60 * 60 * 1000;

    fetch(`/api/analytics?startAt=${startAt}&endAt=${endAt}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((json) => {
        console.log("[Vercel Analytics] resposta bruta:", JSON.stringify(json, null, 2));
        const rows = extractRows(json);
        console.log("[Vercel Analytics] linhas extraídas:", rows);
        const days = rows
          .filter((r) => r.key)
          .map((r) => ({ day: formatDay(r.key), visits: r.total }));
        const total = days.reduce((s, d) => s + d.visits, 0);
        setLast14Days(days);
        setTotalViews(total);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Vercel Analytics] erro:", err);
        setLoading(false);
        setError(true);
      });
  }, []);

  return { totalViews, last14Days, loading, error };
}
