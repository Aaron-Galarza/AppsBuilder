'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Lock } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useCartStore } from '@saas/hooks'

const emptySubscribe = () => () => {}

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
]

export function Header() {
  const pathname = usePathname()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const cartCount = useCartStore((state) => state.getTotals().itemCount)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80">
          <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          <span className="font-heading text-lg sm:text-xl font-bold tracking-wide text-primary">INJECT_TENANT_NAME</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                pathname === href
                  ? 'bg-primary/15 text-primary'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative flex rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-all hover:bg-white/10 active:scale-95" aria-label="Abrir carrito">
            <ShoppingCart size={20} strokeWidth={2} />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-black">{cartCount}</span>
            )}
          </Link>
          <Link href="/login" className="flex rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white" aria-label="Iniciar sesión">
            <Lock size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  )
}
