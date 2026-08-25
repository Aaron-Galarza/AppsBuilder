'use client';

import { AnalyticsStats } from '@saas/types';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAuthStore } from './useAuthStore';

export type OverviewRange = 'hoy' | 'semana' | 'mes';

const VALID_RANGES: OverviewRange[] = ['hoy', 'semana', 'mes'];
/** TTL del cache: 5 min para hoy/semana, 10 min para mes */
const ttlFor = (range: OverviewRange) => (range === 'mes' ? 10 : 5) * 60 * 1000;

interface CachedStats {
  data: AnalyticsStats;
  savedAt: number;
}

function readCache(range: OverviewRange): CachedStats | null {
  try {
    const raw = localStorage.getItem(`saas-analytics-cache-${range}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStats;
    if (Date.now() - parsed.savedAt > ttlFor(range)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(range: OverviewRange, data: AnalyticsStats): void {
  try {
    localStorage.setItem(
      `saas-analytics-cache-${range}`,
      JSON.stringify({ data, savedAt: Date.now() } satisfies CachedStats)
    );
  } catch {
    /* storage lleno o no disponible: ignorar */
  }
}

/** Métricas del OverviewTab con cache TTL local y refetch al volver a la pestaña */
export function useAdminOverview(initialRange: OverviewRange = 'hoy') {
  const token = useAuthStore((s) => s.token);

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<OverviewRange>(initialRange);

  const fetchStats = useCallback(
    async (r: OverviewRange) => {
      const validRange = VALID_RANGES.includes(r) ? r : 'hoy';
      const cached = readCache(validRange);
      // Muestra cache fresco instantáneamente y refresca en background
      if (cached) setStats(cached.data);

      try {
        setLoading(!cached);
        const data = await apiFetch<AnalyticsStats>(
          `/api/analytics?range=${encodeURIComponent(validRange)}`,
          { headers: authHeaders(token) }
        );
        writeCache(validRange, data);
        setStats(data);
        setError(null);
      } catch (err) {
        // Sin cache y sin red → dejamos el error visible
        if (!cached) setError(err instanceof Error ? err.message : 'Error al cargar métricas');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void fetchStats(range);
  }, [fetchStats, range]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void fetchStats(range);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchStats, range]);

  return { stats, loading, error, range, setRange, reload: () => fetchStats(range) };
}
