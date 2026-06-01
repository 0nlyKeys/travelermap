import { useEffect, useRef, useState } from 'react';
import type * as LeafletType from 'leaflet';
import type { Parada, PuntoInteres, LatLng } from '@features/mapa/types/ruta';
import { fetchRoute } from '@features/mapa/lib/routeGeometry';
import { createMotoIcon, createStopLabelIcon, createPuntoInteresIcon } from '@features/mapa/lib/leafletIcons';
import { cumulativeDistances } from '@features/mapa/lib/distance';

export interface RouteBuilderHandle {
  loading: boolean;
  totalKm: string;
  /** Bumps every time the route is rebuilt — animation hook watches this to reset. */
  version: number;
  routeRef: React.MutableRefObject<LatLng[]>;
  distancesRef: React.MutableRefObject<number[]>;
  totalRef: React.MutableRefObject<number>;
  motoMarkerRef: React.MutableRefObject<LeafletType.Marker | null>;
  traveledLineRef: React.MutableRefObject<LeafletType.Polyline | null>;
  glowLineRef: React.MutableRefObject<LeafletType.Polyline | null>;
}

interface Opts {
  L: typeof LeafletType | null;
  map: LeafletType.Map | null;
  paradas: Parada[];
  puntosInteres?: PuntoInteres[];
  lightMap?: boolean;
  /** Pass false on the very first build to skip the fit — kept here for future use. */
  fitOnRebuild?: boolean;
}

/**
 * Owns route-related Leaflet layers (polylines, stop markers, moto marker).
 * Whenever paradas change, fetches the OSRM geometry and redraws everything.
 *
 * Returns refs to the layers so the animation hook can mutate positions
 * without going through React state (60fps friendly).
 */
export function useRouteBuilder({
  L,
  map,
  paradas,
  puntosInteres = [],
  lightMap = false,
  fitOnRebuild = true,
}: Opts): RouteBuilderHandle {
  const [loading, setLoading] = useState(true);
  const [totalKm, setTotalKm] = useState('—');
  const [version, setVersion] = useState(0);

  const routeRef = useRef<LatLng[]>([]);
  const distancesRef = useRef<number[]>([]);
  const totalRef = useRef(0);
  const motoMarkerRef = useRef<LeafletType.Marker | null>(null);
  const traveledLineRef = useRef<LeafletType.Polyline | null>(null);
  const glowLineRef = useRef<LeafletType.Polyline | null>(null);
  const fullRouteLineRef = useRef<LeafletType.Polyline | null>(null);
  const stopMarkersRef = useRef<LeafletType.CircleMarker[]>([]);
  const stopLabelsRef = useRef<LeafletType.Marker[]>([]);
  const poiLabelsRef = useRef<LeafletType.Marker[]>([]);
  const poiDotsRef = useRef<LeafletType.CircleMarker[]>([]);

  useEffect(() => {
    if (!L || !map) return;
    let cancelled = false;

    (async () => {
      // Clear old stop markers + labels
      stopMarkersRef.current.forEach((m) => map.removeLayer(m));
      stopLabelsRef.current.forEach((m) => map.removeLayer(m));
      stopMarkersRef.current = [];
      stopLabelsRef.current = [];

      // Draw stop labels + dots
      paradas.forEach((stop, i) => {
        const label = L.marker([stop.lat, stop.lng], {
          icon: createStopLabelIcon(L, i, stop.nombre),
          interactive: false,
        }).addTo(map);
        stopLabelsRef.current.push(label);

        const dot = L.circleMarker([stop.lat, stop.lng], {
          radius: 6,
          color: '#ff6b1a',
          fillColor: '#0a0a0a',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        stopMarkersRef.current.push(dot);
      });

      // < 2 stops: no route to draw
      if (paradas.length < 2) {
        if (fullRouteLineRef.current) {
          map.removeLayer(fullRouteLineRef.current);
          fullRouteLineRef.current = null;
        }
        if (traveledLineRef.current) {
          map.removeLayer(traveledLineRef.current);
          traveledLineRef.current = null;
        }
        if (glowLineRef.current) {
          map.removeLayer(glowLineRef.current);
          glowLineRef.current = null;
        }
        routeRef.current = [];
        distancesRef.current = [];
        totalRef.current = 0;
        setTotalKm('—');
        setLoading(false);
        setVersion((v) => v + 1);
        return;
      }

      setLoading(true);
      const { coords, distance: osrmDist } = await fetchRoute(paradas);
      if (cancelled) return;
      setLoading(false);

      routeRef.current = coords;
      const { distances, total } = cumulativeDistances(coords, (a, b) =>
        map.distance(a, b)
      );
      distancesRef.current = distances;
      totalRef.current = total;
      const totalKmCalc = osrmDist ? osrmDist / 1000 : total / 1000;
      setTotalKm(totalKmCalc.toFixed(0));

      // Recreate route polylines
      if (fullRouteLineRef.current) map.removeLayer(fullRouteLineRef.current);
      if (traveledLineRef.current) map.removeLayer(traveledLineRef.current);
      if (glowLineRef.current) map.removeLayer(glowLineRef.current);

      fullRouteLineRef.current = L.polyline(coords, {
        color: '#666',
        weight: 1.5,
        opacity: 0.5,
        dashArray: '3 6',
      }).addTo(map);

      glowLineRef.current = L.polyline([], {
        color: '#ff6b1a',
        weight: 10,
        opacity: 0.25,
        lineCap: 'round',
      }).addTo(map);

      traveledLineRef.current = L.polyline([], {
        color: '#ff6b1a',
        weight: 3,
        opacity: 1,
        lineCap: 'round',
      }).addTo(map);

      // Moto marker (reuse if already created)
      if (!motoMarkerRef.current) {
        motoMarkerRef.current = L.marker(coords[0], {
          icon: createMotoIcon(L),
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        motoMarkerRef.current.setLatLng(coords[0]);
      }

      if (fitOnRebuild) {
        setTimeout(() => {
          if (!cancelled && map) {
            map.fitBounds(L.latLngBounds(coords), {
              padding: [100, 100],
              animate: true,
            });
          }
        }, 100);
      }

      setVersion((v) => v + 1);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, map, paradas]);

  useEffect(() => {
    if (!L || !map) return;

    poiLabelsRef.current.forEach((m) => map.removeLayer(m));
    poiDotsRef.current.forEach((m) => map.removeLayer(m));
    poiLabelsRef.current = [];
    poiDotsRef.current = [];

    const dotColor = lightMap ? 'rgba(10,10,10,0.7)' : 'rgba(245,245,245,0.8)';

    puntosInteres.forEach((poi) => {
      const label = L.marker([poi.lat, poi.lng], {
        icon: createPuntoInteresIcon(L, poi.nombre, lightMap),
        interactive: false,
      }).addTo(map);
      poiLabelsRef.current.push(label);

      const dot = L.circleMarker([poi.lat, poi.lng], {
        radius: 4,
        color: dotColor,
        fillColor: dotColor,
        fillOpacity: 1,
        weight: 1.5,
      }).addTo(map);
      poiDotsRef.current.push(dot);
    });
  }, [L, map, puntosInteres, lightMap]);

  return {
    loading,
    totalKm,
    version,
    routeRef,
    distancesRef,
    totalRef,
    motoMarkerRef,
    traveledLineRef,
    glowLineRef,
  };
}
