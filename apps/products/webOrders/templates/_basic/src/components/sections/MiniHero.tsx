'use client'

import { useSiteConfig } from '@saas/hooks'

export function MiniHero() {
  const cfg = useSiteConfig()
  const hero = cfg.textos?.['hero'] || {}

  const projectName = cfg.name
  const nameParts = projectName.split(' ')
  const lastName = nameParts[nameParts.length - 1] ?? projectName
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''

  return (
    <section
      className="relative flex min-h-[240px] max-h-[280px] w-full items-center justify-center overflow-hidden"
      aria-label={hero['title'] ?? ''}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${cfg.images?.hero ?? ''}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/85" />

      <div className="relative z-10 flex flex-col items-center gap-2.5 px-4 text-center">
        <img
          src={cfg.logo}
          alt={cfg.name}
          className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-lg"
        />
        <h1 className="font-heading text-2xl font-bold tracking-wide text-white sm:text-3xl">
          {firstName && <span className="block">{firstName}</span>}
          <span className="block text-primary">{lastName}</span>
        </h1>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
          {hero['subtitle'] ?? ''}
        </p>
      </div>
    </section>
  )
}