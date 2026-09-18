'use client';

import Link from 'next/link';
import { Lock, ShoppingCart } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useCartStore, useSiteConfig, useSitePathname } from '@saas/hooks';
import { cn } from '@saas/ui';

export interface SiteHeaderProps {
  /** compact: fila compacta con logo circular y acciones (home basic). branded: logo + nombre + nav (standard/premium). */
  variant?: 'compact' | 'branded';
}

const emptySubscribe = () => () => {};

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
];

/** Header público del sitio. Comparte la misma estética; la variante solo cambia densidad y navegación visible. */
export function SiteHeader({ variant = 'branded' }: SiteHeaderProps) {
  const cfg = useSiteConfig();
  const pathname = useSitePathname();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const cartCount = useCartStore((state) => state.items.reduce((n, i) => n + i.quantity, 0));
  const compact = variant === 'compact';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-lg">
      <div
        className={cn(
          'mx-auto flex h-16 w-full items-center justify-between gap-2',
          compact ? 'max-w-2xl px-4' : 'max-w-6xl px-3 sm:px-4'
        )}
      >
        {compact ? (
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            aria-label="Volver al menú"
          >
            <img
              src={cfg.logo}
              alt={cfg.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-white/10 object-cover"
            />
          </Link>
        ) : (
          <Link href="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
            <img src={cfg.logo} alt={cfg.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            <span className="font-heading text-lg font-bold tracking-wide text-primary sm:text-xl">{cfg.name}</span>
          </Link>
        )}

        {!compact && (
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname === href
                    ? 'bg-primary/15 text-primary'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className={cn(
              'relative flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95',
              compact ? 'h-10 w-10' : 'p-2'
            )}
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={20} strokeWidth={2} />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-black">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className={cn(
              'flex items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:text-white',
              compact ? 'h-10 w-10 text-white/80' : 'p-2 text-white/50'
            )}
            aria-label="Iniciar sesión"
          >
            <Lock size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}