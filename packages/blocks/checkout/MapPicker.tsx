'use client';

import { Button } from '@saas/ui';
import { AddressResult } from '@saas/types';
import { Crosshair } from 'lucide-react';
import type { Map as MbxMap, Marker as MbxMarker } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

export interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoordinates: (address: AddressResult) => void;
  initialLat?: number;
  initialLng?: number;
}

const DEFAULT_CENTER: [number, number] = [-58.3816, -34.6037]; // CABA

/**
 * Selector de dirección en mapa oscuro a pantalla completa.
 * Marker arrastrable + click para mover. Reverse geocode al confirmar.
 */
export function MapPicker({ isOpen, onClose, onSelectCoordinates, initialLat, initialLng }: MapPickerProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLng, initialLat] : null
  );
  const [tokenMissing, setTokenMissing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MbxMap | null>(null);
  const markerRef = useRef<MbxMarker | null>(null);

  // Inicializar mapa cuando se abre
  useEffect(() => {
    if (!isOpen || !containerRef.current || mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        await import('mapbox-gl/dist/mapbox-gl.css');

        if (cancelled) return;

        const token =
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? '';
        if (!token) {
          setTokenMissing(true);
          return;
        }
        mapboxgl.accessToken = token;

        const center: [number, number] =
          initialLat && initialLng ? [initialLng, initialLat] : DEFAULT_CENTER;

        const map = new mapboxgl.Map({
          container: containerRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center,
          zoom: 16,
        });

        const marker = new mapboxgl.Marker({ draggable: true, color: '#ffffff' })
          .setLngLat(center)
          .addTo(map);

        marker.on('dragend', () => {
          const { lng, lat } = marker.getLngLat();
          setCoordinates([lng, lat]);
        });

        // Click mueve el marcador
        map.on('click', (e) => {
          marker.setLngLat(e.lngLat);
          setCoordinates([e.lngLat.lng, e.lngLat.lat]);
        });

        mapRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        console.error('Error inicializando el mapa:', err);
      }
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [isOpen, initialLat, initialLng]);

  // Cleanup al cerrar
  useEffect(() => {
    if (isOpen) return;
    mapRef.current?.remove();
    mapRef.current = null;
    markerRef.current = null;
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!coordinates) return;
    const [lng, lat] = coordinates;

    let finalAddress = '';
    try {
      const res = await fetch('/api/geocoding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      if (res.ok) {
        const data = await res.json();
        finalAddress = data?.data?.address ?? '';
      }
    } catch {
      /* sin reverse geocode seguimos con coordenadas */
    }

    onSelectCoordinates({
      address: finalAddress || `(${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      lat,
      lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-label="Elegir en el mapa">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 text-white">
        <h2 className="text-sm font-bold">Tocá el mapa o mové el pin</h2>
        <button
          onClick={onClose}
          aria-label="Cerrar mapa"
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20"
        >
          Cancelar
        </button>
      </header>

      {/* Mapa */}
      <div ref={containerRef} className="relative flex-1" />

      {tokenMissing && (
        <p className="absolute inset-0 flex items-center justify-center bg-neutral-900 p-8 text-center text-sm text-neutral-400">
          Falta configurar NEXT_PUBLIC_MAPBOX_TOKEN
        </p>
      )}

      {/* Footer confirmación */}
      <footer className="flex items-center gap-3 bg-neutral-900 px-4 py-4">
        <button
          onClick={() => {
            navigator.geolocation?.getCurrentPosition((pos) => {
              const { longitude, latitude } = pos.coords;
              mapRef.current?.jumpTo({ center: [longitude, latitude], zoom: 17 });
              markerRef.current?.setLngLat([longitude, latitude]);
              setCoordinates([longitude, latitude]);
            });
          }}
          aria-label="Usar mi ubicación"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <Crosshair size={18} />
        </button>

        <Button onClick={handleConfirm} disabled={!coordinates} className="flex-1 py-3 font-bold">
          Confirmar dirección
        </Button>
      </footer>
    </div>
  );
}
