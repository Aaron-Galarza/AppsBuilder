'use client';

import { useState } from 'react';
import { useStoreStatus } from '@saas/hooks';
import { formatPrice } from '@saas/utils';
import { Product } from '@saas/types';
import { ChevronDown } from 'lucide-react';

export interface MenuListProps {
  products: Product[];
}

/** Lista de productos con descripción expandible */
export function MenuList({ products }: MenuListProps) {
  const { isOpen } = useStoreStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (products.length === 0) return null;

  return (
    <ul className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white">
      {products.map((product) => {
        const expanded = expandedId === product._id;
        const disabled = !isOpen || !product.available;

        return (
          <li key={product._id}>
            <button
              onClick={() => setExpandedId(expanded ? null : product._id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              aria-expanded={expanded}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{product.title}</span>
                <span
                  className="mt-0.5 block text-base font-bold"
                  style={{ color: 'var(--color-primary, #111)' }}
                >
                  {formatPrice(product.price)}
                </span>
              </span>
              <ChevronDown
                size={18}
                className={
                  expanded ? 'shrink-0 rotate-180 text-neutral-400 transition' : 'shrink-0 text-neutral-400 transition'
                }
              />
            </button>

            {expanded && (
              <div className="px-4 pb-4">
                {product.description && (
                  <p className="mb-3 text-xs leading-relaxed text-neutral-500">{product.description}</p>
                )}
                <button
                  onClick={() => setExpandedId(null)}
                  disabled={disabled}
                  className={
                    disabled
                      ? 'w-full cursor-not-allowed rounded-md bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500'
                      : 'w-full rounded-md px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98]'
                  }
                  style={disabled ? undefined : { backgroundColor: 'var(--color-primary, #111)' }}
                >
                  Agregar al pedido
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
