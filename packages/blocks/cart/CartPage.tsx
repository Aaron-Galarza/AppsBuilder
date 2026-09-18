'use client';

import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore, useSiteRouter } from '@saas/hooks';
import { formatPrice } from '@saas/utils';
import { CartEmpty } from './CartEmpty';
import { CartItemCard } from './CartItemCard';

export interface CartPageProps {
  /** compact: cabecera simple con link de vuelta (basic). default: header sticky con contador de ítems (standard/premium). */
  variant?: 'compact' | 'default';
}

/** Página del carrito completa. Comparte CartItemCard/CartEmpty; la variante define el chrome de la página. */
export function CartPage({ variant = 'default' }: CartPageProps) {
  const { items, getTotals, clearCart } = useCartStore();
  const router = useSiteRouter();
  const totals = getTotals();

  if (variant === 'compact') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 pb-10 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Volver al menú
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-300 transition-colors hover:bg-red-500/20"
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
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-extrabold text-black transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Continuar <ArrowRight size={18} />
              </button>
            </section>
          </>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background pt-6">
        <header className="w-full p-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-3 py-3.5 sm:px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/90 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="mt-1 font-heading text-2xl tracking-wide text-white">TU PEDIDO</h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-3 py-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">
              {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-3 pb-8 pt-5 sm:gap-6 sm:px-4">
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Productos seleccionados</h2>
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
            >
              <Trash2 className="h-3 w-3" />
              Vaciar
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemCard key={`${item.product._id}-${item.cartItemId}`} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-2 rounded-2xl border border-white/10 bg-card p-4 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col pl-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Total Final</span>
              <span className="text-2xl font-black leading-none text-white">
                ${totals.total.toLocaleString('es-AR')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-base font-extrabold text-black transition-all hover:bg-primary/90 active:scale-[0.98] sm:text-lg"
            >
              Continuar
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}