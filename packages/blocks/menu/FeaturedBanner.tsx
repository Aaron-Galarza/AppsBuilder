'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@saas/ui';

const DEBOUNCE_MS = 300;

export interface FeaturedBannerProps {
  /** Fondo del hero. Si no está configurado (o la imagen no carga) se usa un fondo negro. */
  bannerUrl?: string;
  logo?: string;
  /** Nombre del negocio (título del hero). */
  name: string;
  /** Frase secundaria en itálica. */
  subtitle?: string;
  isOpen: boolean;
  /** Mientras es true no se muestra la pastilla de estado (evita parpadeo). */
  loading?: boolean;
  /** Estado de búsqueda controlado por el padre (normalmente el del useMenu de la página). */
  searchQuery: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  openLabel?: string;
  closedLabel?: string;
  /** Alto mínimo del hero. */
  minHeightClass?: string;
  /** Permite ocultar el buscador cuando la página ya tiene uno. */
  showSearch?: boolean;
}

/**
 * Hero principal "destacado": la imagen de bannerUrl ocupa todo el ancho como fondo,
 * con velo oscuro encima y logo + nombre + subtítulo + estado + buscador centrados.
 * Sin banner configurado el fondo queda negro (no usa la imagen del hero del wizard).
 */
export function FeaturedBanner({
  bannerUrl,
  logo,
  name,
  subtitle,
  isOpen,
  loading = false,
  searchQuery,
  onSearch,
  placeholder = 'Buscar productos...',
  openLabel = 'ABIERTO AHORA',
  closedLabel = 'CERRADO',
  minHeightClass = 'min-h-[440px]',
  showSearch = true,
}: FeaturedBannerProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => onSearch(localSearch), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch, searchQuery]);

  // Si el dueño cambia la URL del banner hay que reintentar la carga de la imagen
  useEffect(() => {
    setImageBroken(false);
  }, [bannerUrl]);

  const showImage = Boolean(bannerUrl) && !imageBroken;

  return (
    <section
      className={cn('relative flex w-full flex-col items-center justify-center overflow-hidden bg-black', minHeightClass)}
      aria-label={name}
    >
      {showImage && (
        <img
          src={bannerUrl}
          alt={name}
          onError={() => setImageBroken(true)}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Velo oscuro para que el contenido se lea sobre cualquier imagen */}
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-4 pb-8 pt-10 text-center">
        {logo && (
          <div className="mb-5 h-24 w-24 overflow-hidden rounded-full border-2 border-primary/40 bg-black/60 shadow-[0_0_32px_rgba(255,255,255,0.18)]">
            <img src={logo} alt={name} className="h-full w-full object-cover" />
          </div>
        )}

        <h1 className="mb-1 font-heading text-3xl font-semibold italic tracking-[0.18em] text-primary sm:text-4xl">
          {name}
        </h1>

        {subtitle && <p className="mb-5 font-heading text-base italic text-white/70">{subtitle}</p>}

        {!loading && (
          <div
            className={cn(
              'mb-6 flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
              isOpen
                ? 'border-green-500/40 bg-green-500/10 text-green-400'
                : 'border-red-500/40 bg-red-500/10 text-red-400'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', isOpen ? 'bg-green-500' : 'bg-red-500')} />
            {isOpen ? openLabel : closedLabel}
          </div>
        )}

        {showSearch && (
          <div className="relative mb-2 w-full">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              aria-hidden="true"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={placeholder}
              aria-label="Buscar productos"
              className="h-11 w-full rounded-xl border border-white/15 bg-black/50 pl-10 pr-10 text-sm text-white placeholder:text-white/35 backdrop-blur-sm focus:border-primary/50 focus:outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearch('');
                }}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
