'use client';

import { Product } from '@saas/types';
import { cloudinaryImage, formatPrice } from '@saas/utils';
import { useStoreStatus } from '@saas/hooks';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface FeaturedBannerProps {
  products: Product[];
  primaryColor?: string;
  onOpenAddons?: (product: Product) => void;
}

/** Banner destacado para productos con featured=true */
export function FeaturedBanner({ products, primaryColor = '#111', onOpenAddons }: FeaturedBannerProps) {
  const { isOpen } = useStoreStatus();
  const [imageError, setImageError] = useState(false);
  const featured = products.find((p) => p.featured && p.available);

  if (!featured) return null;

  const isOutOfStock = featured.controlStock === true && (featured.stock ?? 0) <= 0;
  const disabled = !isOpen || isOutOfStock;
  const imageSrc =
    typeof featured.image === 'string' &&
    (featured.image.startsWith('http') || featured.image.startsWith('/'))
      ? cloudinaryImage(featured.image, 600)
      : '';

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-md"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-stretch">
        {/* Texto */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-5 text-white">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            <Sparkles size={12} />
            Destacado
          </span>
          <h3 className="truncate text-lg font-bold">{featured.title}</h3>
          {featured.description && (
            <p className="line-clamp-2 text-xs text-white/80">{featured.description}</p>
          )}
          <p className="mt-1 text-xl font-black">{formatPrice(featured.price)}</p>
        </div>

        {/* Imagen */}
        <div className="relative h-[130px] w-[130px] shrink-0 sm:h-[160px] sm:w-[160px]">
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={featured.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className={
                isOutOfStock
                  ? 'h-full w-full object-cover grayscale opacity-60'
                  : 'h-full w-full object-cover'
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/10 text-4xl opacity-40">
              🍽️
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => !disabled && (onOpenAddons ? onOpenAddons(featured) : undefined)}
        disabled={disabled}
        aria-label={`Agregar ${featured.title}`}
        className="absolute bottom-3 right-3 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-lg transition active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        style={{ color: primaryColor }}
      >
        {isOutOfStock ? 'Sin stock' : 'Agregar'}
      </button>
    </section>
  );
}
