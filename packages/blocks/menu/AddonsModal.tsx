'use client';

import { Button, Modal, Stepper } from '@saas/ui';
import { Addon, Product } from '@saas/types';
import { formatPrice } from '@saas/utils';
import { useState } from 'react';

export interface SelectedAddon {
  addon: Addon;
  quantity: number;
}

export interface AddonsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, selectedAddons: SelectedAddon[]) => void;
}

/** Modal para elegir adicionales y cantidad de un producto antes de agregar al carrito */
export function AddonsModal({ product, isOpen, onClose, onConfirm }: AddonsModalProps) {
  // Record<addonId, cantidad>
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const availableAddons = (product.addons ?? []).filter((a) => a.available);

  const totalAddonsPrice = Object.entries(selectedAddons).reduce((total, [addonId, qty]) => {
    const addon = product.addons?.find((a) => a._id === addonId);
    return addon ? total + addon.price * qty : total;
  }, 0);

  const totalPrice = (product.price + totalAddonsPrice) * quantity;

  const handleAdd = (addonId: string) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: (prev[addonId] ?? 0) + 1 }));
  };

  const handleRemove = (addonId: string) => {
    const current = selectedAddons[addonId] ?? 0;
    if (current <= 1) {
      setSelectedAddons((prev) => {
        const next = { ...prev };
        delete next[addonId];
        return next;
      });
    } else {
      setSelectedAddons((prev) => ({ ...prev, [addonId]: current - 1 }));
    }
  };

  const handleConfirm = () => {
    const selected: SelectedAddon[] = Object.entries(selectedAddons).map(([addonId, qty]) => ({
      addon: availableAddons.find((a) => a._id === addonId)!,
      quantity: qty,
    }));

    onConfirm(product, quantity, selected.filter((s) => s.addon));
    onClose();
    setSelectedAddons({});
    setQuantity(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.title} size="md">
      <div className="flex flex-col gap-4">
        {/* Adicionales disponibles */}
        {availableAddons.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Agrega extras
            </h4>
            {availableAddons.map((addon) => {
              const qty = selectedAddons[addon._id] ?? 0;
              return (
                <div
                  key={addon._id}
                  className={
                    qty > 0
                      ? 'flex items-center justify-between rounded-xl border border-black/10 bg-neutral-50 px-3 py-2.5'
                      : 'flex items-center justify-between rounded-xl border border-dashed border-black/10 px-3 py-2.5'
                  }
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{addon.name}</p>
                    <p className="text-xs text-neutral-500">{formatPrice(addon.price)}</p>
                  </div>

                  {qty > 0 ? (
                    <Stepper
                      value={qty}
                      onIncrease={() => handleAdd(addon._id)}
                      onDecrease={() => handleRemove(addon._id)}
                    />
                  ) : (
                    <button
                      onClick={() => handleAdd(addon._id)}
                      aria-label={`Agregar ${addon.name}`}
                      className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                      style={{ backgroundColor: 'var(--color-primary, #111)' }}
                    >
                      + Agregar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Cantidad + confirmar */}
        <div className="flex items-center gap-3 border-t border-black/5 pt-4">
          <Stepper value={quantity} onIncrease={() => setQuantity((q) => q + 1)} onDecrease={() => setQuantity((q) => Math.max(1, q - 1))} minValue={1} size="lg" />
          <Button onClick={handleConfirm} size="lg" className="flex-1">
            Agregar · {formatPrice(totalPrice)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
