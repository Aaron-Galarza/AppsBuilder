'use client';

import type { CartItem } from '@saas/types';
import { formatPrice } from '@saas/utils';
import { cn } from '../lib/cn';

export interface OrderItemListProps {
  items: CartItem[];
  readOnly?: boolean;
  className?: string;
}

export function OrderItemList({ items, readOnly = true, className }: OrderItemListProps) {
  if (items.length === 0) {
    return (
      <p className={cn('py-4 text-center text-sm text-white/40', className)}>
        Sin productos en el pedido
      </p>
    );
  }

  return (
    <div className={cn('space-y-2', className)} data-readonly={readOnly}>
      {items.map((item) => (
        <div key={item.cartItemId} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-black text-primary-foreground">
            {item.quantity}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{item.product.title}</p>
            {item.addons.length > 0 && (
              <p className="truncate text-xs text-white/50">
                + {item.addons.map((a) => `${a.addon.name}${a.quantity > 1 ? ` x${a.quantity}` : ''}`).join(', ')}
              </p>
            )}
          </div>

          <span className="shrink-0 text-sm font-semibold text-white">
            {formatPrice(item.itemTotal)}
          </span>
        </div>
      ))}

      <div className="!mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-medium text-white/60">Total</span>
        <span className="text-base font-bold text-primary">
          {formatPrice(items.reduce((sum, item) => sum + item.itemTotal, 0))}
        </span>
      </div>
    </div>
  );
}
