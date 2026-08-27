'use client';

import { Order, OrderStatus, Product } from '@saas/types';
import { useCallback, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAuthStore } from './useAuthStore';

interface QuickOrderItem {
  product: Product;
  quantity: number;
}

interface QuickOrderCustomer {
  name: string;
  phone: string;
}

/**
 * Pedido manual tomado por WhatsApp/teléfono: el admin lo carga directo.
 * Se envía con source: 'manual' para que el backend lo acepte
 * aunque el local esté cerrado al público.
 */
export function useQuickOrder() {
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<QuickOrderItem[]>([]);
  const [customer, setCustomer] = useState<QuickOrderCustomer>({ name: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product._id === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product._id !== productId)
        : prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  }, []);

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  /** Crea la orden manual. Devuelve la orden creada o lanza el error del backend. */
  const submitQuickOrder = useCallback(
    async (
      deliveryType: 'pickup' | 'delivery',
      paymentMethod: 'cash' | 'debito' | 'credito' | 'transferencia'
    ): Promise<Order> => {
      if (items.length === 0) throw new Error('Agregá al menos un producto');
      if (!customer.name.trim() || customer.name.trim().length < 3)
        throw new Error('Nombre del cliente requerido');
      if (!customer.phone.trim() || customer.phone.trim().length < 6)
        throw new Error('Teléfono del cliente requerido');

      setSubmitting(true);
      setError(null);

      try {
        return await apiFetch<Order>('/api/orders', {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({
            source: 'manual',
            customer: { name: customer.name.trim(), phone: customer.phone.trim() },
            items: items.map((i) => ({
              productId: i.product._id,
              quantity: i.quantity,
              addons: [],
            })),
            deliveryType,
            paymentMethod,
            notes: notes ? notes.slice(0, 300) : undefined,
          }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear el pedido';
        setError(message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [items, customer, notes]
  );

  const reset = useCallback(() => {
    setItems([]);
    setCustomer({ name: '', phone: '' });
    setNotes('');
    setError(null);
  }, []);

  return {
    items,
    addProduct,
    updateQuantity,
    removeProduct,
    customer,
    setCustomer,
    notes,
    setNotes,
    total,
    submitting,
    error,
    submitQuickOrder,
    reset,
  };
}
