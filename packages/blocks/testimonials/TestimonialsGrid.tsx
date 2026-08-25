'use client';

import { Star } from 'lucide-react';

export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  avatarSrc?: string;
}

export interface TestimonialsGridProps {
  testimonials: Testimonial[];
  primaryColor?: string;
}

/** Grilla de testimonios estáticos */
export function TestimonialsGrid({ testimonials, primaryColor = '#111' }: TestimonialsGridProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="mb-8 text-center text-xl font-black sm:text-2xl">Lo que dicen de nosotros</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={`${t.name}-${i}`}
            className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex gap-0.5" aria-label={`${t.rating ?? 5} estrellas`}>
              {Array.from({ length: t.rating ?? 5 }).map((_, s) => (
                <Star key={s} size={13} fill="currentColor" style={{ color: primaryColor }} />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed text-neutral-600">"{t.text}"</blockquote>
            <figcaption className="mt-auto flex items-center gap-2.5 pt-1">
              {t.avatarSrc && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={t.avatarSrc} alt="" className="h-9 w-9 rounded-full object-cover" />
              )}
              <span className="text-xs font-bold">{t.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
