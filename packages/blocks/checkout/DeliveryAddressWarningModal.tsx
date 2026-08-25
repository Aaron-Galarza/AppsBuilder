'use client';

import { Button } from '@saas/ui';
import { AlertTriangle, MapPin } from 'lucide-react';

export interface DeliveryAddressWarningModalProps {
  isOpen: boolean;
  addressText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de advertencia cuando el cliente confirma una dirección
 * que no pudimos geolocalizar (el costo se coordina por WhatsApp).
 */
export function DeliveryAddressWarningModal({
  isOpen,
  addressText,
  onConfirm,
  onCancel,
}: DeliveryAddressWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="alertdialog"
      aria-label="Dirección sin verificar"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle size={20} className="text-orange-600" />
          </span>
          <h3 className="text-base font-bold leading-tight">¿Tu dirección es correcta?</h3>
        </div>

        <p className="text-sm leading-relaxed text-neutral-500">
          No pudimos ubicar en el mapa:{' '}
          <strong className="text-neutral-800">{addressText || 'la dirección ingresada'}</strong>. El
          costo de envío se coordinará por WhatsApp al confirmar el pedido.
        </p>

        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-500">
          <MapPin size={12} />
          Podés elegir "Elegir en el mapa" para mayor precisión
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={onConfirm} className="w-full">
            Es correcta, confirmar
          </Button>
          <Button onClick={onCancel} variant="ghost" className="w-full">
            Cambiar dirección
          </Button>
        </div>
      </div>
    </div>
  );
}
