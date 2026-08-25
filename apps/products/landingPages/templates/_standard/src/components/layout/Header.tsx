'use client'

import { Lock, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <button onClick={() => router.push('/admin')}
          className="hidden sm:flex rounded-lg border border-white/10 bg-white/5 p-2 text-primary transition-all hover:bg-white/10 active:scale-95 shrink-0"
          aria-label="Ir al panel admin">
          <Lock size={18} strokeWidth={2} />
        </button>

        <button onClick={() => router.push('/')} className="group flex flex-1 items-center justify-center gap-2 transition-opacity hover:opacity-80 min-w-0" aria-label="Ir al inicio">
          <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" width={32} height={32} className="h-8 w-8 object-contain shrink-0" />
          <span className="font-heading text-lg sm:text-xl font-bold tracking-wide text-primary truncate">INJECT_TENANT_NAME</span>
        </button>

        <a
          href="https://wa.me/INJECT_WHATSAPP_NUMBER"
          target="_blank"
          rel="noopener noreferrer"
          className="flex rounded-lg border border-white/10 bg-white/5 p-2 text-green-500 transition-all hover:bg-green-500/10 hover:border-green-500/30 active:scale-95 shrink-0"
          aria-label="Contactar por WhatsApp">
          <MessageCircle size={22} strokeWidth={2} />
        </a>
      </div>
    </header>
  )
}
