'use client';

import { useState } from 'react';
import {
  Banknote, ChevronDown, Image as ImageIcon, Images, Landmark, PackageCheck, Pencil, Plus, Power, Printer, RefreshCw, Star, Trash2, Wallet,
} from 'lucide-react';
import { GalleryTab } from './GalleryTab';
import { AdminActionButtons, AdminCard, AdminInput, AdminProductRow, AdminSelect, AdminTextarea, Badge, IconPickerModal, UrlSaveInput, cn } from '@saas/ui';
import {
  useAdminConfig, useAdminCoupons, useAdminMenu, useAdminOrders, useAdminOverview, useSiteConfig,
} from '@saas/hooks';
import type { AdminRange, OverviewRange } from '@saas/hooks';
import { CATEGORY_ICON_OPTIONS, ORDER_STATUS_TRANSITIONS, ORDER_STATUSES, formatOrderNumber, formatPrice, formatTime, getCategoryIcon } from '@saas/utils';
import type { Addon, Order, OrderStatus } from '@saas/types';

/** Opciones de rango de fechas básicas (métricas y pedidos) */
const RANGES: { value: string; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

/**
 * Badge de estado. Sin `onClick` es solo lectura (uso en KPI); con `onClick`
 * abre el selector de estados del pedido.
 */
function statusBadge(status: OrderStatus, onClick?: () => void, expanded?: boolean) {
  const meta = ORDER_STATUSES.find((s) => s.value === status);
  const variant =
    status === 'cancelled' ? 'destructive'
      : status === 'delivered' ? 'success'
        : status === 'pending' ? 'outline'
          : 'secondary';
  const badge = <Badge variant={variant}>{meta?.label ?? status}</Badge>;

  if (!onClick) return badge;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={`Estado del pedido: ${meta?.label ?? status}. Cambiar estado`}
      title="Cambiar estado"
      className="inline-flex items-center gap-1 rounded-full transition hover:opacity-80 active:scale-95"
    >
      {badge}
      <ChevronDown size={13} className={cn('text-white/50 transition-transform', expanded && 'rotate-180')} />
    </button>
  );
}

const statusColor: Record<OrderStatus, string> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.color])
) as Record<OrderStatus, string>;

/**
 * Panel de administración nivel basic: página única apilada (sin tabs).
 * Orden: apertura/cierre → métricas → pedidos → categorías → productos →
 * adicionales → cupones → banner.
 */
export function BasicSections() {
  const cfg = useSiteConfig();

  const overview = useAdminOverview();
  const orders = useAdminOrders();
  const coupons = useAdminCoupons();
  const menu = useAdminMenu();
  const config = useAdminConfig();

  // Formulario de categorías (sin toggle, backend no lo expone)
  const {
    form: categoryForm, setForm: setCategoryForm, editId: categoryEditId,
    err: categoryErr, save: saveCategory, edit: editCategory, remove: removeCategory,
  } = menu.categories;

  // Formulario de productos
  const {
    form: productForm, setForm: setProductForm, editId: productEditId,
    err: productErr, save: saveProduct, edit: editProduct,
    remove: removeProduct, toggle: toggleProduct, cancel: cancelProduct,
  } = menu.products;

  // Formulario de adicionales
  const {
    form: addonForm, setForm: setAddonForm, editId: addonEditId,
    err: addonErr, save: saveAddon, edit: editAddon,
    remove: removeAddon, toggle: toggleAddon, cancel: cancelAddon,
  } = menu.addons;

  const [categoryFilter, setCategoryFilter] = useState('all');
  /** Modal de selección de ícono de categoría */
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  /** Ícono que se ve en el botón, ya resuelto por nombre o por el elegido */
  const CategoryIcon = getCategoryIcon(
    String(categoryForm.name ?? ''),
    categoryForm.icon as string | undefined
  );
  /** Pedido cuyo selector de estados está abierto (clic en el badge) */
  const [statusPickerId, setStatusPickerId] = useState<string | null>(null);
  /** Pedido cuyo estado se está guardando (para deshabilitar solo ese pedido) */
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const changeOrderStatus = (id: string, next: OrderStatus) => {
    setUpdatingOrderId(id);
    void orders
      .updateStatus(id, next)
      .then(() => {
        // El panel queda abierto para poder encadenar estados; solo los
        // próximos válidos quedan habilitados en la secuencia.
        overview.reload();
      })
      .catch(() => undefined)
      .finally(() => setUpdatingOrderId(null));
  };

  const categoryOptions = menu.items.categories.map((c) => ({ value: c._id, label: c.name }));
  const visibleProducts = menu.items.products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );

  const toggleAddonCategory = (categoryId: string) => {
    const current = (addonForm.categories as string[]) ?? [];
    setAddonForm({
      ...addonForm,
      categories: current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    });
  };

  const kpis = overview.stats
    ? [
        { label: 'Ventas totales', value: formatPrice(overview.stats.totalRevenue), Icon: Wallet },
        { label: 'Efectivo', value: formatPrice(overview.stats.byPaymentMethod.cash), Icon: Banknote },
        { label: 'Transferencia', value: formatPrice(overview.stats.byPaymentMethod.transferencia), Icon: Landmark },
        { label: 'Entregados', value: String(overview.stats.delivered), Icon: PackageCheck },
        { label: 'Producto estrella', value: overview.stats.topProducts[0]?.title ?? '—', Icon: Star },
      ]
    : [];

  return (
    <>
      {/* Apertura / cierre del local */}
      <section>
        <AdminCard variant="inner" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Power size={16} className={config.config?.emergencyClosed ? 'text-red-400' : 'text-emerald-400'} />
            <div className="leading-tight">
              <p className="text-sm font-bold">Apertura del local</p>
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

      {/* Métricas */}
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

      {/* Pedidos */}
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
              onClick={() => {
                orders.reload();
                overview.reload();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
              aria-label="Refrescar pedidos"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['pending', 'confirmed', 'preparing', 'ready', 'delivered'] as OrderStatus[]).map((s) => {
            const meta = ORDER_STATUSES.find((m) => m.value === s);
            const count = orders.allOrders.filter((o) => o.status === s).length;
            return (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor[s] }} />
                {meta?.label} · {count}
              </span>
            );
          })}
        </div>

        {orders.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400">
            {orders.error}
          </p>
        )}

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
                  {statusBadge(
                    o.status,
                    () => setStatusPickerId(statusPickerId === o._id ? null : o._id),
                    statusPickerId === o._id
                  )}
                  <button
                    onClick={() => orders.printComanda(o, cfg.name)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
                    title="Imprimir comanda"
                  >
                    <Printer size={14} />
                  </button>
                </div>

                {/* Selector de estados (se abre al hacer clic en el badge, no se cierra al cambiar) */}
                {statusPickerId === o._id && (
                  <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-white/5 pt-2">
                    {ORDER_STATUSES.map(({ value, label }) => {
                      const isCurrent = value === o.status;
                      const isNext = (ORDER_STATUS_TRANSITIONS[o.status] ?? []).includes(value);
                      const color = statusColor[value];
                      const busy = updatingOrderId === o._id;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={isCurrent || !isNext || busy}
                          onClick={() => changeOrderStatus(o._id, value)}
                          title={
                            isCurrent
                              ? 'Estado actual'
                              : isNext
                                ? 'Siguiente estado válido'
                                : 'No permitido en esta etapa'
                          }
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[11px] font-bold transition active:scale-95',
                            isCurrent
                              ? 'cursor-default bg-white/10'
                              : isNext
                                ? 'hover:bg-white/10'
                                : 'cursor-not-allowed opacity-30'
                          )}
                          style={{ borderColor: `${color}66`, color }}
                          aria-pressed={isCurrent}
                        >
                          {isCurrent ? '✓ ' : '→ '}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </AdminCard>
            ))}
          </div>
        )}
      </section>

      {/* Categorías */}
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
            <div className="w-full sm:w-44">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                Ícono
              </span>
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2.5 text-left text-sm text-white transition-colors hover:border-primary/50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryIcon size={16} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
                  <span className="truncate">{String(categoryForm.icon ?? 'Sin ícono')}</span>
                </span>
                <ChevronDown size={15} className="shrink-0 text-white/40" />
              </button>
            </div>
            <button
              onClick={() => void saveCategory()}
              disabled={String(categoryForm.name ?? '').trim() === ''}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={15} /> {categoryEditId ? 'Guardar' : 'Crear'}
            </button>
          </div>
            {categoryErr && <p className="text-xs text-red-400">{categoryErr}</p>}

            <IconPickerModal
              isOpen={iconPickerOpen}
              onClose={() => setIconPickerOpen(false)}
              onSelect={(iconName) => setCategoryForm({ ...categoryForm, icon: iconName })}
              options={CATEGORY_ICON_OPTIONS}
              selected={String(categoryForm.icon ?? '')}
            />

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

      {/* Productos */}
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
              options={[{ value: '', label: 'Seleccionar categoría...' }, ...categoryOptions]}
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
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* Adicionales */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold">Adicionales</h2>
        <AdminCard className="flex flex-col gap-4">
          {menu.error && <p className="text-xs text-red-400">{menu.error}</p>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminInput
              label="Nombre"
              value={String(addonForm.name ?? '')}
              onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
              placeholder="Ej: Extra queso"
            />
            <AdminInput
              label="Precio"
              type="number"
              min={0}
              value={String(addonForm.price ?? 0)}
              onChange={(e) => setAddonForm({ ...addonForm, price: Number(e.target.value) })}
            />
          </div>

          {/* Categorías donde aplica */}
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-white/40">
              Categorías donde aplica
            </p>
            <div className="flex flex-wrap gap-1.5">
              {menu.items.categories.length === 0 ? (
                <p className="text-xs text-white/40">Creá categorías para poder asociar adicionales.</p>
              ) : (
                menu.items.categories.map((c) => {
                  const selected = ((addonForm.categories as string[]) ?? []).includes(c._id);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => toggleAddonCategory(c._id)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
                        selected
                          ? 'border-transparent text-on-primary'
                          : 'border-white/10 text-white/50 hover:text-white'
                      )}
                      style={selected ? { backgroundColor: 'var(--color-primary)' } : undefined}
                    >
                      {c.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void saveAddon()}
              disabled={String(addonForm.name ?? '').trim() === ''}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={15} /> {addonEditId ? 'Guardar cambios' : 'Crear adicional'}
            </button>
            {addonEditId && (
              <button
                onClick={cancelAddon}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/60 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
            )}
          </div>
          {addonErr && <p className="text-xs text-red-400">{addonErr}</p>}

          <div className="flex flex-col gap-2">
            {menu.items.addons.length === 0 && !addonEditId ? (
              <p className="text-sm text-white/40">Sin adicionales todavía.</p>
            ) : (
              menu.items.addons.map((a: Addon) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2"
                >
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-[11px] text-white/40">{formatPrice(a.price)}</p>
                  </div>
                  <AdminActionButtons
                    active={a.available}
                    onToggle={() => void toggleAddon?.(a)}
                    onEdit={() => editAddon(a)}
                    onDelete={() => removeAddon(a)}
                  />
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </section>

      {/* Cupones */}
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
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* Banner promocional */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <ImageIcon size={16} className="text-blue-400" /> Banner promocional
        </h2>
        <AdminCard className="flex flex-col gap-3">
          {config.config?.bannerUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={config.config.bannerUrl}
              alt="Banner actual"
              className="max-h-32 w-full rounded-lg object-cover"
            />
          ) : (
            <p className="text-xs text-white/40">Sin banner configurado.</p>
          )}
          <UrlSaveInput
            initial=""
            cta="Actualizar banner"
            placeholder="Pegá la URL de la imagen..."
            onSave={(url) => void config.updateBanner(url)}
          />
        </AdminCard>
      </section>

      {/* Galería de imágenes */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Images size={16} className="text-blue-400" /> Galería
        </h2>
        <AdminCard>
          <GalleryTab />
        </AdminCard>
      </section>
    </>
  );
}