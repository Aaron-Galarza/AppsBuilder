'use client';

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutWithStoryProps {
  title: string;
  story: string;
  imageSrc?: string;
  stats?: AboutStat[];
  primaryColor?: string;
}

/** "Sobre nosotros" con historia larga y fila de estadísticas */
export function AboutWithStory({ title, story, imageSrc, stats = [], primaryColor = '#111' }: AboutWithStoryProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-col items-center gap-8 md:flex-row-reverse">
        {imageSrc && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            className="h-64 w-full rounded-2xl object-cover md:w-80"
          />
        )}
        <div className="flex-1">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: primaryColor }}
          >
            Nuestra historia
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-500">{story}</p>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-black sm:text-3xl" style={{ color: primaryColor }}>
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
