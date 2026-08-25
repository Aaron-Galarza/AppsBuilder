'use client';

import { AddressResult } from '@saas/types';
import { MapPin } from 'lucide-react';

export interface AddressMapProps {
  address: AddressResult | null;
  height?: number;
  mapboxToken?: string;
}

/** Preview estático del mapa para una dirección elegida (imagen, sin JS de mapa) */
export function AddressMap({ address, height = 160 }: AddressMapProps) {
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? '';

  if (!address || typeof address.lat !== 'number' || typeof address.lng !== 'number' || !token) {
    return null;
  }

  const src = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+ffffff(${address.lng},${address.lat})/${address.lng},${address.lat},15,0/480x${height}@2x?access_token=${token}`;

  return (
    <div className="overflow-hidden rounded-xl border border-black/10" style={{ height }}>
      <img
        src={src}
        alt={`Mapa de ${address.address}`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <p className="sr-only">
        <MapPin size={12} /> {address.address}
      </p>
    </div>
  );
}
