'use client'

import { AtSign, Clock, MapPin, MessageCircle } from 'lucide-react'
import { useSiteConfig } from '@saas/hooks'

export function Footer() {
  const cfg = useSiteConfig()
  const contact = cfg.textos?.['contact'] || {}

  const INFO = [
    { Icon: Clock, title: 'Horario', value: contact['hours'] ?? '' },
    { Icon: MapPin, title: 'Retiro / Dirección', value: contact['address'] ?? '' },
    { Icon: MessageCircle, title: 'WhatsApp', value: contact['phone'] ?? '' },
    { Icon: AtSign, title: 'Instagram', value: cfg.instagram ? `@${cfg.instagram}` : '' },
  ]

  return (
    <footer className="mt-10 border-t border-white/10 bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* BLOCK: contact — Tarjetas de información */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INFO.map(({ Icon, title, value }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <Icon className="text-primary" size={18} strokeWidth={2} />
              <h3 className="text-xs font-bold uppercase tracking-wide text-white">{title}</h3>
              <p className="text-[11px] leading-snug text-white/50">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6">
          <img
            src={cfg.logo}
            alt={cfg.name}
            className="h-6 w-6 rounded-full object-cover opacity-60"
          />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            © {new Date().getFullYear()} {cfg.name}
          </p>
        </div>
      </div>
    </footer>
  )
}