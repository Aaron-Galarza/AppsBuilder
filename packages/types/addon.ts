import type { Category } from './category';

export interface Addon {
  _id: string;
  name: string;
  price: number;
  available: boolean;
  /**
   * Categorías de menú donde aplica el adicional. La API pública las devuelve
   * sin populate, así que llegan como IDs.
   */
  categories: Category[];
}
