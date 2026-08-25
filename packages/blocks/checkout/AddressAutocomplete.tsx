'use client';

import { Input } from '@saas/ui';
import { useAddressSearch } from '@saas/hooks';
import { AddressResult } from '@saas/types';
import { MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MapPicker } from './MapPicker';

export interface AddressAutocompleteProps {
  value: AddressResult | null;
  onChange: (address: AddressResult | null) => void;
  onClear?: () => void;
  placeholder?: string;
}

const MIN_CHARS = 4;

/**
 * Input de dirección con dropdown de sugerencias (geocoding backend)
 * y botón para elegir en el mapa.
 */
export function AddressAutocomplete({ value, onChange, onClear, placeholder = 'Tu dirección...' }: AddressAutocompleteProps) {
  const { results, loading, error, search, clear } = useAddressSearch();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setIsSelected(false);
    setIsOpen(text.trim().length >= MIN_CHARS);
    if (text.trim().length >= MIN_CHARS) search(text);
    else clear();
    if (!text && value) {
      onChange(null);
      onClear?.();
    }
  };

  const handleSelect = (result: AddressResult) => {
    setInputValue(result.address);
    setIsSelected(true);
    setIsOpen(false);
    clear();
    onChange(result);
  };

  const handleMapPick = (result: AddressResult) => {
    handleSelect(result);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => inputValue.trim().length >= MIN_CHARS && !isSelected && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Dirección de entrega"
          className="pl-9 pr-9"
        />
        {inputValue && (
          <button
            onClick={() => handleInputChange('')}
            aria-label="Limpiar dirección"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
          {loading && <p className="px-3 py-2.5 text-xs text-neutral-500">Buscando...</p>}
          {!loading && error && <p className="px-3 py-2.5 text-xs text-red-500">{error}</p>}
          {!loading && !error && results.length === 0 && (
            <button
              onClick={() => {
                const fallback: AddressResult = {
                  address: inputValue.trim(),
                  lat: 0,
                  lng: 0,
                };
                handleSelect(fallback);
              }}
              className="block w-full px-3 py-2.5 text-left text-xs font-medium transition hover:bg-neutral-50"
            >
              Usar esta dirección: "{inputValue.trim()}"
            </button>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.lat}-${r.lng}-${i}`}
              onClick={() => handleSelect(r)}
              className="block w-full px-3 py-2.5 text-left text-xs leading-snug transition hover:bg-neutral-50"
            >
              {r.placeName ?? r.address}
            </button>
          ))}

          {/* Elegir en el mapa */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsMapOpen(true);
            }}
            className="flex w-full items-center gap-2 border-t border-black/5 px-3 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            <MapPin size={14} />
            Elegir en el mapa
          </button>
        </div>
      )}

      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectCoordinates={handleMapPick}
        initialLat={value?.lat || undefined}
        initialLng={value?.lng || undefined}
      />
    </div>
  );
}
