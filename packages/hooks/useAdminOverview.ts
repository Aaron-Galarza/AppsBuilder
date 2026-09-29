'use client';

import { AnalyticsStats } from '@saas/types';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAuthStore } from './useAuthStore';

export type OverviewRange = 'hoy' | 'ayer' | 'semana' | 'mes';

const VALID_RANGES: OverviewRange[] = ['hoy', 'ayer', 'semana', 'mes'];

/**
 * Métricas del OverviewTab. Sin cache local: las métricas se agregan en vivo
 * en el backend, así un cambio de estado se ve reflejado de inmediato.
 * Refetch al volver a la pestaña y método `reload` para refresco manual.
 */
export function useAdminOverview(initialRange: OverviewRange = 'hoy') {
  const token = useAuthStore((s) => s.token);

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<OverviewRange>(initialRange);

  const fetchStats = useCallback(
    async (r: OverviewRange) => {
      const validRange = VALID_RANGES.includes(r) ? r : 'hoy';
      try {
        setLoading(true);
        const data = await apiFetch<AnalyticsStats>(
          `/api/analytics?range=${encodeURIComponent(validRange)}`,
          { headers: authHeaders(token) }
        );
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar métricas');
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