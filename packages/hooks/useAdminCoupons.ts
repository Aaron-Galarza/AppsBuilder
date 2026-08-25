'use client';

import { Coupon } from '@saas/types';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAdminCrud } from './useAdminCrud';
import { useAuthStore } from './useAuthStore';

export interface CouponForm {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
}

/** ABM de cupones del admin */
export function useAdminCoupons() {
  const token = useAuthStore((s) => s.token);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Coupon[]>('/api/coupons/admin', { headers: authHeaders(token) });
      setCoupons(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los cupones');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const crud = useAdminCrud<CouponForm, Coupon>({
    blank: () => ({ code: '', discountType: 'percentage', discountValue: 10, active: true }),
    fromItem: (c) => ({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      active: c.active,
    }),
    toPayload: (form) => ({ ...form, code: form.code.trim().toUpperCase() }),
    create: async (form) => {
      await apiFetch('/api/coupons/admin', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    update: async (id, form) => {
      await apiFetch(`/api/coupons/admin/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });
    },
    toggle: async (id) => {
      await apiFetch(`/api/coupons/admin/${id}/toggle`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
    },
    remove: async (id) => {
      await apiFetch(`/api/coupons/admin/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
    },
    reload,
  });

  return { coupons, loading, error, reload, crud };
}
