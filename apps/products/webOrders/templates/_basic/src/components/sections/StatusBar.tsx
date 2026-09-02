'use client'

import { useStoreStatus } from '@saas/hooks'

export function StatusBar() {
  const { isOpen, emergencyClosed } = useStoreStatus()
  const closed = emergencyClosed || !isOpen

  if (closed) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-red-400">
        Negocio cerrado ahora
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        Abierto ahora
      </span>
    </div>
  )
}