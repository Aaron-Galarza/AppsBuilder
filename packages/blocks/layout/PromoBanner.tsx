'use client';

import { useState } from 'react';
import { useStoreStatus } from '@saas/hooks';

export interface PromoBannerProps {
  /** Alto del banner (p. ej. 'h-40 md:h-64') */
  heightClass?: string;
}

/**
 * Banner promocional full-width: renderiza la imagen de bannerUrl de la config
 * (GET /api/config/status). Si no hay banner configurado o la imagen no carga,
 * no renderiza nada (no rompe el layout).
 */
export function PromoBanner({ heightClass = 'h-40 md:h-64' }: PromoBannerProps) {
  const { bannerUrl } = useStoreStatus();
  const [broken, setBroken] = useState(false);

  if (!bannerUrl || broken) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-6">
      <img
        src={bannerUrl}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className={`w-full rounded-2xl object-cover shadow-md ${heightClass}`}
      />
    </section>
  );
}