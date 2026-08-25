'use client';

import { Category } from '@saas/types';
import { getCategoryIcon } from '@saas/utils';
import { cn } from '@saas/ui';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  primaryColor?: string;
}

const SCROLL_STEP_PX = 120;

/**
 * Barra horizontal scrollable de categorías con arrows y sticky en mobile.
 * Al seleccionar hace scroll a #product-list-top.
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor = '#111',
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

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * SCROLL_STEP_PX, behavior: 'smooth' });
  };

  const handleSelect = (id: string | null) => {
    onSelectCategory(id);
    document.getElementById('product-list-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur md:static md:z-auto">
      <div className="relative flex items-center px-2 py-2">
        {showLeftArrow && (
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Categorías anteriores"
            className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none md:justify-center md:gap-3"
        >
          {/* Todos */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition md:text-sm',
              selectedCategory === null
                ? 'border-transparent text-white'
                : 'border-black/10 text-neutral-600 hover:border-black/25'
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
                onClick={() => handleSelect(id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition md:text-sm',
                  active
                    ? 'border-transparent text-white'
                    : 'border-black/10 text-neutral-600 hover:border-black/25'
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
            onClick={() => scrollBy(1)}
            aria-label="Más categorías"
            className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
