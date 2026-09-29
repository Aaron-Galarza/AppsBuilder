'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Receipt } from 'lucide-react'
import {
  AddressSimple,
  CheckoutForm,
  CouponSection,
  DeliveryTypeSelector,
  SummarySection,
} from '@saas/blocks/checkout'
import { useCheckout } from '@saas/hooks'

export default function CheckoutPage() {
  // Basic: dirección de texto libre (sin mapa ni cálculo de costo de envío)
  const {
    items,
    deliveryType,
    coupon,
    name, setName, phone, setPhone, notes, setNotes,
    paymentMethod, setPaymentMethod,
    couponCode, couponLoading, couponError, validateCoupon, handleCouponInput,
    submitting, submitError, isConfirmDisabled, handleConfirmOrder,
    total, subtotal, discount, surcharge,
  } = useCheckout(undefined, { requireDeliveryCoordinates: false })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-12 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-heading text-lg font-bold tracking-wide text-foreground">FINALIZAR PEDIDO</h1>
      </div>

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Método de entrega</h2>
        <DeliveryTypeSelector />
      </section>

      {deliveryType === 'delivery' && (
        <section>
          <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Dirección de entrega</h2>
          <AddressSimple placeholder="Tu dirección y referencia..." />
        </section>
      )}

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Tus datos</h2>
        <CheckoutForm name={name} phone={phone} notes={notes} onNameChange={setName} onPhoneChange={setPhone} onNotesChange={setNotes} />
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Método de pago</h2>
        <div className="flex gap-2">
          {(['cash', 'debito', 'credito', 'transferencia'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-bold capitalize transition-all ${paymentMethod === method ? 'bg-primary text-on-primary' : 'bg-muted border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {method === 'cash' ? 'Efectivo' : method}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Cupón (opcional)</h2>
        <CouponSection couponCode={couponCode} couponLoading={couponLoading} couponError={couponError} appliedCoupon={coupon} onInput={handleCouponInput} onApply={validateCoupon} />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Receipt size={16} /> Resumen de pago
        </h2>
        <SummarySection
          items={items}
          subtotal={subtotal}
          discount={discount}
          surcharge={surcharge}
          total={total}
          deliveryType={deliveryType}
          isDeliveryLoading={false}
          deliveryCostNote="El costo del envío lo confirma el negocio por WhatsApp"
        />
      </section>

      {submitError && (
        <p className="rounded-xl bg-red-400/10 px-4 py-2 text-center text-sm text-red-400">{submitError}</p>
      )}

      <section className="mt-2">
        <button
          onClick={handleConfirmOrder}
          disabled={isConfirmDisabled}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-extrabold transition-all duration-300 ${isConfirmDisabled ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'bg-primary text-on-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          {submitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
          {!isConfirmDisabled && <CheckCircle2 size={20} />}
        </button>
      </section>
    </div>
  )
}
