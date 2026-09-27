'use client'

import { useSiteConfig } from '@saas/hooks'

export function MiniHero() {
  const cfg = useSiteConfig()
  const hero = cfg.textos?.['hero'] || {}

  return (
    <section
      className="relative flex min-h-[240px] max-h-[280px] w-full items-center justify-center overflow-hidden"
      aria-label={hero['title'] || cfg.name}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${cfg.images?.hero ?? ''}')` }}
      />
      {cfg.images?.hero
        ? <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/85" />
        : <div className="absolute inset-0 bg-gradient-to-b from-muted/60 to-background" />}

      <div className="relative z-10 flex flex-col items-center gap-2.5 px-4 text-center">
        {cfg.logo && (
          <img
            src={cfg.logo}
            alt={cfg.name}
            className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-lg"
          />
        )}
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          {cfg.name}
        </p>
        <h1 className="font-heading text-2xl font-bold tracking-wide text-white sm:text-3xl">
          {hero['title'] || cfg.name}
        </h1>
        {hero['subtitle'] && (
          <p className="max-w-md text-sm text-white/80">{hero['subtitle']}</p>
        )}
      </div>
    </section>
  )
}