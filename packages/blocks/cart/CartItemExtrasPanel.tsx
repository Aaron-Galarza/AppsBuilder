'use client';

import { useCartStore } from '@saas/hooks';
import { formatPrice } from '@saas/utils';
import { Addon, CartAddon } from '@saas/types';
import { Plus } from 'lucide-react';

export interface CartItemExtrasPanelProps {
  cartItemId: string;
  addons: CartAddon[];
}

/** Panel plegable para sumar más unidades de un addon ya presente en el item */
export function CartItemExtrasPanel({ cartItemId, addons }: CartItemExtrasPanelProps) {
  const updateItemAddon = useCartStore((s) => s.updateItemAddon);

  return (
    <div className="mt-2 border-t border-dashed border-black/10 pt-2">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
        Sumar extra
      </p>
      <div className="flex flex-wrap gap-1.5">
        {addons.map((ca) => (
          <button
            key={ca.addon._id}
            onClick={() => updateItemAddon(cartItemId, ca.addon as Addon, +1)}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-200 active:scale-95"
          >
            <Plus size={11} />
            {ca.addon.name} · {formatPrice(ca.addon.price)}
          </button>
        ))}
      </div>
    </div>
  );
}
