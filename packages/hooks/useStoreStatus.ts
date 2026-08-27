'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';

interface StoreStatus {
  isOpen: boolean;
  bannerUrl?: string;
  emergencyClosed?: boolean;
}

/** Estado del local (abierto/cerrado + banner) con refetch al volver a la pestaña */
export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus>({ isOpen: false }); // Default cerrado por seguridad
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await apiFetch<StoreStatus>('/api/config/status');
      setStatus(data);
    } catch (err) {
      console.error('[useStoreStatus]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void fetchStatus();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return { ...status, loading, refetch: fetchStatus };
}
