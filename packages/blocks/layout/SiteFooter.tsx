'use client';

import { AtSign, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSiteConfig } from '@saas/hooks';

export interface SiteFooterProps {
  /** compact: tarjetas de información 4 columnas (home basic). default: 3 columnas con contacto + marca + acerca (standard/premium). */
  variant?: 'compact' | 'default';
}

/** Footer público del sitio. Comparte la misma estética; la variante cambia la densidad de información. */
export function SiteFooter({ variant = 'default' }: SiteFooterProps) {
  const cfg = useSiteConfig();
  const contact = cfg.textos?.['contact'] || {};

  if (variant === 'compact') {
    const INFO = [
      { Icon: Clock, title: 'Horario', value: contact['hours'] ?? '' },
      { Icon: MapPin, title: 'Retiro / Dirección', value: contact['address'] ?? '' },
      { Icon: MessageCircle, title: 'WhatsApp', value: contact['phone'] ?? '' },
      { Icon: AtSign, title: 'Instagram', value: cfg.instagram ? `@${cfg.instagram}` : '' },
    ];

    return (
      <footer className="mt-10 border-t border-white/10 bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-8">
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
            <img src={cfg.logo} alt={cfg.name} className="h-6 w-6 rounded-full object-cover opacity-60" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              © {new Date().getFullYear()} {cfg.name}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="border-t border-border bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">{cfg.name}</h3>
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
                <img src={cfg.logo} alt={cfg.name} className="mx-auto mb-2 h-10 w-10 rounded-full object-cover opacity-60" />
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                  &copy; {new Date().getFullYear()} {cfg.name}
                </p>
                <p className="text-[9px] font-medium text-muted-foreground">Todos los derechos reservados</p>
              </div>
            </div>

            <div className="text-right">
              <h3 className="mb-3 text-sm font-bold text-white">Acerca de la Plataforma</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Plataforma de pedidos online desarrollada para optimizar la experiencia de compra de nuestros clientes.
              </p>
              <a
                href="https://www.afdevelopers.com/"
                className="mt-2 inline-block text-[10px] font-extrabold tracking-wide text-primary"
              >
                AFdevelopers
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}