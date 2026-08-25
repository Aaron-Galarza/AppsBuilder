'use client';

import { Product } from '@saas/types';
import { useStoreStatus } from '@saas/hooks';
import { ProductCard } from '../menu/ProductCard';

export interface FeaturedProductsProps {
  products: Product[];
  primaryColor?: string;
  title?: string;
}

/** Sección de destacados: hasta 5 productos marcados featured */
export function FeaturedProducts({ products, title = 'Los favoritos' }: FeaturedProductsProps) {
  const { isOpen } = useStoreStatus();
  const featured = products.filter((p) => p.featured && p.available).slice(0, 5);

  if (featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="mb-5 text-center text-xl font-black sm:text-2xl">{title}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((product) => (
          <ProductCard key={product._id} product={product} isStoreOpen={isOpen} variant="horizontal" />
        ))}
      </div>
    </section>
  );
}
