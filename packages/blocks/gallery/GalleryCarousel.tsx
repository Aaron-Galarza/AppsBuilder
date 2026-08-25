'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface GalleryCarouselProps {
  images: { url: string; alt?: string }[];
}

/** Carrusel scroll-snap de imágenes de galería con flechas */
export function GalleryCarousel({ images }: GalleryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = ((i % images.length) + images.length) % images.length;
    track.children[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setIndex(clamped);
  }, [images.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / (track.scrollWidth / images.length));
      setIndex(Math.min(images.length - 1, Math.max(0, i)));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [images.length]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 py-2 scrollbar-none"
      >
        {images.map((img, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={`${img.url}-${i}`}
            src={img.url}
            alt={img.alt ?? ''}
            loading="lazy"
            decoding="async"
            className="h-56 w-80 shrink-0 snap-center rounded-2xl object-cover sm:h-64 sm:w-96"
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => scrollTo(index - 1)}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-neutral-100"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => scrollTo(index + 1)}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-neutral-100"
          >
            <ChevronRight size={17} />
          </button>
        </>
      )}
    </div>
  );
}
