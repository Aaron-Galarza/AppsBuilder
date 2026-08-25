'use client';

import { useEffect, useState } from 'react';

export interface CountdownOfferProps {
  title: string;
  badgeText?: string;
  /** Fecha límite ISO de la promo, ej: "2026-09-01T23:59:59-03:00" */
  deadline: string;
  ctaText: string;
  ctaHref?: string;
  primaryColor?: string;
}

function calcTimeLeft(deadline: string): { hours: number; minutes: number; seconds: number } | null {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Oferta con cuenta regresiva en horas:minutos:segundos */
export function CountdownOffer({
  title,
  badgeText = 'Oferta limitada',
  deadline,
  ctaText,
  ctaHref = '#menu',
  primaryColor = '#111',
}: CountdownOfferProps) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof calcTimeLeft>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setTimeLeft(calcTimeLeft(deadline));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (mounted && !timeLeft) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-6">
      <div
        className="flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
          ⏱ {badgeText}
        </span>

        <h3 className="text-xl font-black sm:text-2xl">{title}</h3>

        {mounted && timeLeft && (
          <p className="text-3xl font-black tabular-nums sm:text-4xl">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </p>
        )}

        <a
          href={ctaHref}
          className="mt-1 rounded-full bg-white px-6 py-2.5 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95"
          style={{ color: primaryColor }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
