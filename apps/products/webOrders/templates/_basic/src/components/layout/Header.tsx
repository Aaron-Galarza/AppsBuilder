'use client'

import { Lock, ShoppingCart } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@saas/hooks'

const emptySubscribe = () => () => {}

export function Header() {
  const router = useRouter()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const cartCount = useCartStore((state) => state.getTotals().itemCount)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between gap-2 px-4">
        {/* BLOCK: menu — Logo circular → inicio */}
        <button
          onClick={() => router.push('/')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          aria-label="Volver al menú"
        >
          <img
            src="INJECT_LOGO_URL"
            alt="INJECT_TENANT_NAME"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border border-white/10 object-cover"
          />
        </button>

        <div className="flex items-center gap-2">
          {/* BLOCK: admin — Acceso al panel */}
          <button
            onClick={() => router.push('/login')}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 active:scale-95"
            aria-label="Panel de administración"
          >
            <Lock size={18} strokeWidth={2} />
          </button>

          {/* BLOCK: cart — Carrito con badge */}
          <button
            onClick={() => router.push('/cart')}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={20} strokeWidth={2} />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}