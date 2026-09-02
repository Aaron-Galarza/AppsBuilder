'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Receipt } from 'lucide-react'
import {
  AddressAutocomplete,
  CheckoutForm,
  CouponSection,
  DeliveryAddressWarningModal,
  DeliveryTypeSelector,
  SummarySection,
} from '@saas/blocks/checkout'
import { useCartStore, useCheckout, useDelivery } from '@saas/hooks'
import type { AddressResult } from '@saas/types'

export default function CheckoutPage() {
  useDelivery()

  const {
    items,
    deliveryType,
    coupon,
    name, setName, phone, setPhone, notes, setNotes,
    paymentMethod, setPaymentMethod,
    couponCode, couponLoading, couponError, validateCoupon, handleCouponInput,
    submitting, submitError, isConfirmDisabled, handleConfirmOrder,
    unresolvedAddressModal, confirmUnresolvedDelivery, cancelUnresolvedDelivery, deliveryAddress,
    total, subtotal, discount, surcharge,
  } = useCheckout()

  const deliveryCoordinates = useCartStore((s) => s.deliveryCoordinates)
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress)
  const clearDelivery = useCartStore((s) => s.clearDelivery)

  const addressValue: AddressResult | null =
    deliveryType === 'delivery' && deliveryAddress && deliveryCoordinates
      ? { address: deliveryAddress, lat: deliveryCoordinates.lat, lng: deliveryCoordinates.lng }
      : null

  const handleAddressChange = (result: AddressResult | null) => {
    if (result) setDeliveryAddress(result.address, { lat: result.lat, lng: result.lng })
    else clearDelivery()
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-12 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/90 transition-colors hover:bg-white/10"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-heading text-lg font-bold tracking-wide text-white">FINALIZAR PEDIDO</h1>
      </div>

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-white/50">Método de entrega</h2>
        <DeliveryTypeSelector />
      </section>

      {deliveryType === 'delivery' && (
        <section>
          <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-white/50">Dirección de entrega</h2>
          <AddressAutocomplete
            value={addressValue}
            onChange={handleAddressChange}
            onClear={clearDelivery}
            placeholder="Tu dirección..."
          />
        </section>
      )}

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-white/50">Tus datos</h2>
        <CheckoutForm name={name} phone={phone} notes={notes} onNameChange={setName} onPhoneChange={setPhone} onNotesChange={setNotes} />
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-white/50">Método de pago</h2>
        <div className="flex gap-2">
          {(['cash', 'debito', 'credito', 'transferencia'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-bold capitalize transition-all ${paymentMethod === method ? 'bg-primary text-black' : 'bg-muted border border-white/10 text-white/60 hover:text-white'}`}
            >
              {method === 'cash' ? 'Efectivo' : method}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-white/50">Cupón (opcional)</h2>
        <CouponSection couponCode={couponCode} couponLoading={couponLoading} couponError={couponError} appliedCoupon={coupon} onInput={handleCouponInput} onApply={validateCoupon} />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-white/50">
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
        />
      </section>

      {submitError && (
        <p className="rounded-xl bg-red-400/10 px-4 py-2 text-center text-sm text-red-400">{submitError}</p>
      )}

      <section className="mt-2">
        <button
          onClick={handleConfirmOrder}
          disabled={isConfirmDisabled}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-extrabold transition-all duration-300 ${isConfirmDisabled ? 'cursor-not-allowed bg-zinc-800 text-white/30' : 'bg-primary text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          {submitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
          {!isConfirmDisabled && <CheckCircle2 size={20} />}
        </button>
      </section>

      <DeliveryAddressWarningModal
        isOpen={unresolvedAddressModal}
        addressText={deliveryAddress}
        onConfirm={confirmUnresolvedDelivery}
        onCancel={cancelUnresolvedDelivery}
      />
    </div>
  )
}