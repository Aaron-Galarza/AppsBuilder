'use client';

import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@saas/hooks';
import { cloudinaryImage, formatPrice } from '@saas/utils';
import { CartItem } from '@saas/types';
import { Stepper, cn } from '@saas/ui';
import { Trash2 } from 'lucide-react';
import { CartItemHeader } from './CartItemHeader';
import { CartItemExtrasPanel } from './CartItemExtrasPanel';

export interface CartItemCardProps {
  item: CartItem;
}

const REMOVE_ANIMATION_MS = 300;
const FALLBACK_EMOJI = '🍽️';

/**
 * Item del carrito con animación de salida, steppers de cantidad y
 * edición rápida de adicionales (DNA signature para resetear la animación).
 */
export function CartItemCard({ item }: CartItemCardProps) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateItemAddon = useCartStore((s) => s.updateItemAddon);

  const [isRemoving, setIsRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);

  // DNA signature: producto + adicionales ordenados con cantidades.
  // Si cambia (p.ej. se editó un addon desde otro lado), resetea la animación.
  const dataSignature = `${item.product._id}-${[...(item.addons ?? [])]
    .sort((a, b) => a.addon._id.localeCompare(b.addon._id))
    .map((a) => `${a.addon._id}:${a.quantity}`)
    .join('|')}`;

  const prevSignature = useRef(dataSignature);
  useEffect(() => {
    if (prevSignature.current !== dataSignature) {
      prevSignature.current = dataSignature;
      setIsRemoving(false);
    }
  }, [dataSignature]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeItem(item.cartItemId), REMOVE_ANIMATION_MS);
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) handleRemove();
    else updateQuantity(item.cartItemId, item.quantity - 1);
  };

  const isValidImage =
    typeof item.product.image === 'string' &&
    (item.product.image.startsWith('http') || item.product.image.startsWith('/'));
  const imageSrc = isValidImage ? cloudinaryImage(item.product.image, 200) : '';

  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border border-black/5 bg-white p-3 transition-all duration-300',
        isRemoving && 'translate-x-full opacity-0'
      )}
      aria-hidden={isRemoving}
    >
      {/* Imagen */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {!imageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={item.product.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl opacity-30">
            {FALLBACK_EMOJI}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <CartItemHeader item={item} />

        {(item.addons?.length ?? 0) > 0 && (
          <ul className="mt-1 space-y-0.5">
            {item.addons.map((ca) => (
              <li key={`${ca.addon._id}-${dataSignature}`} className="text-[11px] text-neutral-500">
                + {ca.quantity}× {ca.addon.name} ({formatPrice(ca.addon.price * ca.quantity)})
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex items-center justify-between">
          <Stepper
            value={item.quantity}
            onIncrease={() => updateQuantity(item.cartItemId, item.quantity + 1)}
            onDecrease={handleDecrease}
          />
          <button
            onClick={handleRemove}
            aria-label={`Quitar ${item.product.title}`}
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Edición rápida de adicionales */}
        {(item.addons?.length ?? 0) > 0 && (
          <CartItemExtrasPanel cartItemId={item.cartItemId} addons={item.addons} />
        )}
      </div>
    </div>
  );
}
