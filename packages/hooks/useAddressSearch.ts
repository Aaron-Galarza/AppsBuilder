'use client';

import { AddressResult } from '@saas/types';
import { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 4;

/** Búsqueda de direcciones con debounce y mínimo de caracteres */
export function useAddressSearch() {
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryState] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch<AddressResult[]>('/api/geocoding', {
          method: 'POST',
          body: JSON.stringify({ query: trimmed }),
        });
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al buscar la dirección');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return {
    results,
    loading,
    error,
    search: setQueryState,
    clear: () => {
      setQueryState('');
      setResults([]);
      setError(null);
    },
  };
}
