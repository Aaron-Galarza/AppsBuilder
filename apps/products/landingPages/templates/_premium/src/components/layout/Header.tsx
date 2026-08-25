'use client'

import { Lock, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const whatsappNumber = 'INJECT_WHATSAPP_NUMBER'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me interesa conocer más sobre sus servicios.')}`

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <button onClick={() => router.push('/admin')}
          className="hidden sm:flex rounded-lg border border-white/10 bg-white/5 p-2 text-primary transition-all hover:bg-white/10 active:scale-95 shrink-0"
          aria-label="Ir al panel admin">
          <Lock size={18} strokeWidth={2} />
        </button>

        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex flex-1 items-center justify-center gap-2 transition-opacity hover:opacity-80 min-w-0" aria-label="Ir al inicio">
          <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" width={32} height={32} className="h-8 w-8 object-contain shrink-0" />
          <span className="font-heading text-lg sm:text-xl font-bold tracking-wide text-primary truncate">INJECT_TENANT_NAME</span>
        </button>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95 shrink-0">
          <MessageCircle size={18} strokeWidth={2} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </header>
  )
}
