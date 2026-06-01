import { useEffect, useRef, useState, type RefObject } from 'react';
import type * as LeafletType from 'leaflet';
import { useSyncedRef } from './useSyncedRef';

const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

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
 * dark CartoDB tile layer, attaches click handler, cleans up on unmount.
 *
 * `L` and `map` are null until init finishes, then both are set in one render.
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
        attributionControl: false,
      }).setView(initialCenter, initialZoom);

      tileLayerRef.current = LL.tileLayer(TILE_DARK, { subdomains: 'abcd', maxZoom: 19 }).addTo(m);

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
    tileLayerRef.current?.remove();
    tileLayerRef.current = L.tileLayer(lightMap ? TILE_LIGHT : TILE_DARK, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
  }, [lightMap, L, map]);

  return { L, map };
}
