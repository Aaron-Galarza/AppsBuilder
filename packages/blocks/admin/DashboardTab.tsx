'use client';

import { CookingPot, ScanLine, UtensilsCrossed } from 'lucide-react';
import { useAdminOverview } from '@saas/hooks';
import { AdminCard } from '@saas/ui';
import { formatPrice } from '@saas/utils';
import type { AdminTabId } from './AdminApp';
import { OverviewTab } from './OverviewTab';

export interface DashboardTabProps {
  onGoTo: (tab: AdminTabId) => void;
  stats: ReturnType<typeof useAdminOverview>['stats'];
  loading: boolean;
  ordersCount: number;
  productsCount: number;
  primaryColor?: string;
}

/** Dashboard: accesos rápidos, KPIs y resumen completo de ventas */
export function DashboardTab({
  onGoTo,
  stats,
  loading,
  ordersCount,
  productsCount,
  primaryColor = 'var(--color-primary)',
}: DashboardTabProps) {
  const quickAccess = [
    { label: 'Cocina', desc: 'Pedidos en preparación', Icon: CookingPot, tab: 'kitchen' as AdminTabId },
    { label: 'POS', desc: 'Cargar pedido manual', Icon: ScanLine, tab: 'pos' as AdminTabId },
    { label: 'Menu', desc: 'Editar productos', Icon: UtensilsCrossed, tab: 'menu' as AdminTabId },
  ];

  const kpis = [
    { label: 'Ventas Totales', value: stats ? formatPrice(stats.totalRevenue) : '$0', accent: '#22c55e' },
    { label: 'Pedidos Entregados', value: String(stats?.delivered ?? 0), accent: '#38bdf8' },
    { label: 'Ticket Promedio', value: loading || !stats || !stats.totalOrders ? '$0' : formatPrice(Math.round(stats.totalRevenue / stats.totalOrders)), accent: '#a3e635' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Accesos rápidos */}
      <div className="grid gap-3 sm:grid-cols-3">
        {quickAccess.map((qa) => (
          <button
            key={qa.label}
            onClick={() => onGoTo(qa.tab)}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4 text-left transition hover:border-primary/40 hover:bg-white/5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <qa.Icon size={24} />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">{qa.label}</span>
              <span className="block text-[11px] text-neutral-500">{qa.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <AdminCard key={kpi.label} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500" style={{ color: kpi.accent }}>{kpi.label}</p>
            <p className="mt-1 text-2xl font-black text-white">{kpi.value}</p>
          </AdminCard>
        ))}
      </div>

      {/* Resumen completo */}
      <OverviewTab primaryColor={primaryColor} />
    </div>
  );
}