'use client';

import { Input } from '@saas/ui';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

/** Input de búsqueda con debounce interno de 300ms */
export function SearchBar({ searchQuery, onSearch, placeholder = 'Buscar...' }: SearchBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sincronizar si el padre resetea la búsqueda
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;

    const timer = setTimeout(() => onSearch(localSearch), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearch]);

  return (
    <div className="relative w-full">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar productos"
        className="pl-9 pr-9"
      />
      {localSearch && (
        <button
          onClick={() => setLocalSearch('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
