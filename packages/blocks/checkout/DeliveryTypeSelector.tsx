'use client';

import { useCartStore } from '@saas/hooks';
import { DeliveryType } from '@saas/types';
import { cn } from '@saas/ui';
import { Bike, Store } from 'lucide-react';

export interface DeliveryTypeSelectorProps {
  primaryColor?: string;
}

const OPTIONS: { value: DeliveryType; label: string; Icon: typeof Bike }[] = [
  { value: 'delivery', label: 'Envío', Icon: Bike },
  { value: 'pickup', label: 'Retiro', Icon: Store },
];

/** Toggle Envío / Retiro sincronizado con el carrito */
export function DeliveryTypeSelector({ primaryColor = 'var(--color-primary)' }: DeliveryTypeSelectorProps) {
  const deliveryType = useCartStore((s) => s.deliveryType);
  const setDeliveryType = useCartStore((s) => s.setDeliveryType);

  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de entrega">
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = deliveryType === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setDeliveryType(value)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-foreground transition-all active:scale-[0.98]',
              active ? 'border-transparent' : 'border-border bg-card hover:border-secondary/60'
            )}
            style={active ? { backgroundColor: primaryColor, color: 'var(--color-on-primary)' } : undefined}
          >
            <Icon size={22} className={active ? '' : 'text-muted-foreground'} />
            <span className={cn('text-xs font-bold', !active && 'text-foreground')}>{label}</span>

            {/* Dot activo */}
            <span
              className={cn(
                'absolute right-2 top-2 h-2.5 w-2.5 rounded-full transition',
                active ? 'bg-card' : 'bg-transparent'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
