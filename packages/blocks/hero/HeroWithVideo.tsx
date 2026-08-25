'use client';

import { cn } from '@saas/ui';
import { Clock } from 'lucide-react';

export interface HeroWithVideoProps {
  videoSrc: string;
  title: string;
  subtitle?: string;
  primaryColor: string;
  ctaText: string;
  ctaHref?: string;
}

/** Hero con video de fondo + overlay + texto centrado + CTA */
export function HeroWithVideo({
  videoSrc,
  title,
  subtitle,
  primaryColor,
  ctaText,
  ctaHref = '#menu',
}: HeroWithVideoProps) {
  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-black">
      {/* Video de fondo */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex flex-col items-center px-4 py-16 text-center text-white">
        <h1 className="max-w-3xl text-4xl font-black leading-tight drop-shadow-lg sm:text-5xl md:text-6xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">{subtitle}</p>
        )}

        <span
          className={cn('mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-1.5 text-sm font-semibold backdrop-blur')}
        >
          <Clock size={15} style={{ color: primaryColor }} />
          Pedido online disponible
        </span>

        <a
          href={ctaHref}
          className="mt-8 inline-block min-w-[220px] rounded-full px-8 py-3.5 text-base font-bold shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
