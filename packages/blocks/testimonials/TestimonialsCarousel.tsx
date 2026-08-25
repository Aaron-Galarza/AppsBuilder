'use client';

import { Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  avatarSrc?: string;
}

export interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoPlayMs?: number;
  primaryColor?: string;
}

/** Carrusel de testimonios con autoplay y dots */
export function TestimonialsCarousel({
  testimonials,
  autoPlayMs = 7000,
  primaryColor = '#111',
}: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % testimonials.length),
      Math.max(3000, autoPlayMs)
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testimonials.length, autoPlayMs]);

  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-14 text-center">
      <h2 className="mb-8 text-xl font-black sm:text-2xl">Lo que dicen de nosotros</h2>

      <div className="relative min-h-[150px]">
        {testimonials.map((t, i) => (
          <blockquote
            key={`${t.name}-${i}`}
            aria-hidden={i !== current}
            className={
              i === current
                ? 'flex flex-col items-center gap-3'
                : 'pointer-events-none absolute inset-0 flex-col items-center gap-3 opacity-0'
            }
          >
            <div className="flex gap-0.5" aria-label={`${t.rating ?? 5} estrellas`}>
              {Array.from({ length: t.rating ?? 5 }).map((_, s) => (
                <Star key={s} size={15} fill="currentColor" style={{ color: primaryColor }} />
              ))}
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-neutral-600">"{t.text}"</p>
            <footer className="flex items-center gap-2.5">
              {t.avatarSrc && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={t.avatarSrc} alt="" className="h-9 w-9 rounded-full object-cover" />
              )}
              <span className="text-xs font-bold">{t.name}</span>
            </footer>
          </blockquote>
        ))}
      </div>

      {testimonials.length > 1 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Testimonio ${i + 1}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === current ? 22 : 8,
                backgroundColor: i === current ? primaryColor : '#d4d4d4',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
