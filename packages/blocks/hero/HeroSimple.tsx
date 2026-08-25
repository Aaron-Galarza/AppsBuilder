'use client';

import { cn } from '@saas/ui';
import { Clock } from 'lucide-react';

export interface HeroSimpleProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  primaryColor: string;
  ctaText: string;
  ctaHref?: string;
  isOpen?: boolean;
}

/** Hero estático: imagen de fondo + overlay + logo circular + badge abierto/cerrado + CTA */
export function HeroSimple({
  title,
  subtitle,
  imageSrc,
  primaryColor,
  ctaText,
  ctaHref = '#menu',
  isOpen = true,
}: HeroSimpleProps) {
  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
        role="img"
        aria-label={title}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center px-4 py-16 text-center text-white">
        {/* Logo circular */}
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 bg-white shadow-xl"
          style={{ borderColor: primaryColor }}
        >
          <span className="text-3xl font-black" style={{ color: primaryColor }} aria-hidden="true">
            ★
          </span>
        </div>

        <h1 className="max-w-2xl text-4xl font-black leading-tight drop-shadow-lg sm:text-5xl md:text-6xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">{subtitle}</p>
        )}

        {/* Badge abierto / cerrado */}
        <span
          className={cn(
            'mt-6 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur',
            isOpen
              ? 'border-green-300/50 bg-green-500/20 text-green-100'
              : 'border-red-300/50 bg-red-500/20 text-red-100'
          )}
        >
          <Clock size={15} />
          {isOpen ? 'Abierto ahora' : 'Cerrado'}
        </span>

        <a
          href={ctaHref}
          className="mt-8 inline-block min-w-[220px] rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
