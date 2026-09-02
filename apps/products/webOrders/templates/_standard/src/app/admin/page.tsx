'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3, CalendarDays, Clock, LogOut, Pencil, Plus, Power,
  ShoppingBag, Trash2, Utensils, Settings,
} from 'lucide-react'
import {
  useAdminConfig, useAdminCoupons, useAdminMenu, useAdminOrders,
  useAdminOverview, useAuthStore,
} from '@saas/hooks'
import { OverviewTab, OrdersTab } from '@saas/blocks/admin'
import { AdminCard, AdminInput, AdminProductRow, AdminSelect, AdminTextarea } from '@saas/ui'
import { CATEGORY_ICON_OPTIONS } from '@saas/utils'
import type { DaySchedule, Schedule } from '@saas/types'

type Tab = 'overview' | 'orders' | 'menu' | 'config'

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'menu', label: 'Menú', icon: Utensils },
  { id: 'config', label: 'Configuración', icon: Settings },
]

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

const ICON_OPTIONS = CATEGORY_ICON_OPTIONS.map(({ name }) => ({ value: name, label: name }))

export default function AdminPage() {
  const router = useRouter()
  const { isLogged, token, user, logout } = useAuthStore()

  const menu = useAdminMenu()
  const coupons = useAdminCoupons()
  const config = useAdminConfig()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [scheduleDraft, setScheduleDraft] = useState<Schedule | null>(null)

  const categoryCrud = menu.categories
  const productCrud = menu.products

  useEffect(() => {
    if (config.config && !scheduleDraft) setScheduleDraft(config.config.schedule)
  }, [config.config, scheduleDraft])

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as Tab
      if (tabs.some((t) => t.id === hash)) setActiveTab(hash)
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    if (!isLogged || !token) router.replace('/login')
  }, [isLogged, token, router])

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  if (!isLogged || !token) return null

  const categoryOptions = menu.items.categories.map((c) => ({ value: c._id, label: c.name }))
  const visibleProducts = menu.items.products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  )

  const userName = user?.name || user?.email?.split('@')[0] || 'Admin'
  const userEmail = user?.email ?? 'admin'
  const initials = userName.charAt(0).toUpperCase()

  const sortedDays = scheduleDraft
    ? [...scheduleDraft.days].sort(
        (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      )
    : []

  const handleSaveSchedule = () => {
    if (scheduleDraft) void config.updateSchedule(scheduleDraft)
  }

  const setDay = (next: DaySchedule) => {
    if (!scheduleDraft) return
    const days = scheduleDraft.days.map((d) => (d.day === next.day ? next : d))
    setScheduleDraft({ ...scheduleDraft, days })
  }

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
              <p className="text-[10px] uppercase tracking-widest text-white/40">Panel Admin</p>
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

      <div className="sticky top-16 z-30 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-lg overflow-x-auto">
        <div className="mx-auto flex w-full max-w-7xl gap-1 px-4 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
        {activeTab === 'overview' && <OverviewTab />}

        {activeTab === 'orders' && <OrdersTab />}

        {activeTab === 'menu' && (
          <>
            {/* Categorías */}
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <CalendarDays size={16} style={{ color: 'var(--color-primary)' }} /> Categorías
              </h2>
              <AdminCard className="flex flex-col gap-4">
                {menu.error && <p className="text-xs text-red-400">{menu.error}</p>}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <AdminInput
                      label="Nombre"
                      value={String(categoryCrud.form.name ?? '')}
                      onChange={(e) => categoryCrud.setForm({ ...categoryCrud.form, name: e.target.value })}
                      placeholder="Ej: Pizzas"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <AdminSelect
                      label="Ícono"
                      options={ICON_OPTIONS}
                      value={String(categoryCrud.form.icon ?? 'utensils')}
                      onChange={(e) => categoryCrud.setForm({ ...categoryCrud.form, icon: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={() => void categoryCrud.save()}
                    disabled={String(categoryCrud.form.name ?? '').trim() === ''}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus size={15} /> {categoryCrud.editId ? 'Guardar' : 'Crear'}
                  </button>
                </div>
                {categoryCrud.err && <p className="text-xs text-red-400">{categoryCrud.err}</p>}

                <div className="flex flex-col gap-2">
                  {menu.items.categories.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2"
                    >
                      <p className="text-sm font-semibold">{c.name}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => categoryCrud.edit(c)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                          title="Editar categoría"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => categoryCrud.remove(c)}
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

            {/* Productos */}
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Utensils size={16} style={{ color: 'var(--color-primary)' }} /> Productos
              </h2>
              <AdminCard className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AdminInput
                    label="Título"
                    value={String(productCrud.form.title ?? '')}
                    onChange={(e) => productCrud.setForm({ ...productCrud.form, title: e.target.value })}
                    placeholder="Ej: Pizza Muzza"
                  />
                  <AdminInput
                    label="Precio"
                    type="number"
                    min={0}
                    value={String(productCrud.form.price ?? 0)}
                    onChange={(e) => productCrud.setForm({ ...productCrud.form, price: Number(e.target.value) })}
                  />
                  <AdminSelect
                    label="Categoría"
                    options={categoryOptions}
                    value={String(productCrud.form.category ?? '')}
                    onChange={(e) => productCrud.setForm({ ...productCrud.form, category: e.target.value })}
                  />
                  <AdminInput
                    label="Imagen (URL)"
                    value={String(productCrud.form.image ?? '')}
                    onChange={(e) => productCrud.setForm({ ...productCrud.form, image: e.target.value })}
                    placeholder="https://..."
                  />
                  <AdminTextarea
                    label="Descripción"
                    className="sm:col-span-2"
                    value={String(productCrud.form.description ?? '')}
                    onChange={(e) => productCrud.setForm({ ...productCrud.form, description: e.target.value })}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => void productCrud.save()}
                    disabled={String(productCrud.form.title ?? '').trim() === '' || String(productCrud.form.category ?? '').trim() === ''}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus size={15} /> {productCrud.editId ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                  {productCrud.editId && (
                    <button
                      onClick={productCrud.cancel}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/60 transition-colors hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
                {productCrud.err && <p className="text-xs text-red-400">{productCrud.err}</p>}

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
                      onEdit={(product) => productCrud.edit(product)}
                      onDelete={(product) => productCrud.remove(product)}
                      onToggle={(product) => productCrud.toggle?.(product)}
                    />
                  ))}
                </div>
              </AdminCard>
            </section>
          </>
        )}

        {activeTab === 'config' && (
          <>
            {/* Horarios */}
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Clock size={16} style={{ color: 'var(--color-primary)' }} /> Horarios de atención
              </h2>
              <AdminCard className="flex flex-col gap-3 p-4">
                {!scheduleDraft ? (
                  <p className="text-xs text-white/40">Cargando horarios...</p>
                ) : (
                  sortedDays.map((day) => (
                    <div key={day.day} className="flex items-center gap-2" style={{ opacity: day.closed ? 0.5 : 1 }}>
                      <label className="flex w-24 shrink-0 items-center gap-2 text-xs font-semibold text-white">
                        <input
                          type="checkbox"
                          checked={!day.closed}
                          onChange={(e) => setDay({ ...day, closed: !e.target.checked })}
                          className="accent-white"
                          aria-label={`Abre ${DAY_LABELS[day.day] ?? day.day}`}
                        />
                        {DAY_LABELS[day.day] ?? day.day}
                      </label>
                      <input
                        type="time"
                        value={day.openTime}
                        disabled={day.closed}
                        onChange={(e) => setDay({ ...day, openTime: e.target.value })}
                        className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:opacity-40"
                        aria-label={`Apertura ${DAY_LABELS[day.day]}`}
                      />
                      <span className="text-xs text-neutral-600">–</span>
                      <input
                        type="time"
                        value={day.closeTime}
                        disabled={day.closed}
                        onChange={(e) => setDay({ ...day, closeTime: e.target.value })}
                        className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:opacity-40"
                        aria-label={`Cierre ${DAY_LABELS[day.day]}`}
                      />
                    </div>
                  ))
                )}
                <button
                  onClick={handleSaveSchedule}
                  disabled={!scheduleDraft}
                  className="inline-flex h-10 w-fit items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Guardar horarios
                </button>
              </AdminCard>
            </section>

            {/* Cupones */}
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} /> Cupones
              </h2>
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

            {/* Cierre de emergencia */}
            <section>
              <AdminCard variant="inner" className="flex flex-wrap items-center justify-between gap-3">
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
          </>
        )}
      </div>
    </main>
  )
}
