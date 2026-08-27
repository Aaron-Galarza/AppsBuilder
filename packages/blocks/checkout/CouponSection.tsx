'use client';

import { apiFetch, useCartStore } from '@saas/hooks';
import { formatPrice } from '@saas/utils';
import { Coupon } from '@saas/types';
import { Button, Input } from '@saas/ui';
import { CheckCircle2, Tag, XCircle } from 'lucide-react';
import { useState } from 'react';

export interface CouponSectionProps {
  primaryColor?: string;
  couponCode?: string;
  couponLoading?: boolean;
  couponError?: string | null;
  appliedCoupon?: Coupon | null;
  onInput?: (value: string) => void;
  onApply?: () => void;
}

type CouponState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'applied'; message: string }
  | { status: 'error'; message: string };

export function CouponSection({
  primaryColor = '#111',
  couponCode: controlledCode,
  couponLoading: controlledLoading,
  couponError: controlledError,
  appliedCoupon: controlledCoupon,
  onInput,
  onApply,
}: CouponSectionProps) {
  const storeCoupon = useCartStore((s) => s.coupon);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);
  const items = useCartStore((s) => s.items);
  const deliveryType = useCartStore((s) => s.deliveryType);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const getTotals = useCartStore((s) => s.getTotals);

  const isControlled = controlledCode !== undefined || onInput !== undefined;

  const [internalCode, setInternalCode] = useState('');
  const [internalState, setInternalState] = useState<CouponState>({ status: 'idle' });

  const code = isControlled ? controlledCode! : internalCode;
  const loading = isControlled ? controlledLoading ?? false : internalState.status === 'loading';
  const error = isControlled ? controlledError ?? null : internalState.status === 'error' ? internalState.message : null;
  const coupon = isControlled ? controlledCoupon ?? null : storeCoupon;

  const setCode = isControlled ? onInput! : setInternalCode;

  const handleApplyControlled = () => {
    if (onApply) onApply();
  };

  const handleApplyInternal = async () => {
    const trimmed = internalCode.trim().toUpperCase();
    if (!trimmed) return;

    setInternalState({ status: 'loading' });
    try {
      const validated = await apiFetch<Coupon>(
        `/api/coupons/validate/${encodeURIComponent(trimmed)}`,
        {
          method: 'POST',
          body: JSON.stringify({
            paymentMethod,
            deliveryType,
            subtotal: getTotals().subtotal,
          }),
        }
      );
      setCoupon(validated);
      setInternalState({ status: 'applied', message: `Cupón ${trimmed} aplicado` });
    } catch (err) {
      setInternalState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Cupón inválido',
      });
    }
  };

  const handleApply = isControlled ? handleApplyControlled : handleApplyInternal;

  const handleRemove = () => {
    clearCoupon();
    setCode('');
    if (!isControlled) setInternalState({ status: 'idle' });
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700">
          <CheckCircle2 size={15} />
          {coupon.code} ·{' '}
          {coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% OFF`
            : `${formatPrice(coupon.discountValue)} OFF`}
        </span>
        <button
          onClick={handleRemove}
          className="text-xs font-medium text-green-700 underline underline-offset-2"
        >
          Quitar
        </button>
      </div>
    );
  }

  const displayStatus = isControlled
    ? (controlledLoading ? 'loading' : controlledError ? 'error' : 'idle')
    : internalState.status;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Código de cupón"
            aria-label="Código de cupón"
            className="pl-9"
            disabled={items.length === 0}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || loading || items.length === 0}
          size="default"
          className="shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          Aplicar
        </Button>
      </div>

      {displayStatus === 'error' && (controlledError || (!isControlled && internalState.status === 'error')) && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
          <XCircle size={13} />
          {controlledError || (!isControlled && internalState.status === 'error' ? internalState.message : '')}
        </p>
      )}
      {displayStatus === 'applied' && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
          <CheckCircle2 size={13} />
          {!isControlled && internalState.status === 'applied' ? internalState.message : 'Cupón aplicado'}
        </p>
      )}
    </div>
  );
}
