'use client';

import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { useAdminOrders } from '@saas/hooks';
import { AdminCard, Badge } from '@saas/ui';
import { formatPrice, ORDER_STATUSES } from '@saas/utils';
import type { Order, OrderStatus } from '@saas/types';

export interface KitchenTabProps {
  primaryColor?: string;
}

/** Cocina: pedidos activos con auto-refresh cada 30 segundos y avance de estado uno a uno */
export function KitchenTab({ primaryColor = 'var(--color-primary)' }: KitchenTabProps) {
  const { allOrders, loading, updateStatus, printComanda, reload } = useAdminOrders();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void reload();
  }, [tick, reload]);

  const active = allOrders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-neutral-500">Auto-refresh cada 30 segundos · {active.length} activos</p>
      {loading && active.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-800" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">Sin pedidos activos en cocina.</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {active.map((order) => (
            <AdminCard key={order._id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-white">#{order.orderNumber} · {order.customer.name}</p>
                <Badge variant={order.status === 'pending' ? 'destructive' : order.status === 'confirmed' ? 'default' : order.status === 'preparing' ? 'secondary' : 'success'}>
                  {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                </Badge>
              </div>
              <ul className="mb-3 flex flex-col gap-0.5">
                {order.items.map((item, i) => (
                  <li key={i} className="text-[11px] text-neutral-300">
                    <span className="font-bold text-white">{item.quantity}×</span>{' '}
                    {item.product?.title ?? (item as { title?: string }).title}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: primaryColor }}>{formatPrice(order.total)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => printComanda(order)}
                    className="rounded-md p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Imprimir comanda"
                  >
                    <Printer size={14} />
                  </button>
                  <NextStatusButton order={order} updateStatus={updateStatus} />
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

function NextStatusButton({
  order,
  updateStatus,
}: {
  order: Order;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const next: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
  };
  const target = next[order.status];
  const label = ORDER_STATUSES.find((s) => s.value === target)?.label ?? '';
  if (!target) return null;
  return (
    <button
      onClick={() => void updateStatus(order._id, target)}
      className="rounded-full px-3 py-1.5 text-[11px] font-bold text-black transition hover:opacity-90 active:scale-95"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      → {label}
    </button>
  );
}