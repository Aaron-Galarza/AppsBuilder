'use client';

import { AdminCard, AdminInput, Button, cn } from '@saas/ui';
import { useQuickOrder } from '@saas/hooks';
import { Product } from '@saas/types';
import { formatPrice } from '@saas/utils';
import { Send, X, Zap } from 'lucide-react';

export interface QuickOrderFormProps {
  /** Catálogo para elegir productos */
  products: Product[];
  primaryColor?: string;
}

const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Retiro' },
  { value: 'delivery', label: 'Envío' },
] as const;

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'transferencia', label: 'Transferencia' },
] as const;

/** Pedido manual tomado por WhatsApp/teléfono: productos + cliente + envío directo */
export function QuickOrderForm({ products, primaryColor = '#111' }: QuickOrderFormProps) {
  const {
    items,
    addProduct,
    updateQuantity,
    removeProduct,
    customer,
    setCustomer,
    notes,
    setNotes,
    total,
    submitting,
    error,
    submitQuickOrder,
    reset,
  } = useQuickOrder();

  const canSubmit =
    items.length > 0 && customer.name.trim().length >= 3 && customer.phone.trim().length >= 6;

  return (
    <AdminCard variant="default" className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Zap size={15} style={{ color: primaryColor }} />
          Pedido manual
        </h3>
        {items.length > 0 && (
          <button
            onClick={reset}
            className="text-[11px] font-semibold text-neutral-500 underline underline-offset-2 hover:text-white"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* Elegir productos */}
      <select
        value=""
        onChange={(e) => {
          const product = products.find((p) => p._id === e.target.value);
          if (product) addProduct(product);
        }}
        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-xs text-white"
        aria-label="Agregar producto al pedido manual"
      >
        <option value="">+ Agregar producto...</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.title} · {formatPrice(p.price)}
          </option>
        ))}
      </select>

      {/* Items elegidos */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.product._id}
              className="flex items-center justify-between gap-2 rounded-lg bg-black/20 px-3 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-xs text-white">{item.product.title}</span>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                  aria-label={`Restar ${item.product.title}`}
                  className="h-6 w-6 rounded bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                >
                  −
                </button>
                <span className="w-5 text-center text-xs font-bold tabular-nums text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  aria-label={`Sumar ${item.product.title}`}
                  className="h-6 w-6 rounded bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                >
                  +
                </button>
                <button
                  onClick={() => removeProduct(item.product._id)}
                  aria-label={`Quitar ${item.product.title}`}
                  className="ml-1 text-neutral-500 transition hover:text-red-400"
                >
                  <X size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Datos del cliente */}
      <div className="grid gap-2 sm:grid-cols-2">
        <AdminInput
          label="Nombre del cliente"
          value={customer.name}
          onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
          placeholder="Juan Pérez"
        />
        <AdminInput
          label="Teléfono"
          value={customer.phone}
          onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
          placeholder="11 5555 5555"
          inputMode="tel"
        />
      </div>

      {/* Tipo de entrega y pago */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Entrega</span>
          <select
            id="qo-delivery-type"
            defaultValue="pickup"
            className="rounded-md border border-white/10 bg-black/30 px-2 py-2 text-xs text-white"
          >
            {DELIVERY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Pago</span>
          <select
            id="qo-payment-method"
            defaultValue="cash"
            className="rounded-md border border-white/10 bg-black/30 px-2 py-2 text-xs text-white"
          >
            {PAYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AdminInput
        label="Nota (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value.slice(0, 60))}
        placeholder="Sin cebolla, entrega en mostrador..."
      />

      {error && <p className="text-xs font-medium text-red-400">{error}</p>}

      {/* Enviar */}
      <Button
        onClick={() => {
          const deliveryEl = document.getElementById('qo-delivery-type') as HTMLSelectElement | null;
          const paymentEl = document.getElementById('qo-payment-method') as HTMLSelectElement | null;
          void submitQuickOrder(
            (deliveryEl?.value as 'pickup' | 'delivery') ?? 'pickup',
            (paymentEl?.value as 'cash') ?? 'cash'
          );
        }}
        disabled={submitting || !canSubmit}
        className={cn('w-full font-bold')}
        style={{ backgroundColor: primaryColor }}
      >
        <Send size={14} />
        {submitting ? 'Enviando...' : `Crear pedido · ${formatPrice(total)}`}
      </Button>
    </AdminCard>
  );
}
