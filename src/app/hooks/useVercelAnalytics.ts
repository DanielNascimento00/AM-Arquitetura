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
