'use client';

import { Order, OrderStatus } from '@saas/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { printComanda } from './utils/comanda';
import { useAuthStore } from './useAuthStore';

/** Rango de fechas soportado por GET /api/orders/admin y /api/analytics */
export type AdminRange = 'hoy' | 'semana' | 'mes';

const VALID_RANGES: AdminRange[] = ['hoy', 'semana', 'mes'];

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
];

/** Pedidos del admin con rango de fechas, filtro por estado e impresion de comanda */
export function useAdminOrders() {
  const token = useAuthStore((s) => s.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [range, setRange] = useState<AdminRange>('hoy');
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (r: AdminRange) => {
      try {
        setLoading(true);
        const validRange = VALID_RANGES.includes(r) ? r : 'hoy';
        const data = await apiFetch<Order[]>(
          `/api/orders/admin?range=${encodeURIComponent(validRange)}`,
          { headers: authHeaders(token) }
        );
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los pedidos');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void fetchOrders(range);
  }, [fetchOrders, range]);

  // Refetch al volver a la pestaña (pedidos nuevos)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void fetchOrders(range);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchOrders, range]);

  const filteredOrders = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const updateStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      await apiFetch(`/api/orders/admin/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    },
    [token]
  );

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    filter,
    setFilter,
    range,
    setRange,
    updateStatus,
    printComanda,
    reload: () => fetchOrders(range),
    validStatuses: VALID_STATUSES,
  };
}
