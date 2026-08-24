import { Product } from './product';
import { Addon } from './addon';

/** Adicional seleccionado con su cantidad dentro del item del carrito */
export interface CartAddon {
  addon: Addon;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addons: CartAddon[];
  /** Precio de (producto + adicionales) * cantidad */
  itemTotal: number;
  /** Firma única del item: productId__addonId1:qty1,addonId2:qty2 */
  cartItemId: string;
}
