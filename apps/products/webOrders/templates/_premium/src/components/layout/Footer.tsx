'use client'

import { Clock, MapPin, Phone, AtSign } from 'lucide-react'
import { useSiteConfig } from '@saas/hooks'

export function Footer() {
  const cfg = useSiteConfig()
  const contact = cfg.textos?.['contact'] || {}

  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="bg-gradient-to-b from-card to-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">{cfg.name}</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-xs font-semibold text-white">{contact['phone'] ?? ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="text-xs font-semibold text-white">{contact['address'] ?? ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horarios</p>
                    <p className="text-xs font-semibold text-white">{contact['hours'] ?? ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <img src={cfg.logo} alt={cfg.name} className="mx-auto h-10 w-10 rounded-full object-cover opacity-60 mb-2" />
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider">&copy; {new Date().getFullYear()} {cfg.name}</p>
                <p className="text-[9px] font-medium text-muted-foreground">Todos los derechos reservados</p>
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-sm font-bold text-white mb-3">Acerca de la Plataforma</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Plataforma de pedidos online desarrollada para optimizar la experiencia de compra de nuestros clientes.</p>
              <a href="https://www.afdevelopers.com/" className="mt-2 inline-block text-[10px] font-extrabold text-primary tracking-wide">AFdevelopers</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}