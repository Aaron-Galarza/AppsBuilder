'use client';

import { formatPrice } from '@saas/utils';
import { CartItem } from '@saas/types';

export interface CartItemHeaderProps {
  item: CartItem;
}

/** Encabezado del item: nombre + precio total (producto + addons × cantidad) */
export function CartItemHeader({ item }: CartItemHeaderProps) {
  const addonsTotal = (item.addons ?? []).reduce(
    (sum, ca) => sum + ca.addon.price * ca.quantity,
    0
  );
  const lineTotal = (item.product.price + addonsTotal) * item.quantity;

  return (
    <div className="flex items-baseline justify-between gap-2">
      <h4 className="truncate text-sm font-semibold">{item.product.title}</h4>
      <span className="shrink-0 text-sm font-bold" style={{ color: 'var(--color-primary, #111)' }}>
        {formatPrice(lineTotal)}
      </span>
    </div>
  );
}
