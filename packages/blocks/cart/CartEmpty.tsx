'use client';

import { Button } from '@saas/ui';
import { ShoppingBag } from 'lucide-react';

export interface CartEmptyProps {
  onBackToMenu?: () => void;
}

/** Estado vacío del carrito con CTA para volver al menú */
export function CartEmpty({ onBackToMenu }: CartEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <ShoppingBag size={26} className="text-neutral-400" />
      </div>

      <div>
        <h3 className="text-base font-bold">Tu carrito está vacío</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Agregá productos del menú para empezar tu pedido.
        </p>
      </div>

      {onBackToMenu && (
        <Button onClick={onBackToMenu} variant="outline" size="sm">
          Ver el menú
        </Button>
      )}
    </div>
  );
}
