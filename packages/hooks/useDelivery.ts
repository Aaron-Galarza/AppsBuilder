'use client';

import { useEffect } from 'react';
import { apiFetch } from './lib/api';
import { useCartStore } from './useCartStore';

interface DeliveryCalculation {
  distanceKm: number;
  deliveryCost: number;
}

/**
 * Observa coordenadas + tipo de entrega del carrito y mantiene
 * el costo de envío actualizado en el store.
 */
export function useDelivery() {
  const deliveryType = useCartStore((s) => s.deliveryType);
  const deliveryCoordinates = useCartStore((s) => s.deliveryCoordinates);
  const setDeliveryCost = useCartStore((s) => s.setDeliveryCost);

  const lat = deliveryCoordinates?.lat;
  const lng = deliveryCoordinates?.lng;

  useEffect(() => {
    if (deliveryType !== 'delivery' || typeof lat !== 'number' || typeof lng !== 'number') {
      return;
    }

    let cancelled = false;

    const calculate = async () => {
      try {
        const data = await apiFetch<DeliveryCalculation>('/api/delivery/calculate', {
          method: 'POST',
          body: JSON.stringify({ lat, lng }),
        });
        if (!cancelled) setDeliveryCost(data.deliveryCost, data.distanceKm);
      } catch (err) {
        console.error('[useDelivery]', err);
        // Sin costo confiable → resetear a 0 (se coordina por WhatsApp)
        if (!cancelled) setDeliveryCost(0, 0);
      }
    };

    void calculate();
    return () => {
      cancelled = true;
    };
  }, [deliveryType, lat, lng, setDeliveryCost]);
}
