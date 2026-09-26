/**
 * Basemap tile providers — single source of truth.
 *
 * Swapping provider = editing this file only. `useLeafletMap` walks the list in
 * order and falls through to the next entry when a layer fails to load tiles.
 *
 * Why this exists: CARTO made API keys mandatory for raster basemaps on
 * 2026-09-23. Keyless requests still answer HTTP 200 but every tile is the same
 * "API KEY REQUIRED" watermark image, so Leaflet has no way to detect it — the
 * map just looks broken. Hence the `enabled` gate: a provider whose credentials
 * are missing is dropped before it is ever mounted, rather than mounted and
 * hoped for.
 */

export interface TileProvider {
  /** Stable identifier, handy for logs. */
  id: string;
  /** Tile URL template for the dark theme. */
  dark: string;
  /** Tile URL template for the light theme. */
  light: string;
  /** Attribution HTML the provider's terms require. Rendered in the map corner. */
  attribution: string;
  /** Extra options forwarded to `L.tileLayer`. */
  options: {
    maxZoom: number;
    /** Highest zoom the provider actually serves; Leaflet upscales past it. */
    maxNativeZoom?: number;
    subdomains?: string;
  };
  /**
   * False when required credentials are absent — the provider is skipped
   * entirely instead of rendering a watermark or a wall of 401s.
   */
  enabled: boolean;
}

/**
 * Read at module scope so Next.js can inline it into the client bundle.
 * NEXT_PUBLIC_ means "shipped to the browser" — this key is not a secret, it is
 * a quota identifier, and CARTO expects it in the tile URL.
 */
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY ?? '';

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';

const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors';

/**
 * Ordered by preference. First `enabled` entry wins; the rest are fallbacks.
 *
 * CARTO Dark Matter (`dark_nolabels`) is the look the UI was designed around.
 * Esri Gray Canvas is the keyless safety net — visually close enough (flat
 * neutral grays, no labels competing with the route) and needs no signup, so
 * a deploy that forgot the env var still shows a real map.
 */
const PROVIDERS: TileProvider[] = [
  {
    id: 'carto',
    dark: `https://basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    light: `https://basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    attribution: CARTO_ATTRIBUTION,
    options: { maxZoom: 19 },
    enabled: CARTO_KEY.length > 0,
  },
  {
    id: 'esri',
    // Esri's REST tile scheme is /{z}/{y}/{x} — row before column, the reverse
    // of the XYZ convention. Getting this backwards yields a mirrored world.
    dark: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    light:
      'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: ESRI_ATTRIBUTION,
    options: { maxZoom: 19, maxNativeZoom: 16 },
    enabled: true,
  },
];

/** Providers usable in this environment, in fallback order. Never empty. */
export const tileProviders: TileProvider[] = PROVIDERS.filter((p) => p.enabled);

/** Consecutive `tileerror` events before giving up on a provider. */
export const TILE_ERROR_THRESHOLD = 4;

/** Picks the URL template matching the active theme. */
export function tileUrl(provider: TileProvider, lightMap: boolean): string {
  return lightMap ? provider.light : provider.dark;
}
