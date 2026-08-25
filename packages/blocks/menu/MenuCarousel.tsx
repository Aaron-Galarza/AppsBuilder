'use client';

import { useRef } from 'react';
import { useStoreStatus } from '@saas/hooks';
import { Product } from '@saas/types';
import { ProductCard } from './ProductCard';

export interface MenuCarouselProps {
  products: Product[];
}

/** Carrusel horizontal scroll-snap de productos */
export function MenuCarousel({ products }: MenuCarouselProps) {
  const { isOpen } = useStoreStatus();
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none"
      >
        {products.map((product) => (
          <div key={product._id} className="w-[280px] shrink-0 snap-start">
            <ProductCard product={product} isStoreOpen={isOpen} variant="vertical" />
          </div>
        ))}
      </div>
    </div>
  );
}
