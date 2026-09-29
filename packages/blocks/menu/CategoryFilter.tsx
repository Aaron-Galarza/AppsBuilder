'use client';

import { Category } from '@saas/types';
import { getCategoryIcon } from '@saas/utils';
import { cn } from '@saas/ui';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  primaryColor?: string;
  /** chips: píldoras sobre la superficie del tema (página /menu). tabs: barra oscura tipo tabs sobre el hero (home basic). */
  variant?: 'chips' | 'tabs';
  /** Desplazamiento superior (px) al saltar al listado, para despejar el header sticky y la propia barra. */
  scrollOffset?: number;
}

const SCROLL_STEP_PX = 120;

/**
 * Barra horizontal scrollable de categorías con flechas.
 * `chips` se usa dentro del flujo de la página de menú; `tabs` es la franja oscura
 * que va justo debajo del hero. Al seleccionar hace scroll a #product-list-top.
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor = 'var(--color-primary)',
  variant = 'chips',
  scrollOffset = 130,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 4);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [categories.length, updateArrows]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = variant === 'tabs' ? el.clientWidth * 0.6 : SCROLL_STEP_PX;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const handleSelect = (id: string | null) => {
    onSelectCategory(id);
    const target = document.getElementById('product-list-top');
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - scrollOffset, behavior: 'smooth' });
  };

  if (variant === 'tabs') {
    return (
      <div className="w-full border-b border-white/5 bg-black/95 py-4 backdrop-blur-md max-md:sticky max-md:top-16 max-md:z-40">
        <div className="relative mx-auto w-full max-w-6xl">
          {showLeftArrow && (
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Categorías anteriores"
              className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 p-2 text-white shadow-lg transition hover:bg-zinc-900 md:flex"
            >
              <ChevronLeft size={20} style={{ color: primaryColor }} />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="scrollbar-none flex w-full touch-pan-x gap-3 overflow-x-auto px-6"
            style={{
              maskImage: 'linear-gradient(to right, transparent, white 4%, white 96%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, white 4%, white 96%, transparent)',
            }}
          >
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition duration-300 active:scale-95',
                selectedCategory === null
                  ? 'text-on-primary'
                  : 'bg-white/10 text-white hover:bg-white/15'
              )}
              style={selectedCategory === null ? { backgroundColor: primaryColor } : undefined}
            >
              <LayoutGrid size={18} />
              Todas
            </button>

            {categories.map((cat) => {
              const active = selectedCategory === cat._id;
              const Icon = getCategoryIcon(cat.name, cat.icon);

              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleSelect(cat._id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition duration-300 active:scale-95',
                    active ? 'text-on-primary' : 'bg-white/10 text-white hover:bg-white/15'
                  )}
                  style={active ? { backgroundColor: primaryColor } : undefined}
                >
                  <Icon size={18} />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {showRightArrow && (
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Más categorías"
              className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 p-2 text-white shadow-lg transition hover:bg-zinc-900 md:flex"
            >
              <ChevronRight size={20} style={{ color: primaryColor }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur md:static md:z-auto">
      <div className="relative flex items-center px-2 py-2">
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Categorías anteriores"
            className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-md"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="scrollbar-none flex flex-1 items-center gap-1.5 overflow-x-auto md:justify-center md:gap-3"
        >
          {/* Todos */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition md:text-sm',
              selectedCategory === null
                ? 'border-transparent text-on-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            )}
            style={selectedCategory === null ? { backgroundColor: primaryColor } : undefined}
          >
            <LayoutGrid size={15} />
            Todos
          </button>

          {categories.map((cat) => {
            const id = cat._id;
            const active = selectedCategory === id;
            const Icon = getCategoryIcon(cat.name, cat.icon);

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition md:text-sm',
                  active
                    ? 'border-transparent text-on-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                )}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                <Icon size={16} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Más categorías"
            className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-md"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
