import { useState, useEffect } from "react";

interface DayData {
  day: string;
  visits: number;
}

interface AnalyticsResult {
  totalViews: number;
  last14Days: DayData[];
  loading: boolean;
  error: boolean;
}

const TOKEN      = import.meta.env.VITE_VERCEL_TOKEN as string | undefined;
const PROJECT_ID = import.meta.env.VITE_VERCEL_PROJECT_ID as string | undefined;
const TEAM_ID    = import.meta.env.VITE_VERCEL_TEAM_ID as string | undefined;

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function useVercelAnalytics(): AnalyticsResult {
  const [totalViews, setTotalViews] = useState(0);
  const [last14Days, setLast14Days] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!TOKEN || !PROJECT_ID) {
      setLoading(false);
      setError(true);
      return;
    }

    const endAt   = Date.now();
    const startAt = endAt - 14 * 24 * 60 * 60 * 1000;

    const params = new URLSearchParams({
      projectId:   PROJECT_ID,
      startAt:     String(startAt),
      endAt:       String(endAt),
      environment: "production",
      granularity: "1d",
      ...(TEAM_ID ? { teamId: TEAM_ID } : {}),
    });

    fetch(`https://vercel.com/api/web-analytics/timeseries?${params}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((json) => {
        const rows: { key: string; total: number }[] = json?.data ?? [];
        const days = rows.map((r) => ({ day: formatDay(r.key), visits: r.total }));
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
