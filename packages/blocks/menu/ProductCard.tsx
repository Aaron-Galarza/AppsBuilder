'use client';

import { Badge, Button, cn } from '@saas/ui';
import { useCartStore } from '@saas/hooks';
import { cloudinaryImage, formatPrice } from '@saas/utils';
import { Product } from '@saas/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export interface ProductCardProps {
  product: Product;
  isStoreOpen: boolean;
  variant?: 'horizontal' | 'vertical';
  priority?: boolean;
  /** Se pasa cuando la app usa AddonsModal: abre el modal en vez de agregar directo */
  onOpenAddons?: (product: Product) => void;
}

const FALLBACK_EMOJI = '🍽️';

/** Card de producto con botón agregar al carrito */
export function ProductCard({
  product,
  isStoreOpen,
  variant = 'horizontal',
  priority = false,
  onOpenAddons,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [imageError, setImageError] = useState(false);

  const isOutOfStock =
    product.controlStock === true && (product.stock ?? 0) <= 0;
  const isButtonDisabled = !isStoreOpen || !product.available || isOutOfStock;

  const isValidImage =
    typeof product.image === 'string' &&
    (product.image.startsWith('http') || product.image.startsWith('/'));

  const handleAdd = () => {
    if (isButtonDisabled) return;
    // Producto con adicionales → modal; simple → directo al carrito
    if (onOpenAddons && (product.addons?.length ?? 0) > 0) {
      onOpenAddons(product);
      return;
    }
    addItem(product, 1, []);
  };

  const imageSrc = isValidImage ? cloudinaryImage(product.image, 400) : '';
  const outOfStockBadge = isOutOfStock ? <Badge variant="destructive">Sin stock</Badge> : null;

  /* ------------------------- VERTICAL ------------------------- */
  if (variant === 'vertical') {
    return (
      <article className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
        <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={product.title}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setImageError(true)}
              className={cn(
                'h-full w-full object-cover',
                (isOutOfStock || !product.available) && 'grayscale opacity-50'
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl opacity-30">
              {FALLBACK_EMOJI}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{product.title}</h3>
          <p className="text-base font-extrabold" style={{ color: 'var(--color-primary, #111)' }}>
            {formatPrice(product.price)}
          </p>
          {outOfStockBadge}
          <Button
            size="sm"
            disabled={isButtonDisabled}
            onClick={handleAdd}
            className="mt-auto w-full"
          >
            <Plus size={14} /> Agregar
          </Button>
        </div>
      </article>
    );
  }

  /* ------------------------ HORIZONTAL ------------------------ */
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-4 py-3.5 transition-all hover:border-black/15 hover:shadow-sm">
      {/* Texto a la izquierda */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold leading-snug">{product.title}</h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {product.description}
          </p>
        )}
        <p
          className="mt-2 text-base font-bold"
          style={{ color: 'var(--color-primary, #111)' }}
        >
          {formatPrice(product.price)}
        </p>
        {outOfStockBadge}
      </div>

      {/* Imagen 88x88 + botón flotante */}
      <div className="relative shrink-0">
        <div className="h-[88px] w-[88px] overflow-hidden rounded-xl bg-neutral-200">
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={product.title}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setImageError(true)}
              className={cn(
                'h-full w-full object-cover',
                (isOutOfStock || !product.available) && 'grayscale opacity-50'
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl opacity-30">
              {FALLBACK_EMOJI}
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={isButtonDisabled}
          aria-label={isOutOfStock ? 'Sin stock' : `Agregar ${product.title} al carrito`}
          className={cn(
            'absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all active:scale-90',
            isButtonDisabled
              ? 'cursor-not-allowed bg-neutral-300 text-white/70'
              : 'scale-100 bg-neutral-900 text-white hover:scale-110'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
