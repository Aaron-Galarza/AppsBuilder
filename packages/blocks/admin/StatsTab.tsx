'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminOrders, useAdminOverview } from '@saas/hooks';
import { AdminCard, Button, cn } from '@saas/ui';
import { formatPrice, formatTime, PAYMENT_METHODS } from '@saas/utils';

export interface StatsTabProps {
  primaryColor?: string;
}

/** Estadísticas de ventas: KPIs por rango, pedidos entregados (tabla/CV agrupado) y exportación CSV */
export function StatsTab({ primaryColor = 'var(--color-primary)' }: StatsTabProps) {
  const { stats, loading, range, setRange } = useAdminOverview('hoy');
  const { allOrders, reload } = useAdminOrders();
  const [grouped, setGrouped] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const delivered = allOrders.filter((o) => o.status === 'delivered');

  const filteredDelivered = useMemo(
    () => (paymentFilter === 'all' ? delivered : delivered.filter((o) => o.paymentMethod === paymentFilter)),
    [delivered, paymentFilter]
  );

  const totalPago = filteredDelivered.reduce((sum, o) => sum + o.total, 0);

  type GroupedRow = { type: 'product' | 'addon'; title: string; qty: number; revenue: number };
  // Vista agrupada por producto (estilo Cheepers): producto + sub-filas de adicionales, todos los pagos.
  const groupedRows = useMemo<GroupedRow[]>(() => {
    if (!grouped) return [];
    const byProduct = new Map<string, { qty: number; revenue: number; addons: Map<string, { title: string; qty: number; revenue: number }> }>();
    for (const o of delivered) {
      for (const item of o.items) {
        const flat = item as { title?: string; price?: number; addons?: { name?: string; price?: number; quantity?: number }[] };
        const title = flat.title ?? (item as { product?: { title?: string } }).product?.title ?? 'Producto';
        const price = flat.price ?? (item as { product?: { price?: number } }).product?.price ?? 0;
        const entry = byProduct.get(title) ?? { qty: 0, revenue: 0, addons: new Map() };
        entry.qty += item.quantity;
        entry.revenue += price * item.quantity;
        for (const a of flat.addons ?? []) {
          const aName = a.name ?? (a as { addon?: { name?: string } }).addon?.name ?? 'Adicional';
          const aQty = a.quantity ?? 1;
          const aPrice = a.price ?? (a as { addon?: { price?: number } }).addon?.price ?? 0;
          const aRow = entry.addons.get(aName) ?? { title: aName, qty: 0, revenue: 0 };
          aRow.qty += aQty;
          aRow.revenue += aPrice * aQty;
          entry.addons.set(aName, aRow);
        }
        byProduct.set(title, entry);
      }
    }
    const rows: GroupedRow[] = [];
    byProduct.forEach((e, productTitle) => {
      rows.push({ type: 'product', title: productTitle, qty: e.qty, revenue: e.revenue });
      e.addons.forEach((a) => rows.push({ type: 'addon', title: a.title, qty: a.qty, revenue: a.revenue }));
    });
    return rows;
  }, [delivered, grouped]);

  const productRows = groupedRows.filter((g) => g.type === 'product');
  const totalQty = productRows.reduce((sum, g) => sum + g.qty, 0);
  const totalRevenue = productRows.reduce((sum, g) => sum + g.revenue, 0);

  const ranges = [
    { value: 'hoy' as const, label: 'Hoy' },
    { value: 'ayer' as const, label: 'Ayer' },
    { value: 'semana' as const, label: 'Semana' },
    { value: 'mes' as const, label: 'Mes' },
  ];

  const handleExport = () => {
    const rows = [
      ['Fecha/Hora', 'Pedido', 'Pago', 'Total'],
      ...filteredDelivered.map((o) => [
        new Date(o.createdAt).toLocaleString('es-AR'),
        `#${o.orderNumber}`,
        PAYMENT_METHODS.find((p) => p.value === o.paymentMethod)?.label ?? o.paymentMethod,
        formatPrice(o.total),
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pedidos-entregados.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pm = stats?.byPaymentMethod;
  const kpis = [
    { label: 'Pedidos', value: String(stats?.totalOrders ?? 0), accent: '#38bdf8' },
    { label: 'Facturación', value: formatPrice(stats?.totalRevenue ?? 0), accent: '#22c55e' },
    { label: 'Entregados', value: String(stats?.delivered ?? 0), accent: '#a3e635' },
    { label: 'Efectivo', value: formatPrice(pm?.cash ?? 0), accent: '#f59e0b' },
    { label: 'Débito', value: formatPrice(pm?.debito ?? 0), accent: '#f472b6' },
    { label: 'Crédito', value: formatPrice(pm?.credito ?? 0), accent: '#fb923c' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros rango */}
      <div className="flex flex-wrap items-center gap-1">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              range === r.value ? 'bg-primary text-black' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            )}
          >
            {r.label}
          </button>
        ))}
        <button
          onClick={reload}
          className="ml-auto rounded-md p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Recargar estadísticas"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <AdminCard key={kpi.label} className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">{kpi.label}</p>
            <p className="mt-1 truncate text-lg font-black" style={{ color: kpi.accent }}>{kpi.value}</p>
          </AdminCard>
        ))}
      </div>

      {/* Tabla pedidos entregados */}
      <AdminCard className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white">Pedidos Entregados</h3>
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              disabled={grouped}
              className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Filtrar por método de pago"
            >
              <option value="all">Todos los pagos</option>
              {PAYMENT_METHODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} className="accent-white" />
              Agrupado
            </label>
            {grouped && <span className="text-xs text-neutral-500">Vista agrupada (todos los pagos)</span>}
            <Button size="sm" onClick={handleExport} style={{ backgroundColor: primaryColor, color: '#000' }}>Exportar CSV</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {grouped ? (
            groupedRows.length === 0 ? (
              <p className="py-8 text-center text-neutral-500">Sin datos para agrupar.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-500">
                    <th className="pb-2 pr-2 font-semibold">Producto</th>
                    <th className="pb-2 pr-2 text-right font-semibold">Cantidad</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map((g, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 pr-2 ${g.type === 'product' ? 'font-semibold text-white' : 'pl-4 text-neutral-400'}`}>
                        {g.type === 'addon' ? `+ ${g.title}` : g.title}
                      </td>
                      <td className={`py-2 pr-2 text-right ${g.type === 'product' ? 'font-bold text-white' : 'text-neutral-400'}`}>
                        {g.qty}
                      </td>
                      <td className={`py-2 text-right ${g.type === 'product' ? 'font-bold text-primary' : 'text-neutral-400'}`}>
                        {formatPrice(g.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td className="py-2 font-bold text-white">Total</td>
                    <td className="py-2 text-right font-bold text-white">{totalQty}</td>
                    <td className="py-2 text-right font-black text-primary">{formatPrice(totalRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            )
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-neutral-500">
                  <th className="pb-2 pr-2 font-semibold">Fecha/Hora</th>
                  <th className="pb-2 pr-2 font-semibold">Pedido</th>
                  <th className="pb-2 pr-2 font-semibold">Pago</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredDelivered.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-neutral-500">Sin pedidos entregados.</td></tr>
                ) : (
                  filteredDelivered.map((o) => (
                    <tr key={o._id} className="border-b border-white/5">
                      <td className="py-2 pr-2 text-neutral-400">{formatTime(o.createdAt)}</td>
                      <td className="py-2 pr-2 font-semibold text-white">#{o.orderNumber}</td>
                      <td className="py-2 pr-2 text-neutral-400">
                        {PAYMENT_METHODS.find((p) => p.value === o.paymentMethod)?.label ?? o.paymentMethod}
                      </td>
                      <td className="py-2 text-right font-bold text-white">{formatPrice(o.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={3} className="py-2 font-bold text-white">Total</td>
                  <td className="py-2 text-right font-black text-primary">{formatPrice(totalPago)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </AdminCard>

      {loading && <p className="text-center text-xs text-neutral-500">Cargando métricas...</p>}
    </div>
  );
}