'use client';

import { useCartStore } from '@saas/hooks';
import { formatPrice } from '@saas/utils';
import { Addon, CartAddon } from '@saas/types';
import { cn } from '@saas/ui';

export interface CartItemExtrasPanelProps {
  cartItemId: string;
  /** Adicionales disponibles del producto (copiados de product.addons al agregar el ítem) */
  availableAddons: Addon[];
  /** Adicionales ya seleccionados en este ítem */
  addons: CartAddon[];
}

/**
 * Selector de adicionales dentro del carrito (misma mecánica que CheepersTBH/
 * TokioSushis): muestra TODOS los adicionales disponibles del producto como
 * chips toggle. Se agrega con +1 y se elimina con -cantidad vía
 * `updateItemAddon`, que ya implementa el split/merge: si el ítem tiene varias
 * unidades se personaliza una sola y el resto queda sin afectar.
 */
export function CartItemExtrasPanel({
  cartItemId,
  availableAddons,
  addons,
}: CartItemExtrasPanelProps) {
  const updateItemAddon = useCartStore((s) => s.updateItemAddon);

  if (availableAddons.length === 0) return null;

  const selectedQty = (addonId: string) =>
    addons.find((a) => a.addon._id === addonId)?.quantity ?? 0;

  return (
    <div className="mt-2 border-t border-dashed border-border pt-2">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        Adicionales
      </p>
      <div className="flex flex-wrap gap-1.5">
        {availableAddons.map((addon) => {
          const qty = selectedQty(addon._id);
          const active = qty > 0;
          return (
            <button
              key={addon._id}
              type="button"
              onClick={() => updateItemAddon(cartItemId, addon, active ? -qty : 1)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition active:scale-95',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted text-foreground hover:border-primary/50'
              )}
            >
              {active && qty > 1 && <span className="font-bold">{qty}×</span>}
              {addon.name} · {formatPrice(addon.price)}
            </button>
          );
        })}
      </div>
    </div>
  );
}