'use client';

export interface AboutSimpleProps {
  title: string;
  text: string;
  imageSrc?: string;
  primaryColor?: string;
}

/** Sección "sobre nosotros" simple: imagen + texto */
export function AboutSimple({ title, text, imageSrc, primaryColor = '#111' }: AboutSimpleProps) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-16 md:flex-row">
      {imageSrc && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          className="h-56 w-full rounded-2xl object-cover md:w-64"
        />
      )}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        <span className="mt-2 block h-1 w-12 rounded-full md:mx-0 mx-auto" style={{ backgroundColor: primaryColor }} />
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-500">{text}</p>
      </div>
    </section>
  );
}
