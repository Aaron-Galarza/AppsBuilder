'use client';

import { AdminCard, Badge, cn } from '@saas/ui';
import { useAdminCoupons, useAdminOrders, useAdminOverview, OverviewRange } from '@saas/hooks';
import { AnalyticsStats } from '@saas/types';
import { formatPrice, formatTime, ORDER_STATUSES } from '@saas/utils';
import {
  Banknote,
  CreditCard,
  Landmark,
  PackageCheck,
  Printer,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export interface OverviewTabProps {
  primaryColor?: string;
}

const RANGES: { value: OverviewRange; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

/** Resumen general: KPIs por rango, pedidos recientes, top productos y cupones */
export function OverviewTab({ primaryColor = '#111' }: OverviewTabProps) {
  const { stats, loading, range, setRange } = useAdminOverview();
  const { orders: recentOrders, printComanda, updateStatus } = useAdminOrders();
  const { coupons } = useAdminCoupons();

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de rango */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
          Resumen
        </h2>
        <div className="flex gap-1 rounded-full bg-neutral-800 p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                range === r.value ? 'text-white' : 'text-neutral-400 hover:text-white'
              )}
              style={range === r.value ? { backgroundColor: primaryColor } : undefined}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <KpiGrid stats={stats} loading={loading} primaryColor={primaryColor} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pedidos recientes */}
        <AdminCard variant="default" className="p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <TrendingUp size={15} style={{ color: primaryColor }} />
            Últimos pedidos
          </h3>
          {(recentOrders ?? []).slice(0, 6).map((order) => {
            const statusMeta = ORDER_STATUSES.find((s) => s.value === order.status);
            return (
              <div
                key={order._id}
                className="flex items-center justify-between gap-2 border-b border-white/5 py-2 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    #{order.orderNumber} · {order.customer.name}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {formatTime(order.createdAt)} · {order.items.length} ítems
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge
                    variant={
                      order.status === 'delivered'
                        ? 'success'
                        : order.status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {statusMeta?.label ?? order.status}
                  </Badge>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order._id, 'confirmed')}
                      aria-label={`Confirmar pedido #${order.orderNumber}`}
                      className="rounded-md bg-green-600 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-green-500"
                    >
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => printComanda(order)}
                    aria-label={`Imprimir comanda #${order.orderNumber}`}
                    className="rounded-md p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <Printer size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {(recentOrders ?? []).length === 0 && !loading && (
            <p className="py-6 text-center text-xs text-neutral-500">Sin pedidos en el rango.</p>
          )}
        </AdminCard>

        {/* Top productos + cupones */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <AdminCard variant="default" className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Star size={15} style={{ color: primaryColor }} />
              Más vendidos
            </h3>
            {(stats?.topProducts ?? []).slice(0, 5).map((tp, i) => (
              <div key={tp.productId} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                <span className="truncate text-xs text-white">
                  <span className="mr-1.5 font-black text-neutral-600">#{i + 1}</span>
                  {tp.title}
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-neutral-400">
                  {tp.quantity} u · {formatPrice(tp.revenue)}
                </span>
              </div>
            ))}
            {(stats?.topProducts ?? []).length === 0 && (
              <p className="py-4 text-center text-xs text-neutral-500">Sin datos aún.</p>
            )}
          </AdminCard>

          <AdminCard variant="default" className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Wallet size={15} style={{ color: primaryColor }} />
              Cupones activos
            </h3>
            {coupons.filter((c) => c.active).slice(0, 5).map((c) => (
              <div key={c._id} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                <span className="truncate font-mono text-xs font-bold text-white">{c.code}</span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                </span>
              </div>
            ))}
            {coupons.filter((c) => c.active).length === 0 && (
              <p className="py-4 text-center text-xs text-neutral-500">Sin cupones activos.</p>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- KPIs ------------------------------- */

function KpiGrid({
  stats,
  loading,
  primaryColor,
}: {
  stats: AnalyticsStats | null;
  loading: boolean;
  primaryColor: string;
}) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-800" />
        ))}
      </div>
    );
  }

  const pm = stats?.byPaymentMethod;

  const kpis = [
    { label: 'Pedidos', value: String(stats?.totalOrders ?? 0), Icon: TrendingUp, accent: primaryColor },
    { label: 'Facturación', value: formatPrice(stats?.totalRevenue ?? 0), Icon: Wallet, accent: '#22c55e' },
    { label: 'Entregados', value: String(stats?.delivered ?? 0), Icon: PackageCheck, accent: '#38bdf8' },
    { label: 'Efectivo', value: formatPrice(pm?.cash ?? 0), Icon: Banknote, accent: '#a3e635' },
    { label: 'Débito', value: formatPrice(pm?.debito ?? 0), Icon: CreditCard, accent: '#f472b6' },
    { label: 'Crédito', value: formatPrice(pm?.credito ?? 0), Icon: CreditCard, accent: '#fb923c' },
    { label: 'Transferencia', value: formatPrice(pm?.transferencia ?? 0), Icon: Landmark, accent: '#c084fc' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {kpis.map(({ label, value, Icon, accent }) => (
        <div
          key={label}
          className="flex flex-col gap-1 rounded-xl border border-white/5 bg-[#161616] p-3"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
            <Icon size={12} style={{ color: accent }} />
            {label}
          </span>
          <span className="truncate text-base font-black text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}
