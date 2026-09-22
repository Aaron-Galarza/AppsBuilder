'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from './lib/api';

interface StoreStatus {
  isOpen: boolean;
  bannerUrl?: string;
  emergencyClosed?: boolean;
}

const POLL_MS = 15000;

/** Estado del local (abierto/cerrado + banner): refetch al volver a la pestaña y polling (15s) */
export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus>({ isOpen: false }); // Default cerrado por seguridad
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const data = await apiFetch<StoreStatus>('/api/config/status');
      setStatus(data);
    } catch (err) {
      console.error('[useStoreStatus]', err);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();

    const id = window.setInterval(fetchStatus, POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void fetchStatus();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchStatus]);

  return { ...status, loading, refetch: fetchStatus };
}
