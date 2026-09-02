'use client'

import { useStoreStatus } from '@saas/hooks'
import { Clock } from 'lucide-react'
import { cn } from '@saas/ui'

export function StatusBar() {
  const { isOpen, emergencyClosed } = useStoreStatus()
  const closed = emergencyClosed || !isOpen

  return (
    <div
      className={cn(
        'sticky top-16 z-40 flex w-full items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold backdrop-blur-md',
        closed ? 'bg-red-500/15 text-red-200' : 'bg-green-500/15 text-green-200'
      )}
    >
      <Clock size={14} />
      {closed ? 'NEGOCIO CERRADO AHORA' : 'ABIERTO AHORA'}
    </div>
  )
}
