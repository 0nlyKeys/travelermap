import { useEffect, useRef, useState, type RefObject } from 'react';
import type * as LeafletType from 'leaflet';
import { useSyncedRef } from './useSyncedRef';
import {
  tileProviders,
  tileUrl,
  TILE_ERROR_THRESHOLD,
} from '@features/mapa/lib/mapTiles';

export interface UseLeafletMapOpts {
  containerRef: RefObject<HTMLDivElement>;
  initialCenter: [number, number];
  initialZoom: number;
  lightMap?: boolean;
  /** Called on map click; receives lat/lng. */
  onClick?: (latlng: { lat: number; lng: number }) => void;
}

export interface LeafletMapHandle {
  L: typeof LeafletType | null;
  map: LeafletType.Map | null;
}

/**
 * Loads Leaflet (browser only), mounts a map in the given container, wires the
 * basemap tile layer, attaches click handler, cleans up on unmount.
 *
 * `L` and `map` are null until init finishes, then both are set in one render.
 *
 * Tile providers come from `lib/mapTiles`. The layer lives in its own effect so
 * that a theme switch — or a provider falling over — just re-runs that effect
 * instead of rebuilding the map. On repeated `tileerror` the hook advances to
 * the next provider in the list, so a dead or unauthorized basemap degrades to
 * the fallback rather than to an empty void.
 */
export function useLeafletMap({
  containerRef,
  initialCenter,
  initialZoom,
  lightMap = false,
  onClick,
}: UseLeafletMapOpts): LeafletMapHandle {
  const [L, setL] = useState<typeof LeafletType | null>(null);
  const [map, setMap] = useState<LeafletType.Map | null>(null);
  const [providerIdx, setProviderIdx] = useState(0);
  const onClickRef = useSyncedRef(onClick);
  const tileLayerRef = useRef<LeafletType.TileLayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let createdMap: LeafletType.Map | null = null;

    (async () => {
      const LL = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      const m = LL.map(containerRef.current, {
        zoomControl: false,
        // Added manually below so the "Leaflet" prefix can be dropped; the
        // control must exist before the tile layer mounts, otherwise the
        // layer's attribution has nowhere to register itself.
        attributionControl: false,
      }).setView(initialCenter, initialZoom);

      LL.control.attribution({ prefix: '', position: 'bottomright' }).addTo(m);

      m.on('click', (e: LeafletType.LeafletMouseEvent) => {
        onClickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      createdMap = m;
      if (!cancelled) {
        setL(LL);
        setMap(m);
      }
    })();

    return () => {
      cancelled = true;
      createdMap?.remove();
    };
    // initial center/zoom only used at mount — intentional [] deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!L || !map) return;

    const isLast = providerIdx >= tileProviders.length - 1;
    const provider = tileProviders[Math.min(providerIdx, tileProviders.length - 1)];

    const layer = L.tileLayer(tileUrl(provider, lightMap), {
      ...provider.options,
      attribution: provider.attribution,
    });

    // Note: this only catches hard failures (network error, 4xx/5xx). A provider
    // that answers 200 with a watermark or a blank image looks healthy to
    // Leaflet — that case is handled up front by the `enabled` gate in mapTiles.
    let errors = 0;
    const onTileError = () => {
      errors += 1;
      if (errors >= TILE_ERROR_THRESHOLD && !isLast) {
        setProviderIdx((i) => i + 1);
      }
    };
    if (!isLast) layer.on('tileerror', onTileError);

    layer.addTo(map);
    tileLayerRef.current = layer;

    return () => {
      layer.off('tileerror', onTileError);
      layer.remove();
      if (tileLayerRef.current === layer) tileLayerRef.current = null;
    };
  }, [lightMap, providerIdx, L, map]);

  return { L, map };
}
