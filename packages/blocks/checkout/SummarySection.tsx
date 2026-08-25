'use client';

import { formatPrice } from '@saas/utils';
import { CartItem } from '@saas/types';
import { useEffect, useState } from 'react';

export interface SummarySectionProps {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  surcharge?: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
  isDeliveryLoading?: boolean;
}

/** Resumen del pedido: ítems + subtotal/descuento/envío/recargo/total */
export function SummarySection({
  items,
  subtotal,
  discount = 0,
  surcharge = 0,
  total,
  deliveryType,
  isDeliveryLoading = false,
}: SummarySectionProps) {
  // Evitar mismatch de hidratación con precios formateados
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      {/* Ítems */}
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          const addonsTotal = (item.addons ?? []).reduce(
            (sum, ca) => sum + ca.addon.price * ca.quantity,
            0
          );
          return (
            <li key={item.cartItemId} className="flex justify-between gap-3 text-xs">
              <span className="min-w-0 flex-1 truncate text-neutral-600">
                {item.quantity}× {item.product.title}
                {(item.addons?.length ?? 0) > 0 && (
                  <span className="text-neutral-400"> (+extras)</span>
                )}
              </span>
              <span className="shrink-0 font-medium">
                {formatPrice((item.product.price + addonsTotal) * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="my-1 border-t border-dashed border-black/10" />

      {/* Totales */}
      <Row label="Subtotal" value={formatPrice(subtotal)} />
      {discount > 0 && (
        <Row label="Descuento" value={`− ${formatPrice(discount)}`} accent="green" />
      )}
      {deliveryType === 'delivery' &&
        (isDeliveryLoading ? (
          <span className="self-end text-[11px] text-neutral-400">Calculando envío...</span>
        ) : (
          <Row
            label="Envío"
            value={formatPrice(Math.max(0, total - subtotal + discount - surcharge))}
          />
        ))}
      {surcharge > 0 && (
        <Row label="Recargo tarjeta" value={`+ ${formatPrice(surcharge)}`} accent="orange" />
      )}

      <div className="mt-1 border-t border-black/10" />
      <div className="flex items-baseline justify-between">
        <span className="font-bold uppercase tracking-wide text-neutral-500">Total</span>
        <span
          className="text-xl font-black"
          style={{ color: 'var(--color-primary, #111)' }}
        >
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'orange';
}) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-600">{label}</span>
      <span
        className={
          accent === 'green' ? 'font-semibold text-green-600' : accent === 'orange' ? 'font-semibold text-orange-600' : 'font-medium'
        }
      >
        {value}
      </span>
    </div>
  );
}
