export type DeliveryType = 'pickup' | 'delivery';

export interface DeliveryCoordinates {
  lat: number;
  lng: number;
}

/** Rango de kilómetros con costo fijo de envío */
export interface DeliveryRange {
  _id: string;
  minKm: number;
  maxKm: number;
  cost: number;
}

/** Zona de delivery delimitada por un polígono de coordenadas [lng, lat] */
export interface DeliveryZone {
  _id: string;
  name: string;
  polygon?: Array<[number, number]>;
  cost?: number;
}

/** Resultado de autocompletado de dirección (Mapbox / geocoding) */
export interface AddressResult {
  address: string;
  lat: number;
  lng: number;
  placeName?: string;
}
