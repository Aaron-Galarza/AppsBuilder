'use client';

import { AdminActionButtons, AdminCard, Badge, Button, cn } from '@saas/ui';
import { useAdminOrders } from '@saas/hooks';
import { Order, OrderStatus } from '@saas/types';
import { formatPrice, formatTime, ORDER_STATUSES } from '@saas/utils';
import { ChevronDown, MessageCircle, Printer, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export interface OrdersTabProps {
  primaryColor?: string;
}

/** Gestión de pedidos: filtros por estado con conteos, detalle expandible y acciones */
export function OrdersTab({ primaryColor = '#111' }: OrdersTabProps) {
  const {
    orders,
    allOrders,
    loading,
    error,
    filter,
    setFilter,
    updateStatus,
    printComanda,
    reload,
    validStatuses,
  } = useAdminOrders();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const countByStatus = (status: OrderStatus) =>
    allOrders.filter((o) => o.status === status).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          label={`Todos (${allOrders.length})`}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          primaryColor={primaryColor}
        />
        {ORDER_STATUSES.map((s) => (
          <FilterChip
            key={s.value}
            label={`${s.label} (${countByStatus(s.value)})`}
            active={filter === s.value}
            onClick={() => setFilter(s.value)}
            primaryColor={primaryColor}
          />
        ))}

        <button
          onClick={reload}
          aria-label="Recargar pedidos"
          className="ml-auto rounded-md p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {error && <p className="text-xs font-medium text-red-400">{error}</p>}

      {/* Lista */}
      {loading && orders.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">No hay pedidos con este filtro.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((order) => (
            <li key={order._id}>
              <AdminCard variant="default" className={cn('p-3', expandedId === order._id && 'ring-1 ring-white/10')}>
                {/* Fila principal */}
                <button
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={expandedId === order._id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">
                      #{order.orderNumber} · {order.customer.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {formatTime(order.createdAt)} ·{' '}
                      {order.deliveryType === 'delivery' ? 'Envío' : 'Retiro'} · {order.items.length} ítems
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-black text-white">{formatPrice(order.total)}</span>
                    <StatusBadge status={order.status} />
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-neutral-500 transition',
                        expandedId === order._id && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                {/* Detalle expandido */}
                {expandedId === order._id && (
                  <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
                    {/* Contacto + dirección */}
                    <div className="grid gap-1 text-[11px] text-neutral-400 sm:grid-cols-2">
                      <p>
                        <span className="text-neutral-600">Tel:</span> {order.customer.phone}
                      </p>
                      {order.deliveryAddress && (
                        <p>
                          <span className="text-neutral-600">Dir:</span> {order.deliveryAddress}
                        </p>
                      )}
                      {order.notes && (
                        <p className="sm:col-span-2">
                          <span className="text-neutral-600">Notas:</span> {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Ítems */}
                    <ul className="space-y-1">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-[11px]">
                          <span className="text-neutral-300">
                            {item.quantity}× {item.product.title}
                            {(item.addons?.length ?? 0) > 0 &&
                              ` · ${item.addons.map((a) => `${a.quantity}× ${a.addon.name}`).join(', ')}`}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Acciones de estado */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {validStatuses.map((status) => {
                        if (status === order.status) return null;
                        return (
                          <button
                            key={status}
                            onClick={() => updateStatus(order._id, status)}
                            disabled={loading}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
                              status === 'cancelled'
                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                : 'border-white/10 text-neutral-300 hover:bg-white/10'
                            )}
                          >
                            → {ORDER_STATUSES.find((s) => s.value === status)?.label ?? status}
                          </button>
                        );
                      })}
                    </div>

                    {/* Imprimir / WhatsApp */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="secondary" onClick={() => printComanda(order)}>
                        <Printer size={13} /> Comanda
                      </Button>
                      <a
                        href={whatsappUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Abrir chat de WhatsApp"
                      >
                        <Button size="sm" variant="secondary">
                          <MessageCircle size={13} /> WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </AdminCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  primaryColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  primaryColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition',
        active ? 'border-transparent text-white' : 'border-white/10 text-neutral-400 hover:text-white'
      )}
      style={active ? { backgroundColor: primaryColor } : undefined}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUSES.find((s) => s.value === status);
  const variant =
    status === 'delivered' ? 'success' : status === 'cancelled' ? 'destructive' : 'default';
  return (
    <Badge variant={variant} className="shrink-0">
      {meta?.label ?? status}
    </Badge>
  );
}

function whatsappUrl(order: Order): string {
  const lines = [
    `Hola ${order.customer.name}! Tu pedido #${order.orderNumber}:`,
    ...order.items.map((i) => `• ${i.quantity}× ${i.product.title}`),
    `Total: ${formatPrice(order.total)}`,
  ];
  return `https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(lines.join('\n'))}`;
}
