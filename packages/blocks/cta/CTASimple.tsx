'use client';

export interface CTASimpleProps {
  title: string;
  text?: string;
  ctaText: string;
  ctaHref?: string;
  primaryColor?: string;
}

/** Banda de llamada a la acción con fondo de color */
export function CTASimple({
  title,
  text,
  ctaText,
  ctaHref = '#menu',
  primaryColor = '#111',
}: CTASimpleProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div
        className="flex flex-col items-center gap-4 rounded-3xl px-8 py-12 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        {text && <p className="max-w-md text-sm text-white/80">{text}</p>}
        <a
          href={ctaHref}
          className="mt-2 rounded-full bg-white px-7 py-3 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95"
          style={{ color: primaryColor }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
