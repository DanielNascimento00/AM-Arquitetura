import { useState, useEffect } from "react";
import { authHeaders } from "@/app/auth";

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

function extractRows(json: unknown): { key: string; total: number }[] {
  if (!json || typeof json !== "object") return [];
  const j = json as Record<string, unknown>;

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
    fetch("/api/analytics", { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((json) => {
        const rows = extractRows(json);
        const days = rows
          .filter((r) => r.key)
          .map((r) => ({ day: r.key, visits: r.total }));
        const total = days.reduce((s, d) => s + d.visits, 0);
        setLast14Days(days);
        setTotalViews(total);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  return { totalViews, last14Days, loading, error };
}
