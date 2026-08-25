'use client';

import { useCartStore, useDelivery } from '@saas/hooks';
import { formatPrice } from '@saas/utils';
import { Bike, Store } from 'lucide-react';

export interface DeliveryCostPreviewProps {
  primaryColor?: string;
}

/**
 * Muestra distancia y costo de envío en tiempo real.
 * El cálculo lo mantiene useDelivery (side-effect) en el store.
 */
export function DeliveryCostPreview({}: DeliveryCostPreviewProps) {
  const deliveryType = useCartStore((s) => s.deliveryType);
  const deliveryCost = useCartStore((s) => s.deliveryCost);
  const distanceKm = useCartStore((s) => s.distanceKm);
  const deliveryCoordinates = useCartStore((s) => s.deliveryCoordinates);

  // Activa el cálculo automático
  useDelivery();

  if (deliveryType !== 'delivery') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-xs font-medium text-neutral-600">
        <Store size={15} />
        Retirás tu pedido en el local
      </div>
    );
  }

  const hasCoords =
    typeof deliveryCoordinates?.lat === 'number' && typeof deliveryCoordinates?.lng === 'number';

  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 text-xs">
      <span className="inline-flex items-center gap-2 font-medium text-neutral-600">
        <Bike size={15} />
        {hasCoords
          ? distanceKm
            ? `Envío · ${distanceKm} km`
            : 'Envío a tu dirección'
          : 'Elegí tu dirección para calcular el envío'}
      </span>

      {hasCoords && (
        <span className="font-bold" style={{ color: 'var(--color-primary, #111)' }}>
          {formatPrice(deliveryCost ?? 0)}
        </span>
      )}
    </div>
  );
}
