// Tipo de una parada individual
export interface Parada {
  nombre: string;
  lat: number;
  lng: number;
}

// Punto de interés en la ruta (visual only, no animation trigger)
export interface PuntoInteres {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

// Metadata opcional sobre el viaje
export interface MetadataRuta {
  moto?: string;
  fecha?: string;
  distanciaKm?: number;
  duracion?: string;
}

// Estructura completa de una ruta
export interface Ruta {
  slug: string;
  titulo: string;
  subtitulo: string;
  paradas: Parada[];
  puntosInteres?: PuntoInteres[];
  metadata?: MetadataRuta;
  /**
   * Overrides opcionales de SEO. Si están presentes se usan tal cual, en vez
   * del texto que genera features/rutas/lib/seo.ts. Sirven para afinar una
   * ruta puntual sin tocar código.
   */
  seoTitle?: string;
  seoDescription?: string;
}

// Coordenadas como tupla [lat, lng] (formato Leaflet)
export type LatLng = [number, number];
