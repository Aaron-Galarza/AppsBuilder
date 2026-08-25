'use client';

import { useStoreStatus } from '@saas/hooks';
import { MoonStar } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface StoreClosedProps {
  primaryColor?: string;
  /** Texto de horario opcional (ej: "Miércoles: 19:00 - 23:30") */
  scheduleText?: string;
}

/** Overlay a pantalla completa cuando la tienda está cerrada (isOpen === false) */
export function StoreClosed({ primaryColor = '#111', scheduleText }: StoreClosedProps) {
  const { isOpen } = useStoreStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
      role="alertdialog"
      aria-label="Tienda cerrada"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primaryColor}1A` }}
        >
          <MoonStar size={28} style={{ color: primaryColor }} />
        </div>

        <h2 className="text-xl font-black">Estamos cerrados</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Todavía no abrimos, pero podés armar tu pedido y enviarlo cuando abramos.
        </p>

        {scheduleText && (
          <p className="mt-5 inline-block rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700">
            {scheduleText}
          </p>
        )}
      </div>
    </div>
  );
}
