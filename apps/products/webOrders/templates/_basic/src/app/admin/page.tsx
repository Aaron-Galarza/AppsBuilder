'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Banknote, Landmark, LogOut, PackageCheck, Pencil, Plus,
  Power, Printer, RefreshCw, Star, Trash2, Wallet,
} from 'lucide-react'
import type { Order, OrderStatus } from '@saas/types'
import {
  useAdminConfig, useAdminCoupons, useAdminMenu, useAdminOrders, useAdminOverview, useAuthStore,
} from '@saas/hooks'
import type { AdminRange, OverviewRange } from '@saas/hooks'
import { AdminCard, AdminInput, AdminProductRow, AdminSelect, AdminTextarea, Badge } from '@saas/ui'
import { CATEGORY_ICON_OPTIONS, ORDER_STATUSES, formatOrderNumber, formatPrice, formatTime } from '@saas/utils'

/** BLOCK: admin — Opciones de rango de fechas (métricas y pedidos) */
const RANGES: { value: string; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
]

/** BLOCK: admin — Íconos disponibles para categorías */
const ICON_OPTIONS = CATEGORY_ICON_OPTIONS.map(({ name }) => ({ value: name, label: name }))

function statusBadge(status: OrderStatus) {
  const meta = ORDER_STATUSES.find((s) => s.value === status)
  const variant =
    status === 'cancelled' ? 'destructive'
      : status === 'delivered' ? 'success'
        : status === 'pending' ? 'outline'
          : 'secondary'
  return <Badge variant={variant}>{meta?.label ?? status}</Badge>
}

const statusColor: Record<OrderStatus, string> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.color])
) as Record<OrderStatus, string>

export default function AdminPage() {
  const router = useRouter()
  const { isLogged, token, user, logout } = useAuthStore()

  const overview = useAdminOverview()
  const orders = useAdminOrders()
  const coupons = useAdminCoupons()
  const menu = useAdminMenu()
  const config = useAdminConfig()

  // BLOCK: admin — Formulario de categorías (sin toggle, backend no lo expone)
  const {
    form: categoryForm, setForm: setCategoryForm, editId: categoryEditId,
    err: categoryErr, save: saveCategory, edit: editCategory, remove: removeCategory,
  } = menu.categories

  // BLOCK: admin — Formulario de productos
  const {
    form: productForm, setForm: setProductForm, editId: productEditId,
    err: productErr, save: saveProduct, edit: editProduct,
    remove: removeProduct, toggle: toggleProduct, cancel: cancelProduct,
  } = menu.products

  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    if (!isLogged || !token) router.replace('/login')
  }, [isLogged, token, router])

  if (!isLogged || !token) return null

  const categoryOptions = menu.items.categories.map((c) => ({ value: c._id, label: c.name }))
  const visibleProducts = menu.items.products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  )

  const kpis = overview.stats
    ? [
        { label: 'Ventas totales', value: formatPrice(overview.stats.totalRevenue), Icon: Wallet },
        { label: 'Efectivo', value: formatPrice(overview.stats.byPaymentMethod.cash), Icon: Banknote },
        { label: 'Transferencia', value: formatPrice(overview.stats.byPaymentMethod.transferencia), Icon: Landmark },
        { label: 'Entregados', value: String(overview.stats.delivered), Icon: PackageCheck },
        { label: 'Producto estrella', value: overview.stats.topProducts[0]?.title ?? '—', Icon: Star },
      ]
    : []

  const userName = user?.name || user?.email?.split('@')[0] || 'Admin'
  const userEmail = user?.email ?? 'admin'
  const initials = userName.charAt(0).toUpperCase()

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <img
              src="INJECT_LOGO_URL"
              alt="INJECT_TENANT_NAME"
              className="h-9 w-9 rounded-full border border-white/10 object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold">INJECT_TENANT_NAME</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Torre de control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-black"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {initials}
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold">{userName}</p>
                <p className="text-[10px] text-white/40">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
        {/* BLOCK: admin — Métricas */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">Métricas</h2>
            <div className="flex items-center gap-2">
              <AdminSelect
                options={RANGES}
                value={overview.range}
                onChange={(e) => overview.setRange(e.target.value as OverviewRange)}
                className="w-32"
              />
              <button
                onClick={overview.reload}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
                aria-label="Refrescar métricas"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {overview.error && <p className="text-xs text-red-400">{overview.error}</p>}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {kpis.map(({ label, value, Icon }) => (
              <AdminCard key={label} className="flex flex-col gap-1.5 p-3">
                <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
                <p className="truncate text-sm font-black">{value}</p>
              </AdminCard>
            ))}
          </div>
        </section>

        {/* BLOCK: admin — Pedidos */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">Pedidos</h2>
            <div className="flex items-center gap-2">
              <AdminSelect
                options={RANGES}
                value={orders.range}
                onChange={(e) => orders.setRange(e.target.value as AdminRange)}
                className="w-32"
              />
              <button
                onClick={orders.reload}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
                aria-label="Refrescar pedidos"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['pending', 'confirmed', 'preparing', 'ready', 'delivered'] as OrderStatus[]).map((s) => {
              const meta = ORDER_STATUSES.find((m) => m.value === s)
              const count = orders.allOrders.filter((o) => o.status === s).length
              return (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor[s] }} />
                  {meta?.label} · {count}
                </span>
              )
            })}
          </div>

          {orders.loading ? (
            <AdminCard>
              <p className="text-sm text-white/40">Cargando pedidos...</p>
            </AdminCard>
          ) : orders.orders.length === 0 ? (
            <AdminCard>
              <p className="text-sm text-white/40">Sin pedidos en este rango.</p>
            </AdminCard>
          ) : (
            <div className="flex flex-col gap-2">
              {orders.orders.map((o: Order) => (
                <AdminCard key={o._id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-sm font-bold text-primary">
                      {formatOrderNumber(o.orderNumber)}
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-semibold">{o.customer.name}</p>
                      <p className="text-[11px] text-white/40">
                        {formatTime(o.createdAt)} · {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">{formatPrice(o.total)}</span>
                    {statusBadge(o.status)}
                    <button
                      onClick={() => orders.printComanda(o, 'INJECT_TENANT_NAME')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
                      title="Imprimir comanda"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </AdminCard>
              ))}
            </div>
          )}
        </section>

        {/* BLOCK: admin — Cupones */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Cupones</h2>
          <AdminCard className="flex flex-col gap-4">
            {coupons.error && <p className="text-xs text-red-400">{coupons.error}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <AdminInput
                label="Código"
                value={coupons.crud.form.code}
                onChange={(e) => coupons.crud.setForm({ ...coupons.crud.form, code: e.target.value })}
                placeholder="SUPER-10"
              />
              <div className="w-full sm:w-28">
                <AdminInput
                  label="%"
                  type="number"
                  min={0}
                  max={100}
                  value={String(coupons.crud.form.discountValue)}
                  onChange={(e) => coupons.crud.setForm({ ...coupons.crud.form, discountValue: Number(e.target.value) })}
                />
              </div>
              <button
                onClick={() => void coupons.crud.save()}
                disabled={!coupons.crud.form.code}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Plus size={15} /> Crear
              </button>
            </div>
            {coupons.crud.err && <p className="text-xs text-red-400">{coupons.crud.err}</p>}

            <div className="flex flex-col gap-2">
              {coupons.coupons.filter((c) => c.active).length === 0 ? (
                <p className="text-xs text-white/40">Sin cupones activos.</p>
              ) : (
                coupons.coupons
                  .filter((c) => c.active)
                  .map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2"
                    >
                      <div className="leading-tight">
                        <p className="font-mono text-sm font-bold text-primary">{c.code}</p>
                        <p className="text-[11px] text-white/40">-{c.discountValue}% · activo</p>
                      </div>
                      <button
                        onClick={() => coupons.crud.remove(c)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-400/80 transition-colors hover:bg-red-500/10"
                        title="Eliminar cupón"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </AdminCard>
        </section>

        {/* BLOCK: admin — Categorías */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Categorías</h2>
          <AdminCard className="flex flex-col gap-4">
            {menu.error && <p className="text-xs text-red-400">{menu.error}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <AdminInput
                  label="Nombre"
                  value={String(categoryForm.name ?? '')}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ej: Pizzas"
                />
              </div>
              <div className="w-full sm:w-40">
                <AdminSelect
                  label="Ícono"
                  options={ICON_OPTIONS}
                  value={String(categoryForm.icon ?? 'utensils')}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                />
              </div>
              <button
                onClick={() => void saveCategory()}
                disabled={String(categoryForm.name ?? '').trim() === ''}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Plus size={15} /> {categoryEditId ? 'Guardar' : 'Crear'}
              </button>
            </div>
            {categoryErr && <p className="text-xs text-red-400">{categoryErr}</p>}

            <div className="flex flex-col gap-2">
              {menu.items.categories.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2"
                >
                  <p className="text-sm font-semibold">{c.name}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editCategory(c)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                      title="Editar categoría"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => removeCategory(c)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-400/80 transition-colors hover:bg-red-500/10"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </section>

        {/* BLOCK: admin — Productos */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Productos</h2>
          <AdminCard className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminInput
                label="Título"
                value={String(productForm.title ?? '')}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                placeholder="Ej: Pizza Muzza"
              />
              <AdminInput
                label="Precio"
                type="number"
                min={0}
                value={String(productForm.price ?? 0)}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
              />
              <AdminSelect
                label="Categoría"
                options={categoryOptions}
                value={String(productForm.category ?? '')}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              />
              <AdminInput
                label="Imagen (URL)"
                value={String(productForm.image ?? '')}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                placeholder="https://..."
              />
              <AdminTextarea
                label="Descripción"
                className="sm:col-span-2"
                value={String(productForm.description ?? '')}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void saveProduct()}
                disabled={String(productForm.title ?? '').trim() === '' || String(productForm.category ?? '').trim() === ''}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Plus size={15} /> {productEditId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              {productEditId && (
                <button
                  onClick={cancelProduct}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/60 transition-colors hover:bg-white/10"
                >
                  Cancelar
                </button>
              )}
            </div>
            {productErr && <p className="text-xs text-red-400">{productErr}</p>}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {visibleProducts.length} productos
                </p>
                <AdminSelect
                  options={[{ value: 'all', label: 'Todas las categorías' }, ...categoryOptions]}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-52"
                />
              </div>
              {visibleProducts.map((p) => (
                <AdminProductRow
                  key={p._id}
                  product={p}
                  onEdit={(product) => editProduct(product)}
                  onDelete={(product) => removeProduct(product)}
                  onToggle={(product) => toggleProduct?.(product)}
                />
              ))}
            </div>
          </AdminCard>
        </section>

        {/* BLOCK: admin — Cierre de emergencia */}
        <section>
          <AdminCard variant="inner" className="flex flex-wrap items-center justify-between gap-3" >
            <div className="flex items-center gap-3">
              <Power size={16} className={config.config?.emergencyClosed ? 'text-red-400' : 'text-white/40'} />
              <div className="leading-tight">
                <p className="text-sm font-bold">Cierre de emergencia</p>
                <p className="text-[11px] text-white/40">
                  {config.config?.emergencyClosed ? 'El negocio está cerrado ahora' : 'El negocio está atendiendo normal'}
                </p>
              </div>
            </div>
            <button
              onClick={() => void config.toggleEmergency()}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-colors ${
                config.config?.emergencyClosed
                  ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <Power size={15} /> {config.config?.emergencyClosed ? 'Reabrir local' : 'Cerrar ahora'}
            </button>
          </AdminCard>
        </section>
      </div>
    </main>
  )
}