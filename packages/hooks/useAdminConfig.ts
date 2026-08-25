'use client';

import { DeliveryRange, RainConfig, Schedule, StoreConfig } from '@saas/types';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAuthStore } from './useAuthStore';

/** Config del local (GET /api/config) + acciones de edición de la ConfigTab */
export function useAdminConfig() {
  const token = useAuthStore((s) => s.token);

  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<StoreConfig>('/api/config', { headers: authHeaders(token) });
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateSchedule = useCallback(
    async (schedule: Schedule) => {
      await apiFetch('/api/config/schedule', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ schedule }),
      });
      await reload();
    },
    [token, reload]
  );

  const updateBanner = useCallback(
    async (bannerUrl: string) => {
      await apiFetch('/api/config/banner', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ bannerUrl }),
      });
      await reload();
    },
    [token, reload]
  );

  const updateRain = useCallback(
    async (rain: RainConfig) => {
      await apiFetch('/api/config/rain', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ rain }),
      });
      await reload();
    },
    [token, reload]
  );

  const addDeliveryRange = useCallback(
    async (range: Omit<DeliveryRange, '_id'>) => {
      await apiFetch('/api/config/delivery-ranges', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(range),
      });
      await reload();
    },
    [token, reload]
  );

  const removeDeliveryRange = useCallback(
    async (rangeId: string) => {
      await apiFetch(`/api/config/delivery-ranges/${rangeId}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      await reload();
    },
    [token, reload]
  );

  /** Botón panic: cierre de emergencia inmediato */
  const toggleEmergency = useCallback(async () => {
    await apiFetch('/api/config/emergency', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ closed: !(config?.emergencyClosed ?? false) }),
    });
    await reload();
  }, [token, config?.emergencyClosed, reload]);

  return {
    config,
    loading,
    error,
    reload,
    updateSchedule,
    updateBanner,
    updateRain,
    addDeliveryRange,
    removeDeliveryRange,
    toggleEmergency,
  };
}
