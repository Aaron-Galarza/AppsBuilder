'use client';

import { AdminActionButtons, AdminCard, AdminInput, AdminSelect, cn } from '@saas/ui';
import { useAdminCoupons, CouponForm, UseAdminCrudReturn } from '@saas/hooks';
import { Coupon } from '@saas/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export interface CouponsTabProps {
  primaryColor?: string;
}

/** CRUD de cupones: código, tipo percentage/fixed y valor */
export function CouponsTab({ primaryColor = '#111' }: CouponsTabProps) {
  const { coupons, loading, error, crud } = useAdminCoupons();
  const [formOpen, setFormOpen] = useState(false);

  const { form, setForm, editId, err, save, edit, remove, cancel } =
    crud as UseAdminCrudReturn<CouponForm, Coupon>;

  const openNew = () => {
    cancel();
    setFormOpen(true);
  };

  const handleSave = async () => {
    await save();
    setFormOpen(false);
  };

  const showForm = formOpen || editId !== null;

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-xs font-medium text-red-400">{error}</p>}
      {loading && <p className="text-xs text-neutral-500">Cargando...</p>}

      {/* Form */}
      {showForm && (
        <AdminCard variant="default" className="flex flex-col gap-3 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            {editId !== null ? `Editando ${String(form.code)}` : 'Nuevo cupón'}
          </h4>

          <AdminInput
            label="Código"
            value={String(form.code ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            error={err ?? undefined}
            placeholder="BURGER20"
          />

          <div className="grid grid-cols-2 gap-2">
            <AdminSelect
              label="Tipo"
              value={form.discountType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  discountType: e.target.value as CouponForm['discountType'],
                }))
              }
              options={[
                { value: 'percentage', label: '% Porcentaje' },
                { value: 'fixed', label: '$ Monto fijo' },
              ]}
            />
            <AdminInput
              label={form.discountType === 'percentage' ? 'Porcentaje (0-100)' : 'Monto en $'}
              type="number"
              value={Number(form.discountValue ?? 0)}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-md py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              Guardar
            </button>
            <button
              onClick={() => {
                cancel();
                setFormOpen(false);
              }}
              className="rounded-md border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </AdminCard>
      )}

      {/* Lista */}
      <ul className="flex flex-col gap-2">
        {(coupons ?? []).map((coupon) => (
          <li key={coupon._id}>
            <AdminCard variant="inner" className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-white">{coupon.code}</p>
                <p className="text-[11px] text-neutral-500">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `$${coupon.discountValue} OFF`}
                </p>
              </div>
              <AdminActionButtons
                active={coupon.active}
                onToggle={() => undefined}
                onEdit={() => {
                  edit(coupon);
                  setFormOpen(false);
                }}
                onDelete={() => remove(coupon)}
              />
            </AdminCard>
          </li>
        ))}
        {(coupons ?? []).length === 0 && !loading && !showForm && (
          <p className="py-6 text-center text-xs text-neutral-500">No hay cupones aún.</p>
        )}
      </ul>

      {!showForm && !loading && (
        <button
          onClick={openNew}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 self-start rounded-full px-4 py-2 text-xs font-bold text-white transition active:scale-95'
          )}
          style={{ backgroundColor: primaryColor }}
        >
          <Plus size={14} />
          Nuevo cupón
        </button>
      )}
    </div>
  );
}
