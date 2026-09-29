'use client';

import { Input } from '@saas/ui';
import { useCartStore } from '@saas/hooks';
import { MapPin, X } from 'lucide-react';

export interface AddressSimpleProps {
  placeholder?: string;
}

/**
 * Campo de dirección simple (texto libre): sin geocoding ni mapa.
 * El costo del envío se coordina aparte con el negocio (lo usa la plantilla basic).
 */
export function AddressSimple({ placeholder = 'Tu dirección...' }: AddressSimpleProps) {
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress);
  const clearDelivery = useCartStore((s) => s.clearDelivery);

  return (
    <div className="relative w-full">
      <MapPin
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={deliveryAddress}
        onChange={(e) => setDeliveryAddress(e.target.value, null)}
        placeholder={placeholder}
        autoComplete="street-address"
        aria-label="Dirección de entrega"
        className="pl-9 pr-9"
      />
      {deliveryAddress && (
        <button
          onClick={clearDelivery}
          aria-label="Limpiar dirección"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}