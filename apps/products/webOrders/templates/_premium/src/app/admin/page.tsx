'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  LayoutDashboard,
  ChartBar,
  ClipboardList,
  ChefHat,
  ScanLine,
  ShoppingBag,
  Image as ImageIcon,
  Settings,
  CookingPot,
  UtensilsCrossed,
  Receipt,
  Package,
  Plus,
  Minus,
  Trash2,
  Printer,
  RefreshCw,
} from 'lucide-react'
import {
  OverviewTab,
  OrdersTab,
  MenuTab,
  GalleryTab,
  ConfigTab,
  CouponsTab,
  QuickOrderForm,
} from '@saas/blocks/admin'
import { CategoryFilter, SearchBar } from '@saas/blocks/menu'
import { Button, AdminCard, Badge, cn } from '@saas/ui'
import {
  useAuthStore,
  useAdminOverview,
  useAdminOrders,
  useAdminMenu,
  useQuickOrder,
  useMenu,
} from '@saas/hooks'
import { formatPrice, formatTime, ORDER_STATUSES, PAYMENT_METHODS } from '@saas/utils'
import type { Order, OrderStatus, Product } from '@saas/types'

type AdminTab =
  | 'dashboard'
  | 'stats'
  | 'orders'
  | 'kitchen'
  | 'pos'
  | 'menu'
  | 'gallery'
  | 'config'

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'stats', label: 'Estadísticas', icon: <ChartBar className="h-4 w-4" /> },
  { id: 'orders', label: 'Pedidos', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'kitchen', label: 'Cocina', icon: <ChefHat className="h-4 w-4" /> },
  { id: 'pos', label: 'POS', icon: <ScanLine className="h-4 w-4" /> },
  { id: 'menu', label: 'Menu', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'gallery', label: 'Galería', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'config', label: 'Configuración', icon: <Settings className="h-4 w-4" /> },
]

export default function AdminPage() {
  const router = useRouter()
  const { logout, isLogged, token, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  useEffect(() => {
    if (!isLogged && !token) router.replace('/login')
  }, [isLogged, token, router])

  // Los hooks se llaman arriba, antes del guard, para respetar las reglas de hooks
  const overview = useAdminOverview('hoy')
  const orders = useAdminOrders()
  const menu = useAdminMenu()
  const quick = useQuickOrder()

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  if (!isLogged && !token) return null

  const initials = (user?.name ?? 'AD').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F0F0F]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" className="h-7 w-7 rounded object-cover" />
              <span className="font-heading text-sm font-bold tracking-wide text-primary">Admin Panel</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/')}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Ver tienda
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav superior horizontal */}
      <nav className="sticky top-14 z-40 border-b border-white/10 bg-[#0F0F0F]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-1 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-primary text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onGoTo={setActiveTab}
            stats={overview.stats}
            loading={overview.loading}
            ordersCount={orders.allOrders.length}
            productsCount={menu.items.products.length}
          />
        )}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'orders' && <OrdersTab primaryColor="var(--color-primary)" />}
        {activeTab === 'kitchen' && <KitchenTab />}
        {activeTab === 'pos' && <POSTab />}
        {activeTab === 'menu' && <MenuTab primaryColor="var(--color-primary)" />}
        {activeTab === 'gallery' && <GalleryTab />}
        {activeTab === 'config' && (
          <div className="flex flex-col gap-6">
            <ConfigTab primaryColor="var(--color-primary)" />
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Receipt className="h-4 w-4 text-primary" /> Cupones
              </h2>
              <CouponsTab primaryColor="var(--color-primary)" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

/* ------------------------------ DASHBOARD ------------------------------ */

function DashboardTab({
  onGoTo,
  stats,
  loading,
  ordersCount,
  productsCount,
}: {
  onGoTo: (tab: AdminTab) => void
  stats: ReturnType<typeof useAdminOverview>['stats']
  loading: boolean
  ordersCount: number
  productsCount: number
}) {
  const quickAccess = [
    { label: 'Cocina', desc: 'Pedidos en preparación', Icon: CookingPot, tab: 'kitchen' as AdminTab },
    { label: 'POS', desc: 'Cargar pedido manual', Icon: ScanLine, tab: 'pos' as AdminTab },
    { label: 'Menu', desc: 'Editar productos', Icon: UtensilsCrossed, tab: 'menu' as AdminTab },
  ]

  const kpis = [
    { label: 'Ventas Totales', value: stats ? formatPrice(stats.totalRevenue) : '$0', accent: '#22c55e' },
    { label: 'Pedidos Entregados', value: String(stats?.delivered ?? 0), accent: '#38bdf8' },
    { label: 'Ticket Promedio', value: loading || !stats || !stats.totalOrders ? '$0' : formatPrice(Math.round(stats.totalRevenue / stats.totalOrders)), accent: '#a3e635' },
  ]

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
      <OverviewTab primaryColor="var(--color-primary)" />
    </div>
  )
}

/* ------------------------------ ESTADÍSTICAS ------------------------------ */

function StatsTab() {
  const { stats, loading, range, setRange } = useAdminOverview('hoy')
  const { allOrders, reload } = useAdminOrders()
  const [grouped, setGrouped] = useState(true)
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  const delivered = allOrders.filter((o) => o.status === 'delivered')

  const filteredDelivered = useMemo(
    () => (paymentFilter === 'all' ? delivered : delivered.filter((o) => o.paymentMethod === paymentFilter)),
    [delivered, paymentFilter]
  )

  const totalPago = filteredDelivered.reduce((sum, o) => sum + o.total, 0)

  const ranges = [
    { value: 'hoy' as const, label: 'Hoy' },
    { value: 'ayer' as const, label: 'Ayer' },
    { value: 'semana' as const, label: 'Semana' },
    { value: 'mes' as const, label: 'Mes' },
  ]

  const handleExport = () => {
    const rows = [
      ['Fecha/Hora', 'Pedido', 'Pago', 'Total'],
      ...filteredDelivered.map((o) => [
        new Date(o.createdAt).toLocaleString('es-AR'),
        `#${o.orderNumber}`,
        PAYMENT_METHODS.find((p) => p.value === o.paymentMethod)?.label ?? o.paymentMethod,
        formatPrice(o.total),
      ]),
    ]
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pedidos-entregados.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const pm = stats?.byPaymentMethod
  const kpis = [
    { label: 'Pedidos', value: String(stats?.totalOrders ?? 0), accent: '#38bdf8' },
    { label: 'Facturación', value: formatPrice(stats?.totalRevenue ?? 0), accent: '#22c55e' },
    { label: 'Entregados', value: String(stats?.delivered ?? 0), accent: '#a3e635' },
    { label: 'Efectivo', value: formatPrice(pm?.cash ?? 0), accent: '#f59e0b' },
    { label: 'Débito', value: formatPrice(pm?.debito ?? 0), accent: '#f472b6' },
    { label: 'Crédito', value: formatPrice(pm?.credito ?? 0), accent: '#fb923c' },
  ]

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
              className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
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
            <Button size="sm" onClick={handleExport} style={{ backgroundColor: 'var(--color-primary)', color: '#000' }}>Exportar CSV</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
        </div>
      </AdminCard>

      {loading && <p className="text-center text-xs text-neutral-500">Cargando métricas...</p>}
    </div>
  )
}

/* ------------------------------ COCINA ------------------------------ */

function KitchenTab() {
  const { allOrders, loading, updateStatus, printComanda, reload } = useAdminOrders()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    void reload()
  }, [tick, reload])

  const active = allOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready')

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
                    <span className="font-bold text-white">{item.quantity}×</span> {item.product.title}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{formatPrice(order.total)}</span>
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
  )
}

function NextStatusButton({
  order,
  updateStatus,
}: {
  order: Order
  updateStatus: (id: string, status: OrderStatus) => Promise<void>
}) {
  const next: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
  }
  const target = next[order.status]
  const label = ORDER_STATUSES.find((s) => s.value === target)?.label ?? ''
  if (!target) return null
  return (
    <button
      onClick={() => void updateStatus(order._id, target)}
      className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-black transition hover:opacity-90 active:scale-95"
    >
      → {label}
    </button>
  )
}

/* ------------------------------ POS ------------------------------ */

function POSTab() {
  const menu = useAdminMenu()
  const { categories, selectedCategory, selectCategory, searchQuery, setSearch, filteredProducts, loading } = useMenu()
  const quick = useQuickOrder()

  const quickItems = quick.items

  const handleAddToQuick = (product: Product) => quick.addProduct(product)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Panel izquierdo: catálogo */}
      <div className="flex flex-col gap-3">
        <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder="Buscar productos..." />
        <div className="overflow-x-auto">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={(id) => selectCategory(id)} />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product._id}
                onClick={() => handleAddToQuick(product)}
                className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card text-left transition hover:border-primary/40"
              >
                <img src={product.image || ''} alt={product.title} className="h-16 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-white">{product.title}</p>
                  <p className="text-[11px] font-bold text-primary">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel derecho: carrito + quick order */}
      <div className="flex flex-col gap-3">
        <AdminCard className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Package size={15} className="text-primary" /> Carrito
            </h3>
            <button
              onClick={quick.reset}
              className="text-[11px] font-semibold text-neutral-500 underline underline-offset-2 hover:text-white"
            >
              Limpiar
            </button>
          </div>
          {quickItems.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-500">Tocá un producto para agregarlo.</p>
          ) : (
            <ul className="mb-2 flex flex-col gap-1">
              {quickItems.map((item) => (
                <li key={item.product._id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-white">{item.product.title}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => quick.updateQuantity(item.product._id, item.quantity - 1)} className="h-5 w-5 rounded bg-white/10 text-white" aria-label="Restar">
                      <Minus size={11} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <button onClick={() => quick.updateQuantity(item.product._id, item.quantity + 1)} className="h-5 w-5 rounded bg-white/10 text-white" aria-label="Sumar">
                      <Plus size={11} />
                    </button>
                    <button onClick={() => quick.removeProduct(item.product._id)} className="ml-1 text-neutral-500 hover:text-red-400" aria-label="Quitar">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-xs text-neutral-400">Total</span>
            <span className="text-base font-black text-white">{formatPrice(quick.total)}</span>
          </div>
        </AdminCard>

        <QuickOrderForm products={menu.items.products} primaryColor="var(--color-primary)" />
      </div>
    </div>
  )
}
