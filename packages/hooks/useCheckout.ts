'use client';

import { Coupon } from '@saas/types';
import { useCallback, useMemo, useState } from 'react';
import { apiFetch } from './lib/api';
import { DeliveryCoordinates, useCartStore } from './useCartStore';

interface ConfirmationOrder {
  _id?: string;
  orderNumber?: string | number;
  total: number;
  deliveryType: string;
  paymentMethod: string;
  [key: string]: unknown;
}

const sanitizeText = (value: string): string =>
  value.replace(/<[^>]*>/g, '').replace(/[^\w\sáéíóúñÁÉÍÓÚÑ,.\-#°]/g, '').trim();

/**
 * Flujo completo de checkout.
 * `navigate` permite inyectar el router de la app (next/router, react-router...);
 * por defecto usa window.location.
 */
export function useCheckout(navigate?: (path: string) => void) {
  const goTo = navigate ?? ((path: string) => { window.location.href = path; });

  const items = useCartStore((s) => s.items);
  const deliveryType = useCartStore((s) => s.deliveryType);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const coupon = useCartStore((s) => s.coupon);
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const deliveryCoordinates = useCartStore((s) => s.deliveryCoordinates);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);
  const clearCart = useCartStore((s) => s.clearCart);

  // useMemo para evitar re-renders infinitos: getTotals retorna nuevo objeto cada vez
  const cartGetTotals = useCartStore((s) => s.getTotals);
  const totals = useMemo(() => cartGetTotals(), [cartGetTotals]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleCouponInput = useCallback((value: string) => {
    setCouponCode(value);
    setCouponError(null);
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [unresolvedAddressModal, setUnresolvedAddressModal] = useState(false);

  const validateCouponCode = useCallback(async () => {
    const code = couponCode.trim();
    if (!code) return;

    clearCoupon();
    setCouponError(null);

    try {
      setCouponLoading(true);
      const validated = await apiFetch<Coupon>(
        `/api/coupons/validate/${encodeURIComponent(code)}`,
        {
          method: 'POST',
          body: JSON.stringify({ paymentMethod, deliveryType, subtotal: totals.subtotal }),
        }
      );
      setCoupon(validated);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Cupón inválido');
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, paymentMethod, deliveryType, totals.subtotal, setCoupon, clearCoupon]);

  const buildPayload = useCallback((): Record<string, unknown> => ({
    customer: { name: sanitizeText(name), phone: phone.trim(), address: deliveryAddress || undefined },
    items: items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      addons: item.addons.map((a) => ({ addonId: a.addon._id, quantity: a.quantity })),
    })),
    deliveryType,
    paymentMethod,
    couponCode: coupon?.code ?? undefined,
    notes: notes ? sanitizeText(notes).slice(0, 60) : undefined,
    delivery:
      deliveryType === 'delivery'
        ? { address: deliveryAddress, ...(deliveryCoordinates ?? {}) }
        : undefined,
  }), [name, phone, items, deliveryType, paymentMethod, coupon, notes, deliveryAddress, deliveryCoordinates]);

  const submitOrder = useCallback(
    async (payload: Record<string, unknown>) => {
      setSubmitting(true);
      setSubmitError(null);

      try {
        const order = await apiFetch<ConfirmationOrder>('/api/orders', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        // La pantalla de confirmación lee de acá (sobrevive el clearCart)
        sessionStorage.setItem('order_confirmation', JSON.stringify(order));

        goTo('/order-confirmation');

        // El carrito se limpia después de navegar para no parpadear la UI
        setTimeout(() => clearCart(), 100);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Error al confirmar el pedido');
        setSubmitting(false);
      }
    },
    [goTo, clearCart]
  );

  const handleConfirmOrder = useCallback(async () => {
    setSubmitError(null);

    if (items.length === 0) return setSubmitError('El carrito está vacío');
    if (!name.trim() || name.trim().length < 3) return setSubmitError('Ingresa tu nombre');
    if (!phone.trim() || phone.trim().length < 6) return setSubmitError('Ingresa un teléfono válido');
    if (!paymentMethod) return setSubmitError('Selecciona un método de pago');
    if (deliveryType === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      return setSubmitError('Ingresa una dirección válida');
    }

    // Entrega sin coordenadas resueltas → advertencia antes de enviar
    const hasCoordinates =
      !!deliveryCoordinates &&
      typeof (deliveryCoordinates as DeliveryCoordinates).lat === 'number';

    if (deliveryType === 'delivery' && !hasCoordinates) {
      setUnresolvedAddressModal(true);
      return;
    }

    await submitOrder(buildPayload());
  }, [
    items,
    name,
    phone,
    paymentMethod,
    deliveryType,
    deliveryAddress,
    deliveryCoordinates,
    submitOrder,
    buildPayload,
  ]);

  /** Usuario confirma igual: el costo se coordina por WhatsApp */
  const confirmUnresolvedDelivery = useCallback(async () => {
    setUnresolvedAddressModal(false);
    await submitOrder({ ...buildPayload(), skipDeliveryCost: true });
  }, [submitOrder, buildPayload]);

  const cancelUnresolvedDelivery = useCallback(() => {
    setUnresolvedAddressModal(false);
  }, []);

  const isConfirmDisabled =
    submitting ||
    items.length === 0 ||
    !name.trim() ||
    !phone.trim() ||
    !paymentMethod ||
    (deliveryType === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 5));

  return {
    items,
    deliveryType,
    paymentMethod,
    setPaymentMethod,
    coupon,
    isDeliveryLoading: false,
    name,
    setName,
    phone,
    setPhone,
    notes,
    setNotes,

    couponCode,
    setCouponCode,
    handleCouponInput,
    couponLoading,
    couponError,
    validateCoupon: validateCouponCode,

    submitting,
    submitError,
    isConfirmDisabled,
    handleConfirmOrder,

    unresolvedAddressModal,
    confirmUnresolvedDelivery,
    cancelUnresolvedDelivery,
    deliveryAddress,

    ...totals,
  };
}
