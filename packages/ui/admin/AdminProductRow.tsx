'use client';

import { UtensilsCrossed } from 'lucide-react';
import type { Product } from '@saas/types';
import { formatPrice } from '@saas/utils';
import { AdminActionButtons } from './AdminActionButtons';

export interface AdminProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggle: (product: Product) => void;
}

export function AdminProductRow({ product, onEdit, onDelete, onToggle }: AdminProductRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1A1A1A] p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="h-5 w-5 text-white/30" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{product.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          <span
            className={`text-xs ${product.available ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {product.available ? 'Disponible' : 'Agotado'}
          </span>
        </div>
      </div>

      <AdminActionButtons
        active={product.available}
        onToggle={() => onToggle(product)}
        onEdit={() => onEdit(product)}
        onDelete={() => onDelete(product)}
      />
    </div>
  );
}
