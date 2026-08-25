'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@saas/ui';

export interface HeroSlide {
  title: string;
  text: string;
  image: string;
  cta: string;
  ctaHref?: string;
}

export interface HeroWithCarouselProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
}

const TRANSITION_MS = 900;
const SWIPE_THRESHOLD_PX = 75;

/** Hero con slides auto-play, gestos touch, dots y arrows */
export function HeroWithCarousel({ slides, autoPlayMs = 6000 }: HeroWithCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || total === 0) return;
      setIsTransitioning(true);
      setCurrent(((index % total) + total) % total);
      setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
    },
    [isTransitioning, total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(goNext, Math.max(2000, autoPlayMs));
    return () => clearInterval(id);
  }, [goNext, autoPlayMs, total]);

  if (total === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD_PX) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <section
      className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.title}-${index}`}
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity ease-in-out',
            index === current ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'
          )}
          style={{ transitionDuration: `${TRANSITION_MS}ms` }}
          aria-hidden={index !== current}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex max-w-2xl flex-col items-center px-4 text-center text-white">
            <h2 className="text-4xl font-black leading-tight drop-shadow-lg sm:text-5xl md:text-6xl">
              {slide.title}
            </h2>
            <p className="mt-4 line-clamp-3 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">
              {slide.text}
            </p>
            <a
              href={slide.ctaHref ?? '#menu'}
              className="mt-8 inline-block rounded-full border-2 border-white bg-transparent px-8 py-3 font-semibold uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
            >
              {slide.cta}
            </a>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={goPrev}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow-lg transition hover:bg-white md:flex"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={goNext}
        aria-label="Slide siguiente"
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow-lg transition hover:bg-white md:flex"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Ir al slide ${index + 1}`}
            className={cn(
              'h-2.5 rounded-full transition-all',
              index === current ? 'w-7 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </section>
  );
}
