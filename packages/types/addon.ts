export interface AddonCategory {
  _id: string;
  name: string;
  active: boolean;
}

export interface Addon {
  _id: string;
  name: string;
  price: number;
  available: boolean;
  categories: AddonCategory[];
}
