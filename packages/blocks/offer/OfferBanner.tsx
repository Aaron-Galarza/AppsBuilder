'use client';

export interface OfferBannerProps {
  title: string;
  text?: string;
  /** Texto corto del descuento, ej: "20% OFF" o "2x1" */
  badgeText: string;
  ctaText?: string;
  ctaHref?: string;
  primaryColor?: string;
}

/** Cinta de oferta destacada */
export function OfferBanner({
  title,
  text,
  badgeText,
  ctaText,
  ctaHref = '#menu',
  primaryColor = '#111',
}: OfferBannerProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-6">
      <div
        className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-5 sm:flex-row"
        style={{ borderColor: primaryColor }}
      >
        <div className="flex items-center gap-4">
          <span
            className="shrink-0 rounded-xl px-3.5 py-2 text-sm font-black uppercase tracking-wide text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {badgeText}
          </span>
          <div>
            <p className="text-sm font-bold">{title}</p>
            {text && <p className="text-xs text-neutral-500">{text}</p>}
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
    </section>
  );
}
