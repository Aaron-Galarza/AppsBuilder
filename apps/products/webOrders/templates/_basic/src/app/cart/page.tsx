'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'
import { CartEmpty, CartItemCard } from '@saas/blocks/cart'
import { useCartStore } from '@saas/hooks'
import { formatPrice } from '@saas/utils'

export default function CartPage() {
  const { items, getTotals, clearCart } = useCartStore()
  const totals = getTotals()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 pb-10 pt-4">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al menú
        </Link>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-300 transition-colors hover:bg-red-500/20"
          >
            <Trash2 size={12} /> Vaciar
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <>
          <section>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CartItemCard key={`${item.product._id}-${item.cartItemId}`} item={item} />
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card p-4">
            <div className="flex flex-col pl-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Total Final</span>
              <span className="text-2xl font-black leading-none text-white">{formatPrice(totals.total)}</span>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-extrabold text-black transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Continuar <ArrowRight size={18} />
            </Link>
          </section>
        </>
      )}
    </div>
  )
}