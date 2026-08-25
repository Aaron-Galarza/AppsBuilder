'use client';

import { Addon, CartAddon, CartItem, Coupon, DeliveryType, PaymentMethod, Product } from '@saas/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Recargo del 15% para pagos con crédito (igual que el backend) */
export const CREDIT_SURCHARGE_RATE = 0.15;

const calcItemTotal = (product: Product, quantity: number, addons: CartAddon[]): number =>
  quantity * (product.price + addons.reduce((sum, a) => sum + a.addon.price * a.quantity, 0));

/** Firma única del item: productId__addonId1:qty1,addonId2:qty2 */
function buildCartItemId(productId: string, addons: CartAddon[]): string {
  const addonSig = [...addons]
    .sort((a, b) => a.addon._id.localeCompare(b.addon._id))
    .map((a) => `${a.addon._id}:${a.quantity}`)
    .join(',');
  return `${productId}__${addonSig}`;
}

const areSameAddons = (a: CartAddon[], b: CartAddon[]): boolean => {
  if (a.length !== b.length) return false;
  const sort = (x: CartAddon, y: CartAddon) => x.addon._id.localeCompare(y.addon._id);
  const sortA = [...a].sort(sort);
  const sortB = [...b].sort(sort);
  return sortA.every((x, i) => x.addon._id === sortB[i].addon._id && x.quantity === sortB[i].quantity);
};

export interface DeliveryCoordinates {
  lat: number;
  lng: number;
}

interface CartState {
  items: CartItem[];
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod | null;
  coupon: Coupon | null;
  deliveryAddress: string;
  deliveryCoordinates: DeliveryCoordinates | null;
  distanceKm: number;
  deliveryCost: number;

  addItem: (product: Product, quantity: number, addons?: CartAddon[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemAddon: (cartItemId: string, addon: Addon, delta: number) => void;
  clearCart: () => void;

  setDeliveryType: (type: DeliveryType) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setCoupon: (coupon: Coupon) => void;
  clearCoupon: () => void;
  setDeliveryAddress: (address: string, coordinates: DeliveryCoordinates | null) => void;
  setDeliveryCost: (cost: number, distanceKm: number) => void;
  clearDelivery: () => void;

  getTotals: () => {
    subtotal: number;
    discount: number;
    surcharge: number;
    total: number;
    itemCount: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: 'pickup',
      paymentMethod: null,
      coupon: null,
      deliveryAddress: '',
      deliveryCoordinates: null,
      distanceKm: 0,
      deliveryCost: 0,

      addItem: (product, quantity, addons = []) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.product._id === product._id && areSameAddons(i.addons, addons)
          );
          if (idx >= 0) {
            // Mismo producto + mismos adicionales: fusionar cantidades
            const newItems = [...state.items];
            newItems[idx] = {
              ...newItems[idx],
              quantity: newItems[idx].quantity + quantity,
              itemTotal: calcItemTotal(product, newItems[idx].quantity + quantity, addons),
            };
            return { items: newItems };
          }
          return {
            items: [
              ...state.items,
              {
                product,
                quantity,
                addons,
                itemTotal: calcItemTotal(product, quantity, addons),
                cartItemId: buildCartItemId(product._id, addons),
              },
            ],
          };
        }),

      removeItem: (cartItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.cartItemId !== cartItemId) })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
          }
          return {
            items: state.items.map((i) =>
              i.cartItemId === cartItemId
                ? { ...i, quantity, itemTotal: calcItemTotal(i.product, quantity, i.addons) }
                : i
            ),
          };
        }),

      /**
       * Suma/resta un adicional del item. Si la cantidad > 1 primero "clona" el item
       * en dos de cantidad 1 para no tocar al resto, y luego re-fusiona iguales.
       */
      updateItemAddon: (cartItemId, addon, delta) =>
        set((state) => {
          const index = state.items.findIndex((i) => i.cartItemId === cartItemId);
          if (index < 0) return state;

          const newItems: CartItem[] = [...state.items];
          const item = state.items[index];

          let working: CartItem = JSON.parse(JSON.stringify(item));
          if (item.quantity > 1) {
            working.quantity = 1;
            working.itemTotal = calcItemTotal(working.product, 1, working.addons);

            const leftovers = JSON.parse(JSON.stringify(item)) as CartItem;
            leftovers.quantity = item.quantity - 1;
            leftovers.itemTotal = calcItemTotal(leftovers.product, leftovers.quantity, leftovers.addons);
            newItems.splice(index + 1, 0, leftovers);
          }
          newItems[index] = working;

          const existIdx = working.addons.findIndex((a) => a.addon._id === addon._id);
          if (existIdx >= 0) {
            const nextQty = working.addons[existIdx].quantity + delta;
            if (nextQty <= 0) working.addons.splice(existIdx, 1);
            else working.addons[existIdx] = { ...working.addons[existIdx], quantity: nextQty };
          } else if (delta > 0) {
            working.addons.push({ addon, quantity: delta });
          }

          // Re-fusionar items idénticos (mismo producto + mismos adicionales)
          const merged: CartItem[] = [];
          for (const curr of newItems) {
            curr.itemTotal = calcItemTotal(curr.product, curr.quantity, curr.addons);
            const exist = merged.find(
              (m) => m.product._id === curr.product._id && areSameAddons(m.addons, curr.addons)
            );
            if (exist) {
              exist.quantity += curr.quantity;
              exist.itemTotal += curr.itemTotal;
            } else {
              curr.cartItemId = buildCartItemId(curr.product._id, curr.addons);
              merged.push(curr);
            }
          }
          return { items: merged };
        }),

      clearCart: () => set({ items: [], coupon: null, paymentMethod: null }),
      setDeliveryType: (type) => set({ deliveryType: type }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      setDeliveryAddress: (deliveryAddress, deliveryCoordinates) =>
        set({ deliveryAddress, deliveryCoordinates }),
      setDeliveryCost: (cost, distanceKm) => set({ deliveryCost: cost, distanceKm }),
      clearDelivery: () =>
        set({ deliveryAddress: '', deliveryCoordinates: null, distanceKm: 0, deliveryCost: 0 }),

      getTotals: () => {
        const { items, coupon, deliveryType, deliveryCost, paymentMethod } = get();
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
        const discount = coupon?.active
          ? coupon.discountType === 'percentage'
            ? (subtotal * coupon.discountValue) / 100
            : Math.min(coupon.discountValue, subtotal)
          : 0;
        const baseTotal = subtotal - discount + (deliveryType === 'delivery' ? deliveryCost : 0);
        const surcharge =
          paymentMethod === 'credito' ? Math.round(baseTotal * CREDIT_SURCHARGE_RATE) : 0;
        return { subtotal, discount, surcharge, total: baseTotal + surcharge, itemCount };
      },
    }),
    { name: 'saas-cart-storage', storage: createJSONStorage(() => localStorage) }
  )
);
