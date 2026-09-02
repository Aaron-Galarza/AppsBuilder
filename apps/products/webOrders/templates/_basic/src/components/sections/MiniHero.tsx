const projectName = 'INJECT_PROJECT_NAME'
const nameParts = projectName.split(' ')
const lastName = nameParts[nameParts.length - 1] ?? projectName
const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''

export function MiniHero() {
  return (
    <section
      className="relative flex min-h-[240px] max-h-[280px] w-full items-center justify-center overflow-hidden"
      aria-label="INJECT_HERO_TITLE"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('INJECT_HERO_IMAGE_URL')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/85" />

      <div className="relative z-10 flex flex-col items-center gap-2.5 px-4 text-center">
        <img
          src="INJECT_LOGO_URL"
          alt="INJECT_PROJECT_NAME"
          className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-lg"
        />
        <h1 className="font-heading text-2xl font-bold tracking-wide text-white sm:text-3xl">
          {firstName && <span className="block">{firstName}</span>}
          <span className="block text-primary">{lastName}</span>
        </h1>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
          INJECT_HERO_SUBTITLE
        </p>
      </div>
    </section>
  )
}