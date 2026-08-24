export interface Category {
  _id: string;
  name: string;
  /** Nombre del ícono Lucide guardado en DB (ej: "Pizza") */
  icon?: string;
  active: boolean;
  order: number;
}
