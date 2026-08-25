'use client';

import { useEffect, useState } from 'react';

export interface CTAWithCountdownProps {
  title: string;
  text?: string;
  ctaText: string;
  ctaHref?: string;
  /** Fecha límite ISO, ej: "2026-09-30T23:59:59-03:00" */
  deadline: string;
  primaryColor?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(deadline: string): TimeLeft | null {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** CTA con cuenta regresiva hasta una fecha límite */
export function CTAWithCountdown({
  title,
  text,
  ctaText,
  ctaHref = '#menu',
  deadline,
  primaryColor = '#111',
}: CTAWithCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setTimeLeft(calcTimeLeft(deadline));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div
        className="flex flex-col items-center gap-5 rounded-3xl px-8 py-12 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        {text && <p className="max-w-md text-sm text-white/80">{text}</p>}

        {mounted && timeLeft && (
          <div className="flex gap-2" role="timer" aria-label="Tiempo restante">
            {(
              [
                [timeLeft.days, 'días'],
                [timeLeft.hours, 'hs'],
                [timeLeft.minutes, 'min'],
                [timeLeft.seconds, 'seg'],
              ] as [number, string][]
            ).map(([value, label]) => (
              <div
                key={label}
                className="flex min-w-[64px] flex-col rounded-xl bg-white/15 px-3 py-2 backdrop-blur"
              >
                <span className="text-xl font-black tabular-nums">{String(value).padStart(2, '0')}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        <a
          href={ctaHref}
          className="mt-1 rounded-full bg-white px-7 py-3 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95"
          style={{ color: primaryColor }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
