'use client';

export interface OfferBannerProps {
  title: string;
  text?: string;
  /** Texto corto del descuento, ej: "20% OFF" o "2x1" */
  badgeText: string;
  ctaText?: string;
  ctaHref?: string;
  primaryColor?: string;
  /** Imagen de fondo (ofertas con imagen); si no se pasa, usa la cinta a rayas. */
  imageSrc?: string;
}

/** Cinta de oferta destacada. Con imagen de fondo si `imageSrc` está presente. */
export function OfferBanner({
  title,
  text,
  badgeText,
  ctaText,
  ctaHref = '#menu',
  primaryColor = '#111',
  imageSrc,
}: OfferBannerProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-6">
      {imageSrc ? (
        <a
          href={ctaHref}
          className="group relative block overflow-hidden rounded-3xl shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-8">
            <span
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-black uppercase tracking-wide text-black shadow"
              style={{ backgroundColor: primaryColor }}
            >
              {badgeText}
            </span>
            <p className="font-heading text-2xl font-bold text-white sm:text-3xl">{title}</p>
            {text && <p className="max-w-md text-sm text-white/80">{text}</p>}
            <span
              className="mt-1 text-xs font-bold uppercase tracking-widest text-white underline underline-offset-4 transition group-hover:text-white/80"
            >
              {ctaText ?? 'Pedir ahora'}
            </span>
          </div>
        </a>
      ) : (
        <div
          className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-5 sm:flex-row"
          style={{ borderColor: primaryColor }}
        >
          <div className="flex items-center gap-4">
            <span
              className="shrink-0 rounded-xl px-3.5 py-2 text-sm font-black uppercase tracking-wide text-black"
              style={{ backgroundColor: primaryColor }}
            >
              {badgeText}
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{title}</p>
              {text && <p className="text-xs text-muted-foreground">{text}</p>}
            </div>
          </div>

          <a
            href={ctaHref}
            className="text-xs font-bold underline underline-offset-4 transition hover:opacity-70"
            style={{ color: primaryColor }}
          >
            {ctaText ?? 'Pedir ahora'}
          </a>
        </div>
      )}
    </section>
  );
}
