'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export interface GalleryImageItem {
  url: string;
  alt?: string;
}

export interface GalleryGridProps {
  images: GalleryImageItem[];
  columns?: 2 | 3 | 4;
}

/** Grid de imágenes con lightbox al hacer click */
export function GalleryGrid({ images, columns = 3 }: GalleryGridProps) {
  const [lightbox, setLightbox] = useState<GalleryImageItem | null>(null);

  if (images.length === 0) return null;

  const colsClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 4
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3';

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className={`grid gap-2 ${colsClass}`}>
        {images.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            onClick={() => setLightbox(img)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
            aria-label={img.alt ?? `Imagen ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt ?? ''}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-6"
          role="dialog"
          aria-label={lightbox.alt ?? 'Imagen ampliada'}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.alt ?? ''}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
